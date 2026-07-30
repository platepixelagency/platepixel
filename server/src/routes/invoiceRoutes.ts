import { Router } from 'express';
import { 
  getInvoices, 
  createInvoice, 
  updateInvoiceStatus, 
  recordPayment, 
  deleteInvoice 
} from '../controllers/invoiceController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Read endpoints accessible by Admin, Team, and Client
router.get('/', getInvoices);

// Write endpoints for Admin and Team Members
router.post('/', requireRole(['ADMIN', 'TEAM_MEMBER']), createInvoice);
router.patch('/:id/status', requireRole(['ADMIN', 'TEAM_MEMBER']), updateInvoiceStatus);
router.post('/:id/payments', requireRole(['ADMIN', 'TEAM_MEMBER']), recordPayment);
router.delete('/:id', requireRole(['ADMIN']), deleteInvoice);

export default router;
