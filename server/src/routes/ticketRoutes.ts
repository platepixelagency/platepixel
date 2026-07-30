import { Router } from 'express';
import { 
  getTickets, 
  createTicket, 
  updateTicketStatus, 
  deleteTicket 
} from '../controllers/ticketController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Accessible by Admin, Team, and Client
router.get('/', getTickets);
router.post('/', createTicket);

// Admin & Team status updates & deletion
router.patch('/:id/status', requireRole(['ADMIN', 'TEAM_MEMBER']), updateTicketStatus);
router.delete('/:id', requireRole(['ADMIN']), deleteTicket);

export default router;
