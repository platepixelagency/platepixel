import { Response } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get unified Client Portal Summary with Auto-Provisioning fallback
export const getClientPortalSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let client: any = null;

    // 1. Try Prisma lookup
    try {
      client = await prisma.client.findUnique({
        where: { userId: req.user.userId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          projects: { orderBy: { createdAt: 'desc' } },
          invoices: { include: { payments: true }, orderBy: { createdAt: 'desc' } },
          tickets: { orderBy: { createdAt: 'desc' } },
          documents: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (e) {}

    // 2. Try Supabase JS lookup if Prisma returned null
    if (!client) {
      try {
        const { data: supaClient } = await supabase
          .from('clients')
          .select('*, user:users(*)')
          .eq('user_id', req.user.userId)
          .maybeSingle();

        if (supaClient) {
          const { data: projects } = await supabase.from('projects').select('*').eq('client_id', supaClient.id);
          const { data: invoices } = await supabase.from('invoices').select('*, payments(*)').eq('client_id', supaClient.id);
          const { data: tickets } = await supabase.from('tickets').select('*').eq('client_id', supaClient.id);
          const { data: documents } = await supabase.from('documents').select('*').eq('client_id', supaClient.id);

          client = {
            id: supaClient.id,
            userId: supaClient.user_id,
            companyName: supaClient.company_name,
            phone: supaClient.phone || '',
            address: supaClient.address || '',
            renewalDate: supaClient.renewal_date,
            user: supaClient.user ? { id: supaClient.user.id, name: supaClient.user.name, email: supaClient.user.email } : { name: req.user.email, email: req.user.email },
            projects: projects || [],
            invoices: invoices || [],
            tickets: tickets || [],
            documents: documents || [],
          };
        }
      } catch (e) {}
    }

    // 3. Auto-Provision Client Profile if missing
    if (!client) {
      const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const userEmail = req.user.email || 'client@platepixel.com';
      const userName = userEmail.split('@')[0];
      const companyName = `${userName.charAt(0).toUpperCase() + userName.slice(1)}'s Business`;
      const renewalDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      try {
        await supabase.from('clients').upsert({
          id: clientId,
          user_id: req.user.userId,
          company_name: companyName,
          phone: '',
          address: 'PlatePixel Client Workspace',
          renewal_date: renewalDate,
        });
      } catch (e) {}

      try {
        await prisma.client.create({
          data: {
            id: clientId,
            userId: req.user.userId,
            companyName,
            phone: '',
            address: 'PlatePixel Client Workspace',
            renewalDate: new Date(renewalDate),
          },
        });
      } catch (e) {}

      client = {
        id: clientId,
        userId: req.user.userId,
        companyName,
        phone: '',
        address: 'PlatePixel Client Workspace',
        renewalDate,
        user: { id: req.user.userId, name: userName, email: userEmail },
        projects: [],
        invoices: [],
        tickets: [],
        documents: [],
      };
    }

    const projectsList = client.projects || [];
    const invoicesList = client.invoices || [];
    const ticketsList = client.tickets || [];
    const documentsList = client.documents || [];

    const totalInvoiced = invoicesList.reduce((sum: number, inv: any) => sum + (parseFloat(inv.amount) || 0), 0);
    const totalPaid = invoicesList.filter((i: any) => i.status === 'PAID').reduce((sum: number, inv: any) => sum + (parseFloat(inv.amount) || 0), 0);
    const activeProjects = projectsList.filter((p: any) => p.status !== 'DELIVERED').length;
    const openTickets = ticketsList.filter((t: any) => t.status !== 'CLOSED').length;

    res.status(200).json({
      summary: {
        client,
        metrics: {
          totalInvoiced,
          totalPaid,
          pendingBalance: totalInvoiced - totalPaid,
          activeProjects,
          openTickets,
          totalDocuments: documentsList.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching client portal summary:', error);
    res.status(500).json({ error: 'Failed to fetch client portal details' });
  }
};

// Create a Document for a client
export const createDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clientId, title, fileUrl, fileType } = req.body;

    if (!title || !fileUrl) {
      res.status(400).json({ error: 'Document title and file URL are required' });
      return;
    }

    let targetClientId = clientId;

    if (req.user?.role === 'CLIENT') {
      const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
      if (client) targetClientId = client.id;
    }

    if (!targetClientId) {
      res.status(400).json({ error: 'Target client ID is required' });
      return;
    }

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let document: any = null;

    try {
      document = await prisma.document.create({
        data: {
          clientId: targetClientId,
          title: title.trim(),
          fileUrl,
          fileType: fileType || 'PDF',
        },
      });
    } catch (e) {}

    try {
      const { data: supaDoc } = await supabase.from('documents').insert({
        id: document?.id || docId,
        client_id: targetClientId,
        title: title.trim(),
        file_url: fileUrl,
        file_type: fileType || 'PDF',
      }).select().single();

      if (!document && supaDoc) document = supaDoc;
    } catch (e) {}

    res.status(201).json({ message: 'Document added successfully', document: document || { title, fileUrl } });
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to add document' });
  }
};
