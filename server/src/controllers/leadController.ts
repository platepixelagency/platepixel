import { Request, Response } from 'express';
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
