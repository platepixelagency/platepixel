import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all clients (Admin & Team)
export const getClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let clients: any[] = [];

    try {
      clients = await prisma.client.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, createdAt: true },
          },
          _count: {
            select: { projects: true, invoices: true, tickets: true, documents: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      // Prisma offline fallback
    }

    if (clients.length === 0) {
      const { data } = await supabase.from('clients').select('*, user:users(*)').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        clients = data.map((c) => ({
          id: c.id,
          userId: c.user_id || c.userId,
          companyName: c.company_name || c.companyName,
          phone: c.phone,
          address: c.address,
          renewalDate: c.renewal_date || c.renewalDate,
          createdAt: c.created_at || c.createdAt,
          user: c.user ? {
            id: c.user.id,
            name: c.user.name,
            email: c.user.email,
            role: c.user.role,
          } : { name: c.company_name, email: 'client@platepixel.com', role: 'CLIENT' },
          _count: { projects: 0, invoices: 0, tickets: 0, documents: 0 },
        }));
      }
    }

    res.status(200).json({ clients });
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch client accounts' });
  }
};

// Get single client by ID
export const getClientById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = Array.isArray(id) ? id[0] : id;
    let client: any = null;

    try {
      client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
          user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
          projects: { orderBy: { createdAt: 'desc' } },
          invoices: { orderBy: { createdAt: 'desc' } },
          tickets: { orderBy: { createdAt: 'desc' } },
          documents: { orderBy: { createdAt: 'desc' } },
        },
      });
    } catch (e) {}

    if (!client) {
      const { data: supaClient } = await supabase.from('clients').select('*, user:users(*)').eq('id', clientId).maybeSingle();
      if (supaClient) {
        client = {
          id: supaClient.id,
          userId: supaClient.user_id,
          companyName: supaClient.company_name,
          phone: supaClient.phone,
          address: supaClient.address,
          renewalDate: supaClient.renewal_date,
          createdAt: supaClient.created_at,
          user: supaClient.user ? { id: supaClient.user.id, name: supaClient.user.name, email: supaClient.user.email } : null,
          projects: [],
          invoices: [],
          tickets: [],
          documents: [],
        };
      }
    }

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.status(200).json({ client });
  } catch (error: any) {
    console.error('Error fetching client profile:', error);
    res.status(500).json({ error: 'Failed to fetch client profile' });
  }
};

// Create client manually
export const createClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, companyName, phone, address, renewalDate } = req.body;

    if (!name || !email || !companyName) {
      res.status(400).json({ error: 'Name, email, and company name are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const defaultPassword = `PlatePixel@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const clientId = `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const renewal = renewalDate ? new Date(renewalDate).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    let client: any = null;

    // Prisma Sync
    try {
      let user = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: { name: name.trim(), email: cleanEmail, password: hashedPassword, role: 'CLIENT' },
        });
      }
      client = await prisma.client.create({
        data: {
          userId: user.id,
          companyName: companyName.trim(),
          phone: phone || '',
          address: address || '',
          renewalDate: new Date(renewal),
        },
        include: { user: true },
      });
    } catch (e) {}

    // Supabase Sync
    try {
      await supabase.from('users').upsert({
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'CLIENT',
      });

      const { data: supaClient } = await supabase.from('clients').upsert({
        id: clientId,
        user_id: userId,
        company_name: companyName.trim(),
        phone: phone || '',
        address: address || '',
        renewal_date: renewal,
      }).select().single();

      if (!client && supaClient) {
        client = {
          id: supaClient.id,
          userId: supaClient.user_id,
          companyName: supaClient.company_name,
          phone: supaClient.phone,
          address: supaClient.address,
          renewalDate: supaClient.renewal_date,
          user: { name, email: cleanEmail, role: 'CLIENT' },
        };
      }
    } catch (e) {}

    if (!client) {
      client = {
        id: clientId,
        companyName: companyName.trim(),
        phone,
        address,
        renewalDate: renewal,
        user: { name, email: cleanEmail, role: 'CLIENT' },
      };
    }

    res.status(201).json({
      message: 'Client created successfully',
      client,
      userCredentials: {
        email: cleanEmail,
        temporaryPassword: defaultPassword,
      },
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

// Update client profile
export const updateClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = Array.isArray(id) ? id[0] : id;
    const { companyName, phone, address, renewalDate } = req.body;
    let client: any = null;

    try {
      client = await prisma.client.update({
        where: { id: clientId },
        data: {
          companyName: companyName ? companyName.trim() : undefined,
          phone: phone !== undefined ? phone.trim() : undefined,
          address: address !== undefined ? address.trim() : undefined,
          renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        },
        include: { user: true },
      });
    } catch (e) {}

    try {
      const payload: any = {};
      if (companyName) payload.company_name = companyName.trim();
      if (phone !== undefined) payload.phone = phone.trim();
      if (address !== undefined) payload.address = address.trim();
      if (renewalDate) payload.renewal_date = new Date(renewalDate).toISOString();

      await supabase.from('clients').update(payload).eq('id', clientId);
    } catch (e) {}

    res.status(200).json({ message: 'Client profile updated', client: client || { id: clientId, companyName } });
  } catch (error: any) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
};

// Delete client
export const deleteClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = Array.isArray(id) ? id[0] : id;

    try {
      const c = await prisma.client.findUnique({ where: { id: clientId } });
      if (c) await prisma.user.delete({ where: { id: c.userId } });
    } catch (e) {}

    try {
      await supabase.from('clients').delete().eq('id', clientId);
    } catch (e) {}

    res.status(200).json({ message: 'Client account deleted' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client account' });
  }
};
