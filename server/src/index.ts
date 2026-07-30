import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
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
    res.status(200).json({
      status: 'healthy',
      platform: 'PlatePixel Agency Management API',
      database: 'connected',
      userCount,
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

// Auth Routes
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`⚡ PlatePixel API Server running on http://localhost:${PORT}`);
});
