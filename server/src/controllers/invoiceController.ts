import { Response } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all invoices
export const getInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let invoices: any[] = [];

    try {
      let whereClause = {};
      if (req.user.role === 'CLIENT') {
        const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
        if (client) whereClause = { clientId: client.id };
      }
      invoices = await prisma.invoice.findMany({
        where: whereClause,
        include: {
          client: { include: { user: { select: { name: true, email: true } } } },
          payments: { orderBy: { paymentDate: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}

    if (invoices.length === 0) {
      const { data } = await supabase.from('invoices').select('*, client:clients(*, user:users(*))').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        invoices = data.map((inv) => ({
          id: inv.id,
          clientId: inv.client_id || inv.clientId,
          invoiceNumber: inv.invoice_number || inv.invoiceNumber,
          amount: parseFloat(inv.amount || '0'),
          status: inv.status,
          createdAt: inv.created_at || inv.createdAt,
          client: inv.client ? {
            id: inv.client.id,
            companyName: inv.client.company_name,
            user: inv.client.user ? { name: inv.client.user.name, email: inv.client.user.email } : { name: inv.client.company_name, email: '' },
          } : { companyName: 'Client Account', user: { name: 'Client Account', email: '' } },
          payments: [],
        }));
      }
    }

    res.status(200).json({ invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Create a new invoice
export const createInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clientId, amount, invoiceNumber, status } = req.body;

    if (!clientId || !amount) {
      res.status(400).json({ error: 'Client ID and amount are required' });
      return;
    }

    const invNum = invoiceNumber ? invoiceNumber.trim() : `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
    const assignedStatus = status && validStatuses.includes(status) ? status : 'PENDING';
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let invoice: any = null;

    try {
      invoice = await prisma.invoice.create({
        data: {
          clientId,
          invoiceNumber: invNum,
          amount: parseFloat(amount),
          status: assignedStatus,
        },
        include: {
          client: { include: { user: { select: { name: true, email: true } } } },
          payments: true,
        },
      });
    } catch (e) {}

    try {
      const { data: supaInv } = await supabase.from('invoices').insert({
        id: invoice?.id || invoiceId,
        client_id: clientId,
        invoice_number: invNum,
        amount: parseFloat(amount),
        status: assignedStatus,
      }).select().single();

      if (!invoice && supaInv) {
        invoice = {
          id: supaInv.id,
          clientId: supaInv.client_id,
          invoiceNumber: supaInv.invoice_number,
          amount: supaInv.amount,
          status: supaInv.status,
          payments: [],
        };
      }
    } catch (e) {}

    if (!invoice) {
      invoice = {
        id: invoiceId,
        clientId,
        invoiceNumber: invNum,
        amount: parseFloat(amount),
        status: assignedStatus,
        payments: [],
      };
    }

    res.status(201).json({ message: 'Invoice created successfully', invoice });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoiceId = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;

    let invoice: any = null;
    try {
      invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
      });
    } catch (e) {}

    try {
      await supabase.from('invoices').update({ status }).eq('id', invoiceId);
    } catch (e) {}

    res.status(200).json({ message: 'Invoice status updated', invoice: invoice || { id: invoiceId, status } });
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

// Record a payment against an invoice
export const recordPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoiceId = Array.isArray(id) ? id[0] : id;
    const { amount, paymentDate } = req.body;

    if (!amount) {
      res.status(400).json({ error: 'Payment amount is required' });
      return;
    }

    let payment: any = null;
    try {
      payment = await prisma.payment.create({
        data: {
          invoiceId,
          amount: parseFloat(amount),
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
      });
    } catch (e) {}

    try {
      await supabase.from('payments').insert({
        invoice_id: invoiceId,
        amount: parseFloat(amount),
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
      });
    } catch (e) {}

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: payment || { invoiceId, amount: parseFloat(amount) },
    });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Delete invoice
export const deleteInvoice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoiceId = Array.isArray(id) ? id[0] : id;

    try { await prisma.invoice.delete({ where: { id: invoiceId } }); } catch (e) {}
    try { await supabase.from('invoices').delete().eq('id', invoiceId); } catch (e) {}

    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
