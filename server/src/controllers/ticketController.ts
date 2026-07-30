import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get support tickets (or filtered by client if CLIENT role)
export const getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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

    let targetClientId = clientId;

    // If client user is creating, automatically resolve their client ID
    if (req.user?.role === 'CLIENT') {
      const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
      if (!client) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }
      targetClientId = client.id;
    }

    if (!targetClientId) {
      res.status(400).json({ error: 'Target Client ID is required' });
      return;
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId: targetClientId,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
      },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
      },
    });

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

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid ticket status' });
      return;
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    res.status(200).json({ message: 'Ticket status updated', ticket });
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

    await prisma.ticket.delete({ where: { id: ticketId } });
    res.status(200).json({ message: 'Support ticket deleted' });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete support ticket' });
  }
};
