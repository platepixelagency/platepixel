import { Router } from 'express';
import { 
  createLead, 
  getLeads, 
  updateLeadStatus, 
  convertLeadToClient, 
  deleteLead 
} from '../controllers/leadController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public route for lead submission from website
router.post('/', createLead);

// Protected routes for Admin & Team
router.get('/', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), getLeads);
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), updateLeadStatus);
router.post('/:id/convert', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), convertLeadToClient);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'TEAM_MEMBER']), deleteLead);

export default router;
