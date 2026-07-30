import { Response, Request } from 'express';
import { prisma } from '../prisma.js';

// --- SERVICES CRUD ---
export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.agencyService.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ services });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch agency services' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, price, description, features, isPopular } = req.body;
    const service = await prisma.agencyService.create({
      data: {
        title: title.trim(),
        category: category || 'Web Development',
        price: price || '$499',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        isPopular: !!isPopular,
      },
    });
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    await prisma.agencyService.delete({ where: { id: serviceId } });
    res.status(200).json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// --- PRICING CRUD ---
export const getPricing = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pricing = await prisma.agencyPricing.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ pricing });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

export const createPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, price, period, description, features, highlighted } = req.body;
    const plan = await prisma.agencyPricing.create({
      data: {
        title: title.trim(),
        price: price || '$499',
        period: period || 'one-time',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        highlighted: !!highlighted,
      },
    });
    res.status(201).json({ message: 'Pricing plan created', plan });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
};

export const deletePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const planId = Array.isArray(id) ? id[0] : id;
    await prisma.agencyPricing.delete({ where: { id: planId } });
    res.status(200).json({ message: 'Pricing plan deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
};

// --- PORTFOLIO CRUD ---
export const getPortfolio = async (_req: Request, res: Response): Promise<void> => {
  try {
    const portfolio = await prisma.agencyPortfolio.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ portfolio });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch portfolio projects' });
  }
};

export const createPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, clientName, imageUrl, liveUrl, tags } = req.body;
    const project = await prisma.agencyPortfolio.create({
      data: {
        title: title.trim(),
        category: category || 'Web Application',
        clientName: clientName || 'Client Project',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        liveUrl: liveUrl || '#',
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      },
    });
    res.status(201).json({ message: 'Portfolio item created', project });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create portfolio item' });
  }
};

export const deletePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;
    await prisma.agencyPortfolio.delete({ where: { id: projectId } });
    res.status(200).json({ message: 'Portfolio item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
};
