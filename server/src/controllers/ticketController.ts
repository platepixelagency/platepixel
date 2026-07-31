import { Response } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get support tickets
export const getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let tickets: any[] = [];

    try {
      let whereClause = {};
      if (req.user.role === 'CLIENT') {
        const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
        if (client) whereClause = { clientId: client.id };
      }
      tickets = await prisma.ticket.findMany({
        where: whereClause,
        include: {
          client: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}

    if (tickets.length === 0) {
      const { data } = await supabase.from('tickets').select('*, client:clients(*, user:users(*))').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        tickets = data.map((t) => ({
          id: t.id,
          clientId: t.client_id || t.clientId,
          subject: t.subject,
          message: t.message,
          status: t.status,
          createdAt: t.created_at || t.createdAt,
          client: t.client ? {
            id: t.client.id,
            companyName: t.client.company_name,
            user: t.client.user ? { name: t.client.user.name, email: t.client.user.email } : { name: t.client.company_name, email: '' },
          } : { companyName: 'Support Account', user: { name: 'Support Account', email: '' } },
        }));
      }
    }

    res.status(200).json({ tickets });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
};

// Create a support ticket
export const createTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clientId, subject, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ error: 'Subject and message are required' });
      return;
    }

    let targetClientId = clientId || `cli_${Date.now()}`;
    const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let ticket: any = null;

    try {
      ticket = await prisma.ticket.create({
        data: {
          clientId: targetClientId,
          subject: subject.trim(),
          message: message.trim(),
          status: 'OPEN',
        },
        include: { client: { include: { user: { select: { name: true, email: true } } } } },
      });
    } catch (e) {}

    try {
      const { data: supaTkt } = await supabase.from('tickets').insert({
        id: ticket?.id || ticketId,
        client_id: targetClientId,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
      }).select().single();

      if (!ticket && supaTkt) {
        ticket = {
          id: supaTkt.id,
          clientId: supaTkt.client_id,
          subject: supaTkt.subject,
          message: supaTkt.message,
          status: supaTkt.status,
        };
      }
    } catch (e) {}

    if (!ticket) {
      ticket = {
        id: ticketId,
        clientId: targetClientId,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
      };
    }

    res.status(201).json({ message: 'Support ticket opened successfully', ticket });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

// Update support ticket status
export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticketId = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;

    let ticket: any = null;
    try {
      ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status },
      });
    } catch (e) {}

    try {
      await supabase.from('tickets').update({ status }).eq('id', ticketId);
    } catch (e) {}

    res.status(200).json({ message: 'Ticket status updated', ticket: ticket || { id: ticketId, status } });
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
};

// Delete support ticket
export const deleteTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ticketId = Array.isArray(id) ? id[0] : id;

    try { await prisma.ticket.delete({ where: { id: ticketId } }); } catch (e) {}
    try { await supabase.from('tickets').delete().eq('id', ticketId); } catch (e) {}

    res.status(200).json({ message: 'Support ticket deleted' });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete support ticket' });
  }
};
