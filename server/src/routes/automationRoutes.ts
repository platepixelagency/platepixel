import { Router } from 'express';
import { getLogs, triggerRenewalCheck, sendTestEmail } from '../controllers/automationController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'TEAM_MEMBER']));

router.get('/logs', getLogs);
router.post('/trigger-renewals', triggerRenewalCheck);
router.post('/test-email', sendTestEmail);

export default router;
