import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Public API: Submit new lead from Public Website
export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, businessName, mobile, email, category, service, budget, message } = req.body;

    if (!name || !mobile || !email || !service) {
      res.status(400).json({ error: 'Name, mobile, email, and service are required' });
      return;
    }

    const lead = await prisma.lead.create({
      data: {
        name: name.trim(),
        businessName: (businessName || `${name}'s Business`).trim(),
        mobile: mobile.trim(),
        email: email.toLowerCase().trim(),
        category: category || 'General Business',
        service: service || 'Website Development',
        budget: budget || 'Not Specified',
        message: message || '',
        status: 'NEW',
      },
    });

    res.status(201).json({
      message: 'Lead captured successfully! Our team will get back to you shortly.',
      lead: {
        id: lead.id,
        name: lead.name,
        businessName: lead.businessName,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to submit lead request' });
  }
};

// Protected API: Get all leads (Admin & Team)
export const getLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ leads });
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

// Protected API: Update lead status
export const updateLeadStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid lead status' });
      return;
    }

    const leadId = Array.isArray(id) ? id[0] : id;
    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    res.status(200).json({ message: 'Lead status updated', lead });
  } catch (error: any) {
    console.error('Error updating lead status:', error);
    res.status(500).json({ error: 'Failed to update lead status' });
  }
};

// Protected API: 1-Click Lead-to-Client Conversion
export const convertLeadToClient = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leadId = Array.isArray(id) ? id[0] : id;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    // Check if user account with lead email already exists
    let user = await prisma.user.findUnique({
      where: { email: lead.email },
      include: { client: true },
    });

    let defaultPassword = '';

    if (!user) {
      // Create new client user account
      defaultPassword = `PlatePixel@${Math.floor(1000 + Math.random() * 9000)}`;
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      user = await prisma.user.create({
        data: {
          name: lead.name,
          email: lead.email,
          password: hashedPassword,
          role: 'CLIENT',
        },
        include: { client: true },
      });
    }

    // Check if Client profile exists for user
    let client = user.client;
    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          companyName: lead.businessName,
          phone: lead.mobile,
          address: 'Default Office Location',
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year Renewal
        },
      });
    }

    // Update lead status to WON
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'WON' },
    });

    res.status(200).json({
      message: 'Lead converted to Client successfully!',
      lead: updatedLead,
      client,
      userCredentials: {
        email: user.email,
        temporaryPassword: defaultPassword || 'Account already exists (Password unchanged)',
      },
    });
  } catch (error: any) {
    console.error('Error converting lead:', error);
    res.status(500).json({ error: 'Failed to convert lead to client' });
  }
};

// Protected API: Delete Lead
export const deleteLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leadId = Array.isArray(id) ? id[0] : id;

    await prisma.lead.delete({ where: { id: leadId } });
    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};
