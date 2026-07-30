import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all invoices (or filtered by clientId if CLIENT role)
export const getInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let whereClause = {};

    if (req.user.role === 'CLIENT') {
      const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
      if (!client) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }
      whereClause = { clientId: client.id };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

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

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: 'Assigned client profile not found' });
      return;
    }

    // Auto-generate invoice number if not provided
    const invNum = invoiceNumber
      ? invoiceNumber.trim()
      : `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
    const assignedStatus = status && validStatuses.includes(status) ? status : 'PENDING';

    const invoice = await prisma.invoice.create({
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

    const validStatuses = ['PENDING', 'PAID', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid invoice status' });
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
        payments: true,
      },
    });

    res.status(200).json({ message: 'Invoice status updated', invoice });
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

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    // Auto mark invoice as PAID if payments equal or exceed amount
    const totalPayments = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true },
    });

    let updatedInvoice = invoice;
    if ((totalPayments._sum.amount || 0) >= invoice.amount) {
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment,
      invoice: updatedInvoice,
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

    await prisma.invoice.delete({ where: { id: invoiceId } });
    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};
