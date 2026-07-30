import { Router } from 'express';
import {
  getServices, createService, deleteService,
  getPricing, createPricing, deletePricing,
  getPortfolio, createPortfolio, deletePortfolio,
} from '../controllers/catalogController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes for website pages
router.get('/services', getServices);
router.get('/pricing', getPricing);
router.get('/portfolio', getPortfolio);

// Protected admin routes for management
router.post('/services', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createService);
router.delete('/services/:id', authenticateToken, requireRole(['ADMIN']), deleteService);

router.post('/pricing', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createPricing);
router.delete('/pricing/:id', authenticateToken, requireRole(['ADMIN']), deletePricing);

router.post('/portfolio', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createPortfolio);
router.delete('/portfolio/:id', authenticateToken, requireRole(['ADMIN']), deletePortfolio);

export default router;
