import { Router } from 'express';
import { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} from '../controllers/clientController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// All client endpoints require authentication
router.use(authenticateToken);

// Admin & Team endpoints
router.get('/', requireRole(['ADMIN', 'TEAM_MEMBER']), getClients);
router.get('/:id', requireRole(['ADMIN', 'TEAM_MEMBER', 'CLIENT']), getClientById);
router.post('/', requireRole(['ADMIN', 'TEAM_MEMBER']), createClient);
router.put('/:id', requireRole(['ADMIN', 'TEAM_MEMBER']), updateClient);
router.delete('/:id', requireRole(['ADMIN']), deleteClient);

export default router;
