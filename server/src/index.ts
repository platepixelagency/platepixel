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
import { prisma } from './prisma.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check API
app.get('/api/health', async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    const leadCount = await prisma.lead.count();
    const clientCount = await prisma.client.count();
    const projectCount = await prisma.project.count();
    const invoiceCount = await prisma.invoice.count();
    const ticketCount = await prisma.ticket.count();
    res.status(200).json({
      status: 'healthy',
      platform: 'PlatePixel Agency Management API',
      database: 'connected',
      userCount,
      leadCount,
      clientCount,
      projectCount,
      invoiceCount,
      ticketCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/portal', clientPortalRoutes);
app.use('/api/tickets', ticketRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`⚡ PlatePixel API Server running on http://localhost:${PORT}`);
});
