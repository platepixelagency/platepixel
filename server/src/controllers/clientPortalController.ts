import { Response } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get unified Client Portal Summary for logged-in Client user
export const getClientPortalSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { userId: req.user.userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        projects: { orderBy: { createdAt: 'desc' } },
        invoices: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        },
        tickets: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Client profile not found for this user account' });
      return;
    }

    // Calculate metrics
    const totalInvoiced = client.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = client.invoices.filter(i => i.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);
    const activeProjects = client.projects.filter(p => p.status !== 'DELIVERED').length;
    const openTickets = client.tickets.filter(t => t.status !== 'CLOSED').length;

    res.status(200).json({
      summary: {
        client,
        metrics: {
          totalInvoiced,
          totalPaid,
          pendingBalance: totalInvoiced - totalPaid,
          activeProjects,
          openTickets,
          totalDocuments: client.documents.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching client portal summary:', error);
    res.status(500).json({ error: 'Failed to fetch client portal details' });
  }
};

// Create a Document for a client (Admin or Client upload)
export const createDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clientId, fileName, fileUrl } = req.body;

    if (!fileName || !fileUrl) {
      res.status(400).json({ error: 'File name and file URL are required' });
      return;
    }

    let targetClientId = clientId;

    // If client is creating, automatically use their client ID
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

    const document = await prisma.document.create({
      data: {
        clientId: targetClientId,
        fileName: fileName.trim(),
        fileUrl: fileUrl.trim(),
      },
    });

    // Mirror insert into Supabase DB
    try {
      await supabase.from('documents').insert({
        id: document.id,
        client_id: document.clientId,
        file_name: document.fileName,
        file_url: document.fileUrl,
        created_at: document.createdAt.toISOString(),
      });
    } catch (err: any) {
      console.error('Supabase document insert sync error:', err);
    }

    res.status(201).json({ message: 'Document uploaded and saved to Supabase DB successfully', document });
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};
