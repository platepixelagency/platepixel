import { Response, Request } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';

// In-memory / dynamic Hero Stats & Metrics Banner state
export let currentHeroStats = {
  clientProjects: '24 Active',
  leadCrmWon: '₹14,85,000',
  maintenanceRenewals: '98% On Time',
  leadsGenerated: '100+',
  activeRetainers: '30+',
  uptimeSecurity: '99.9%',
  onTimeDelivery: '100%',
};

export const getHeroStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data } = await supabase.from('hero_stats').select('*').eq('id', 1).maybeSingle();
    if (data) {
      currentHeroStats = {
        clientProjects: data.client_projects || currentHeroStats.clientProjects,
        leadCrmWon: data.lead_crm_won || currentHeroStats.leadCrmWon,
        maintenanceRenewals: data.maintenance_renewals || currentHeroStats.maintenanceRenewals,
        leadsGenerated: data.leads_generated || currentHeroStats.leadsGenerated,
        activeRetainers: data.active_retainers || currentHeroStats.activeRetainers,
        uptimeSecurity: data.uptime_security || currentHeroStats.uptimeSecurity,
        onTimeDelivery: data.on_time_delivery || currentHeroStats.onTimeDelivery,
      };
    }
  } catch (err) {
    // Ignore read error
  }
  res.status(200).json({ stats: currentHeroStats });
};

export const updateHeroStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientProjects, leadCrmWon, maintenanceRenewals, leadsGenerated, activeRetainers, uptimeSecurity, onTimeDelivery } = req.body;
    if (clientProjects) currentHeroStats.clientProjects = clientProjects;
    if (leadCrmWon) currentHeroStats.leadCrmWon = leadCrmWon;
    if (maintenanceRenewals) currentHeroStats.maintenanceRenewals = maintenanceRenewals;
    if (leadsGenerated) currentHeroStats.leadsGenerated = leadsGenerated;
    if (activeRetainers) currentHeroStats.activeRetainers = activeRetainers;
    if (uptimeSecurity) currentHeroStats.uptimeSecurity = uptimeSecurity;
    if (onTimeDelivery) currentHeroStats.onTimeDelivery = onTimeDelivery;

    try {
      await supabase.from('hero_stats').update({
        client_projects: currentHeroStats.clientProjects,
        lead_crm_won: currentHeroStats.leadCrmWon,
        maintenance_renewals: currentHeroStats.maintenanceRenewals,
        leads_generated: currentHeroStats.leadsGenerated,
        active_retainers: currentHeroStats.activeRetainers,
        uptime_security: currentHeroStats.uptimeSecurity,
        on_time_delivery: currentHeroStats.onTimeDelivery,
        updated_at: new Date().toISOString(),
      }).eq('id', 1);
    } catch (supaErr: any) {
      console.error('Supabase hero_stats sync notice:', supaErr);
    }

    res.status(200).json({ message: 'Hero banner stats & metrics updated successfully', stats: currentHeroStats });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update hero stats' });
  }
};

// In-memory / dynamic Site Contact & Social Media Settings state
export let currentSiteSettings = {
  supportEmail: 'support@platepixel.com',
  supportPhone: '+1 (555) 019-2831',
  officeLocation: 'San Francisco & Remote Worldwide',
  twitterUrl: 'https://x.com/platepixel',
  twitterVisible: true,
  facebookUrl: 'https://facebook.com/platepixel',
  facebookVisible: true,
  instagramUrl: 'https://instagram.com/platepixel',
  instagramVisible: true,
  githubUrl: 'https://github.com/platepixelagency',
  githubVisible: true,
  whatsappUrl: 'https://wa.me/15550192831',
  whatsappVisible: true,
  showSocialBar: true,
};

export const getSiteSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) {
      currentSiteSettings = {
        supportEmail: data.support_email ?? currentSiteSettings.supportEmail,
        supportPhone: data.support_phone ?? currentSiteSettings.supportPhone,
        officeLocation: data.office_location ?? currentSiteSettings.officeLocation,
        twitterUrl: data.twitter_url ?? currentSiteSettings.twitterUrl,
        twitterVisible: data.twitter_visible ?? currentSiteSettings.twitterVisible,
        facebookUrl: data.facebook_url ?? currentSiteSettings.facebookUrl,
        facebookVisible: data.facebook_visible ?? currentSiteSettings.facebookVisible,
        instagramUrl: data.instagram_url ?? currentSiteSettings.instagramUrl,
        instagramVisible: data.instagram_visible ?? currentSiteSettings.instagramVisible,
        githubUrl: data.github_url ?? currentSiteSettings.githubUrl,
        githubVisible: data.github_visible ?? currentSiteSettings.githubVisible,
        whatsappUrl: data.whatsapp_url ?? currentSiteSettings.whatsappUrl,
        whatsappVisible: data.whatsapp_visible ?? currentSiteSettings.whatsappVisible,
        showSocialBar: data.show_social_bar ?? currentSiteSettings.showSocialBar,
      };
    }
  } catch (err) {
    // Ignore read error
  }
  res.status(200).json({ settings: currentSiteSettings });
};

export const updateSiteSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      supportEmail, supportPhone, officeLocation,
      twitterUrl, twitterVisible,
      facebookUrl, facebookVisible,
      instagramUrl, instagramVisible,
      githubUrl, githubVisible,
      whatsappUrl, whatsappVisible,
      showSocialBar,
    } = req.body;

    if (supportEmail !== undefined) currentSiteSettings.supportEmail = supportEmail;
    if (supportPhone !== undefined) currentSiteSettings.supportPhone = supportPhone;
    if (officeLocation !== undefined) currentSiteSettings.officeLocation = officeLocation;
    if (twitterUrl !== undefined) currentSiteSettings.twitterUrl = twitterUrl;
    if (twitterVisible !== undefined) currentSiteSettings.twitterVisible = twitterVisible;
    if (facebookUrl !== undefined) currentSiteSettings.facebookUrl = facebookUrl;
    if (facebookVisible !== undefined) currentSiteSettings.facebookVisible = facebookVisible;
    if (instagramUrl !== undefined) currentSiteSettings.instagramUrl = instagramUrl;
    if (instagramVisible !== undefined) currentSiteSettings.instagramVisible = instagramVisible;
    if (githubUrl !== undefined) currentSiteSettings.githubUrl = githubUrl;
    if (githubVisible !== undefined) currentSiteSettings.githubVisible = githubVisible;
    if (whatsappUrl !== undefined) currentSiteSettings.whatsappUrl = whatsappUrl;
    if (whatsappVisible !== undefined) currentSiteSettings.whatsappVisible = whatsappVisible;
    if (showSocialBar !== undefined) currentSiteSettings.showSocialBar = showSocialBar;

    try {
      await supabase.from('site_settings').update({
        support_email: currentSiteSettings.supportEmail,
        support_phone: currentSiteSettings.supportPhone,
        office_location: currentSiteSettings.officeLocation,
        twitter_url: currentSiteSettings.twitterUrl,
        twitter_visible: currentSiteSettings.twitterVisible,
        facebook_url: currentSiteSettings.facebookUrl,
        facebook_visible: currentSiteSettings.facebookVisible,
        instagram_url: currentSiteSettings.instagramUrl,
        instagram_visible: currentSiteSettings.instagramVisible,
        github_url: currentSiteSettings.githubUrl,
        github_visible: currentSiteSettings.githubVisible,
        whatsapp_url: currentSiteSettings.whatsappUrl,
        whatsapp_visible: currentSiteSettings.whatsappVisible,
        show_social_bar: currentSiteSettings.showSocialBar,
        updated_at: new Date().toISOString(),
      }).eq('id', 1);
    } catch (supaErr: any) {
      console.error('Supabase site_settings sync notice:', supaErr);
    }

    res.status(200).json({ message: 'Site contact & social settings updated successfully', settings: currentSiteSettings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update site settings' });
  }
};

// Default Seed Data
const DEFAULT_SERVICES = [
  {
    title: 'Business Website',
    category: 'Website Development',
    price: '$499',
    description: 'Professional 5-page business site with services showcase, client testimonials, lead capture form, and mobile optimization.',
    features: '5 Custom Pages,Mobile Responsive,Lead Intake Form,SEO Setup,Speed Optimized',
    isPopular: false,
  },
  {
    title: 'Restaurant Website & QR Menu',
    category: 'Food & Hospitality',
    price: '$799',
    description: 'Interactive digital menu with QR code scan, online table reservation, Google maps integration, and WhatsApp ordering.',
    features: 'Live QR Menu Engine,Table Booking System,WhatsApp Order Direct,Google Maps Sync,Menu Item Manager',
    isPopular: true,
  },
  {
    title: 'Wedding Website',
    category: 'Event Sites',
    price: '$399',
    description: 'Elegant wedding & event site with RSVP tracker, photo gallery, event itinerary, venue maps, and gift registry.',
    features: 'RSVP Guest Tracker,Photo & Video Gallery,Event Timeline,Venue Map & Directions,Gift Registry',
    isPopular: false,
  },
  {
    title: 'Portfolio Website',
    category: 'Creative & Showcase',
    price: '$299',
    description: 'Sleek personal portfolio for creators, designers, agencies, and freelancers to showcase work and win clients.',
    features: 'Interactive Portfolio Grid,Case Study Templates,Contact Form,Social Media Integration,Custom Branding',
    isPopular: false,
  },
  {
    title: 'School Website',
    category: 'Education',
    price: '$699',
    description: 'Comprehensive educational portal with admission forms, notice boards, staff directory, and event calendar.',
    features: 'Online Admission Intake,Digital Notice Board,Faculty Directory,Event Calendar,Parent Contact Hub',
    isPopular: false,
  },
  {
    title: 'Growth Retainer',
    category: 'Maintenance & Support',
    price: '$99/mo',
    description: 'Continuous monthly web maintenance, automated daily backups, SSL renewal, content edits, and performance audits.',
    features: 'Managed Hosting Included,24/7 Security Patches,SSL Certificate,Unlimited Content Updates,Monthly Performance Reports',
    isPopular: true,
  },
  {
    title: 'Custom Web App',
    category: 'Custom Software',
    price: '$1,499+',
    description: 'Bespoke web application with custom user portals, database integration, API endpoints, and scalable cloud architecture.',
    features: 'Custom React & Node.js Engine,Client Portal,Stripe Payment Gateway,Role-Based Auth,Database Architecture',
    isPopular: true,
  },
  {
    title: 'CRM Development',
    category: 'Enterprise Software',
    price: '$1,999+',
    description: 'Tailored Customer Relationship Management software for sales tracking, lead funnels, automated invoicing, and analytics.',
    features: 'Sales Pipeline Kanban,Automated Client Notifications,Custom Reports,Invoice & Billing Engine,Multi-User Permissions',
    isPopular: false,
  },
];

const DEFAULT_PRICING = [
  {
    title: 'Starter Site',
    price: '₹14,999',
    period: 'one-time',
    description: 'Perfect for small local businesses needing a fast, modern digital footprint.',
    features: '5 Custom Pages,Mobile & Tablet Optimized,Lead Intake Contact Form,Basic Local SEO Setup,1 Year Free Domain Guidance',
    highlighted: false,
  },
  {
    title: 'Growth Retainer',
    price: '₹2,999',
    period: 'per month',
    description: 'Hands-off website maintenance, hosting, updates, and continuous growth support.',
    features: 'Managed Web Hosting Included,SSL Certificate & Security,Unlimited Content Edits,Monthly Performance & SEO Reports,24/7 Ticket Support Response',
    highlighted: true,
  },
  {
    title: 'Custom Web App',
    price: '₹49,999',
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
    let services: any[] = [];
    try {
      services = await prisma.agencyService.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {
      // Prisma error fallback
    }

    if (services.length === 0) {
      const { data } = await supabase.from('agency_services').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        services = data.map((s) => ({
          id: s.id,
          title: s.title,
          category: s.category,
          price: s.price,
          description: s.description,
          features: s.features,
          isPopular: s.is_popular || s.isPopular || false,
          createdAt: s.created_at || s.createdAt,
        }));
      }
    }

    res.status(200).json({ services });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch agency services' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, price, description, features, isPopular } = req.body;
    let service: any = null;

    try {
      service = await prisma.agencyService.create({
        data: {
          title: title.trim(),
          category: category || 'Web Development',
          price: price || '₹14,999',
          description: description || '',
          features: Array.isArray(features) ? features.join(',') : features || '',
          isPopular: !!isPopular,
        },
      });
    } catch (prismaErr) {
      console.warn('Prisma createService notice:', prismaErr);
    }

    try {
      const { data: supaService } = await supabase.from('agency_services').insert({
        id: service?.id,
        title: title.trim(),
        category: category || 'Web Development',
        price: price || '₹14,999',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        is_popular: !!isPopular,
      }).select().single();

      if (!service && supaService) {
        service = {
          id: supaService.id,
          title: supaService.title,
          category: supaService.category,
          price: supaService.price,
          description: supaService.description,
          features: supaService.features,
          isPopular: supaService.is_popular,
        };
      }
    } catch (supaErr) {
      console.error('Supabase createService notice:', supaErr);
    }

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
    let service: any = null;

    try {
      service = await prisma.agencyService.update({
        where: { id: serviceId },
        data: {
          title: title.trim(),
          category: category || 'Web Development',
          price: price || '₹14,999',
          description: description || '',
          features: Array.isArray(features) ? features.join(',') : features || '',
          isPopular: !!isPopular,
        },
      });
    } catch (e) {}

    try {
      await supabase.from('agency_services').update({
        title: title.trim(),
        category: category || 'Web Development',
        price: price || '₹14,999',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        is_popular: !!isPopular,
      }).eq('id', serviceId);
    } catch (e) {}

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const serviceId = Array.isArray(id) ? id[0] : id;
    try { await prisma.agencyService.delete({ where: { id: serviceId } }); } catch (e) {}
    try { await supabase.from('agency_services').delete().eq('id', serviceId); } catch (e) {}
    res.status(200).json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

// --- PRICING CRUD ---
export const getPricing = async (_req: Request, res: Response): Promise<void> => {
  try {
    let pricing: any[] = [];
    try {
      pricing = await prisma.agencyPricing.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {}

    if (pricing.length === 0) {
      const { data } = await supabase.from('agency_pricing').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        pricing = data.map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          period: p.period,
          description: p.description,
          features: p.features,
          highlighted: p.highlighted || false,
          createdAt: p.created_at || p.createdAt,
        }));
      }
    }

    res.status(200).json({ pricing });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

export const createPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, price, period, description, features, highlighted } = req.body;
    let plan: any = null;

    try {
      plan = await prisma.agencyPricing.create({
        data: {
          title: title.trim(),
          price: price || '₹14,999',
          period: period || 'one-time',
          description: description || '',
          features: Array.isArray(features) ? features.join(',') : features || '',
          highlighted: !!highlighted,
        },
      });
    } catch (e) {}

    try {
      const { data: supaPlan } = await supabase.from('agency_pricing').insert({
        id: plan?.id,
        title: title.trim(),
        price: price || '₹14,999',
        period: period || 'one-time',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        highlighted: !!highlighted,
      }).select().single();

      if (!plan && supaPlan) plan = supaPlan;
    } catch (e) {}

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
    let plan: any = null;

    try {
      plan = await prisma.agencyPricing.update({
        where: { id: planId },
        data: {
          title: title.trim(),
          price: price || '₹14,999',
          period: period || 'one-time',
          description: description || '',
          features: Array.isArray(features) ? features.join(',') : features || '',
          highlighted: !!highlighted,
        },
      });
    } catch (e) {}

    try {
      await supabase.from('agency_pricing').update({
        title: title.trim(),
        price: price || '₹14,999',
        period: period || 'one-time',
        description: description || '',
        features: Array.isArray(features) ? features.join(',') : features || '',
        highlighted: !!highlighted,
      }).eq('id', planId);
    } catch (e) {}

    res.status(200).json({ message: 'Pricing plan updated', plan });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
};

export const deletePricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const planId = Array.isArray(id) ? id[0] : id;
    try { await prisma.agencyPricing.delete({ where: { id: planId } }); } catch (e) {}
    try { await supabase.from('agency_pricing').delete().eq('id', planId); } catch (e) {}
    res.status(200).json({ message: 'Pricing plan deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
};

// --- PORTFOLIO CRUD ---
export const getPortfolio = async (_req: Request, res: Response): Promise<void> => {
  try {
    let portfolio: any[] = [];
    try {
      portfolio = await prisma.agencyPortfolio.findMany({ orderBy: { createdAt: 'desc' } });
    } catch (e) {}

    if (portfolio.length === 0) {
      const { data } = await supabase.from('agency_portfolio').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        portfolio = data.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          clientName: p.client_name || p.clientName,
          imageUrl: p.image_url || p.imageUrl,
          liveUrl: p.live_url || p.liveUrl,
          tags: p.tags,
          createdAt: p.created_at || p.createdAt,
        }));
      }
    }

    res.status(200).json({ portfolio });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch portfolio projects' });
  }
};

export const createPortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, clientName, imageUrl, liveUrl, tags } = req.body;
    let project: any = null;

    try {
      project = await prisma.agencyPortfolio.create({
        data: {
          title: title.trim(),
          category: category || 'Web Application',
          clientName: clientName || 'Client Project',
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
          liveUrl: liveUrl || '#',
          tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        },
      });
    } catch (e) {}

    try {
      const { data: supaProj } = await supabase.from('agency_portfolio').insert({
        id: project?.id,
        title: title.trim(),
        category: category || 'Web Application',
        client_name: clientName || 'Client Project',
        image_url: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        live_url: liveUrl || '#',
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      }).select().single();

      if (!project && supaProj) project = supaProj;
    } catch (e) {}

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
    let project: any = null;

    try {
      project = await prisma.agencyPortfolio.update({
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
    } catch (e) {}

    try {
      await supabase.from('agency_portfolio').update({
        title: title.trim(),
        category: category || 'Web Application',
        client_name: clientName || 'Client Project',
        image_url: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        live_url: liveUrl || '#',
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
      }).eq('id', projectId);
    } catch (e) {}

    res.status(200).json({ message: 'Portfolio item updated', project });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update portfolio item' });
  }
};

export const deletePortfolio = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;
    try { await prisma.agencyPortfolio.delete({ where: { id: projectId } }); } catch (e) {}
    try { await supabase.from('agency_portfolio').delete().eq('id', projectId); } catch (e) {}
    res.status(200).json({ message: 'Portfolio item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
};
