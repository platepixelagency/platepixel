import { Router } from 'express';
import { 
  getProjects, 
  createProject, 
  updateProjectStatus, 
  updateProject, 
  deleteProject 
} from '../controllers/projectController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// Read endpoints accessible by Admin, Team, and Client
router.get('/', getProjects);

// Write endpoints for Admin and Team Members
router.post('/', requireRole(['ADMIN', 'TEAM_MEMBER']), createProject);
router.patch('/:id/status', requireRole(['ADMIN', 'TEAM_MEMBER']), updateProjectStatus);
router.put('/:id', requireRole(['ADMIN', 'TEAM_MEMBER']), updateProject);
router.delete('/:id', requireRole(['ADMIN']), deleteProject);

export default router;
