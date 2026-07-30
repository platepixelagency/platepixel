import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all clients (Admin & Team)
export const getClients = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
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

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
        projects: { orderBy: { createdAt: 'desc' } },
        invoices: { orderBy: { createdAt: 'desc' } },
        tickets: { orderBy: { createdAt: 'desc' } },
        documents: { orderBy: { createdAt: 'desc' } },
      },
    });

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

    // Check existing user
    let user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    let defaultPassword = '';

    if (!user) {
      defaultPassword = `PlatePixel@${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'CLIENT',
        },
      });
    }

    // Check if client profile exists
    const existingClient = await prisma.client.findUnique({ where: { userId: user.id } });
    if (existingClient) {
      res.status(400).json({ error: 'Client profile already exists for this user' });
      return;
    }

    const renewal = renewalDate ? new Date(renewalDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        companyName: companyName.trim(),
        phone: phone || '',
        address: address || '',
        renewalDate: renewal,
      },
      include: { user: true },
    });

    res.status(201).json({
      message: 'Client created successfully',
      client,
      userCredentials: {
        email: user.email,
        temporaryPassword: defaultPassword || 'Account existing (password unchanged)',
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

    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        companyName: companyName ? companyName.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        address: address !== undefined ? address.trim() : undefined,
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      },
      include: { user: true },
    });

    res.status(200).json({ message: 'Client profile updated', client });
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

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    // Delete associated User (Cascade deletes Client)
    await prisma.user.delete({ where: { id: client.userId } });

    res.status(200).json({ message: 'Client account deleted' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client account' });
  }
};
