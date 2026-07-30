import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all projects (or filtered by client if user is CLIENT role)
export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let whereClause = {};

    // If logged in as client, only fetch their own projects
    if (req.user.role === 'CLIENT') {
      const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
      if (!client) {
        res.status(404).json({ error: 'Client profile not found' });
        return;
      }
      whereClause = { clientId: client.id };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Create project assigned to a client
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { clientId, projectName, status, deliveryDate, description } = req.body;

    if (!clientId || !projectName || !deliveryDate) {
      res.status(400).json({ error: 'Client ID, project name, and delivery date are required' });
      return;
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      res.status(404).json({ error: 'Assigned client profile not found' });
      return;
    }

    const validStatuses = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'DELIVERED'];
    const assignedStatus = status && validStatuses.includes(status) ? status : 'PLANNING';

    const project = await prisma.project.create({
      data: {
        clientId,
        projectName: projectName.trim(),
        status: assignedStatus,
        deliveryDate: new Date(deliveryDate),
        description: description || '',
      },
      include: {
        client: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project status
export const updateProjectStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;

    const validStatuses = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid project status' });
      return;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    res.status(200).json({ message: 'Project status updated', project });
  } catch (error: any) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: 'Failed to update project status' });
  }
};

// Edit project details
export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;
    const { projectName, deliveryDate, description, status } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        projectName: projectName ? projectName.trim() : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        description: description !== undefined ? description.trim() : undefined,
        status: status || undefined,
      },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    res.status(200).json({ message: 'Project updated', project });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const projectId = Array.isArray(id) ? id[0] : id;

    await prisma.project.delete({ where: { id: projectId } });
    res.status(200).json({ message: 'Project deleted' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
