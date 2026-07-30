import { Router } from 'express';
import {
  getHeroStats, updateHeroStats,
  getServices, createService, updateService, deleteService,
  getPricing, createPricing, updatePricing, deletePricing,
  getPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
} from '../controllers/catalogController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/hero-stats', getHeroStats);
router.get('/services', getServices);
router.get('/pricing', getPricing);
router.get('/portfolio', getPortfolio);

// Admin routes for updating Homepage Hero Banner
router.post('/hero-stats', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), updateHeroStats);

// Protected admin routes for catalog management
router.post('/services', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createService);
router.put('/services/:id', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), updateService);
router.delete('/services/:id', authenticateToken, requireRole(['ADMIN']), deleteService);

router.post('/pricing', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createPricing);
router.put('/pricing/:id', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), updatePricing);
router.delete('/pricing/:id', authenticateToken, requireRole(['ADMIN']), deletePricing);

router.post('/portfolio', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), createPortfolio);
router.put('/portfolio/:id', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), updatePortfolio);
router.delete('/portfolio/:id', authenticateToken, requireRole(['ADMIN']), deletePortfolio);

export default router;
