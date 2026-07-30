import { Response, Request } from 'express';
import { prisma } from '../prisma.js';

// In-memory / dynamic Hero Stats state
export let currentHeroStats = {
  clientProjects: '24 Active',
  leadCrmWon: '$48,500',
  maintenanceRenewals: '98% On Time',
};

export const getHeroStats = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ stats: currentHeroStats });
};

export const updateHeroStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientProjects, leadCrmWon, maintenanceRenewals } = req.body;
    if (clientProjects) currentHeroStats.clientProjects = clientProjects;
    if (leadCrmWon) currentHeroStats.leadCrmWon = leadCrmWon;
    if (maintenanceRenewals) currentHeroStats.maintenanceRenewals = maintenanceRenewals;

    res.status(200).json({ message: 'Hero banner stats updated successfully', stats: currentHeroStats });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update hero stats' });
  }
};

// Default Seed Data
const DEFAULT_SERVICES = [
  {
    title: 'Starter Business Website',
    category: 'Website Development',
    price: '$499',
    description: 'Modern, ultra-fast 5-page responsive website designed for local businesses, restaurants, and service providers with lead intake form.',
    features: 'Responsive Mobile Design,SEO Optimized Meta Tags,Lead Capture Integration,Fast CDN Hosting,Contact & WhatsApp Form',
    isPopular: false,
  },
  {
    title: 'Restaurant Website & Live QR Menu',
    category: 'Food & Hospitality',
    price: '$799',
    description: 'Complete digital menu portal with dynamic QR code generator, table reservations, online order inquiry, and menu item updates.',
    features: 'Digital QR Code Menu,Dynamic Item Categories,Table Booking System,WhatsApp Order Direct,Google Maps & Review Sync',
    isPopular: true,
  },
  {
    title: 'Monthly Growth & Security Retainer',
    category: 'Maintenance & Retainer',
    price: '$99 / month',
    description: 'Hands-free technical maintenance including automated daily backups, SSL security renewal, regular content edits, and SEO audits.',
    features: 'Daily Automated Cloud Backups,24/7 Uptime Monitoring,Monthly Content Updates,SSL & Security Patches,Priority Helpdesk Support',
    isPopular: false,
  },
  {
    title: 'Custom Web Application & CRM',
    category: 'Custom Software',
    price: '$1,499+',
    description: 'Custom React & Node.js web applications, client portals, internal billing systems, and automated workflow software.',
    features: 'Custom Database & API Architecture,Role-Based Portal Access,Stripe / Invoice Payment Flow,Automated Email Notifications,Dedicated Codebase Repo',
    isPopular: true,
  },
];

const DEFAULT_PRICING = [
  {
    title: 'Starter Site',
    price: '$499',
    period: 'one-time',
    description: 'Perfect for small local businesses needing a fast, modern digital footprint.',
    features: '5 Custom Pages,Mobile & Tablet Optimized,Lead Intake Contact Form,Basic Local SEO Setup,1 Year Free Domain Guidance',
    highlighted: false,
  },
  {
    title: 'Growth Retainer',
    price: '$99',
    period: 'per month',
    description: 'Hands-off website maintenance, hosting, updates, and continuous growth support.',
    features: 'Managed Web Hosting Included,SSL Certificate & Security,Unlimited Content Edits,Monthly Performance & SEO Reports,24/7 Ticket Support Response',
    highlighted: true,
  },
  {
    title: 'Custom Web App',
    price: '$1,499',
    period: 'starting',
    description: 'Tailored SaaS products, interactive web software, custom CRMs, and API integrations.',
    features: 'Full-Stack React & Node.js Engine,Dedicated Client Portal,Custom Billing & Invoicing,API & Payment Gateways,Source Code Ownership',
    highlighted: false,
  },
];

const DEFAULT_PORTFOLIO = [
  {
    title: 'Apex Culinary Group Portal',
    category: 'Restaurant & Hospitality',
    clientName: 'Apex Culinary Group',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    liveUrl: '#',
    tags: 'React,Node.js,QR Menu,Table Booking',
  },
  {
    title: 'Rivers Bistro Digital Menu',
    category: 'Food & Beverage',
    clientName: 'Rivers Bistro',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    liveUrl: '#',
    tags: 'QR Code Engine,Order Direct,Tailwind CSS',
  },
  {
    title: 'Horizon Legal CRM System',
    category: 'Corporate Software',
    clientName: 'Horizon Legal Partners',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    liveUrl: '#',
    tags: 'Web Application,Client Portal,Invoice Engine',
  },
];

// --- SERVICES CRUD ---
export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    let services = await prisma.agencyService.findMany({ orderBy: { createdAt: 'desc' } });

    if (services.length === 0) {
      await prisma.agencyService.createMany({ data: DEFAULT_SERVICES });
      services = await prisma.agencyService.findMany({ orderBy: { createdAt: 'desc' } });
    }

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

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    const { title, category, price, description, features, isPopular } = req.body;

    const service = await prisma.agencyService.update({
      where: { id: serviceId },
      data: {
        title: title.trim(),
        category: category || 'Web Development',
        price: price || '$499',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        isPopular: !!isPopular,
      },
    });

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update service' });
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
    let pricing = await prisma.agencyPricing.findMany({ orderBy: { createdAt: 'desc' } });

    if (pricing.length === 0) {
      await prisma.agencyPricing.createMany({ data: DEFAULT_PRICING });
      pricing = await prisma.agencyPricing.findMany({ orderBy: { createdAt: 'desc' } });
    }

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

export const updatePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const planId = Array.isArray(id) ? id[0] : id;
    const { title, price, period, description, features, highlighted } = req.body;

    const plan = await prisma.agencyPricing.update({
      where: { id: planId },
      data: {
        title: title.trim(),
        price: price || '$499',
        period: period || 'one-time',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        highlighted: !!highlighted,
      },
    });

    res.status(200).json({ message: 'Pricing plan updated', plan });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update pricing plan' });
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
    let portfolio = await prisma.agencyPortfolio.findMany({ orderBy: { createdAt: 'desc' } });

    if (portfolio.length === 0) {
      await prisma.agencyPortfolio.createMany({ data: DEFAULT_PORTFOLIO });
      portfolio = await prisma.agencyPortfolio.findMany({ orderBy: { createdAt: 'desc' } });
    }

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

export const updatePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;
    const { title, category, clientName, imageUrl, liveUrl, tags } = req.body;

    const project = await prisma.agencyPortfolio.update({
      where: { id: projectId },
      data: {
        title: title.trim(),
        category: category || 'Web Application',
        clientName: clientName || 'Client Project',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        liveUrl: liveUrl || '#',
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      },
    });

    res.status(200).json({ message: 'Portfolio item updated', project });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update portfolio item' });
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
