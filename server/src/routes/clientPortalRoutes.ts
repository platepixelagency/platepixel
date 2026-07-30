import { Router } from 'express';
import { getClientPortalSummary, createDocument } from '../controllers/clientPortalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getClientPortalSummary);
router.post('/documents', createDocument);

export default router;
