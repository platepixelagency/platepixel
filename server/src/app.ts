import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import clientPortalRoutes from './routes/clientPortalRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import automationRoutes from './routes/automationRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import { prisma } from './prisma.js';

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json());

// Health Check API
app.get(['/api/health', '/health', '/api'], async (_req, res) => {
  let userCount = 0, leadCount = 0, clientCount = 0, projectCount = 0, invoiceCount = 0, ticketCount = 0, serviceCount = 0, pricingCount = 0, portfolioCount = 0;
  let dbStatus = 'connected';
  let dbError = undefined;

  try {
    userCount = await prisma.user.count();
    leadCount = await prisma.lead.count();
    clientCount = await prisma.client.count();
    projectCount = await prisma.project.count();
    invoiceCount = await prisma.invoice.count();
    ticketCount = await prisma.ticket.count();
    serviceCount = await prisma.agencyService.count();
    pricingCount = await prisma.agencyPricing.count();
    portfolioCount = await prisma.agencyPortfolio.count();
  } catch (error: any) {
    dbStatus = 'disconnected';
    dbError = error.message;
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    platform: 'PlatePixel Agency Management API',
    database: dbStatus,
    error: dbError,
    userCount,
    leadCount,
    clientCount,
    projectCount,
    invoiceCount,
    ticketCount,
    serviceCount,
    pricingCount,
    portfolioCount,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/leads', '/leads'], leadRoutes);
app.use(['/api/clients', '/clients'], clientRoutes);
app.use(['/api/projects', '/projects'], projectRoutes);
app.use(['/api/invoices', '/invoices'], invoiceRoutes);
app.use(['/api/portal', '/portal'], clientPortalRoutes);
app.use(['/api/tickets', '/tickets'], ticketRoutes);
app.use(['/api/automation', '/automation'], automationRoutes);
app.use(['/api/catalog', '/catalog'], catalogRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
