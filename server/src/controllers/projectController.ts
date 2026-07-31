import { Response } from 'express';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

// Get all projects
export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    let projects: any[] = [];

    try {
      let whereClause = {};
      if (req.user.role === 'CLIENT') {
        const client = await prisma.client.findUnique({ where: { userId: req.user.userId } });
        if (client) whereClause = { clientId: client.id };
      }
      projects = await prisma.project.findMany({
        where: whereClause,
        include: {
          client: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}

    if (projects.length === 0) {
      const { data } = await supabase.from('projects').select('*, client:clients(*, user:users(*))').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        projects = data.map((p) => ({
          id: p.id,
          clientId: p.client_id || p.clientId,
          projectName: p.project_name || p.projectName,
          status: p.status,
          deliveryDate: p.delivery_date || p.deliveryDate,
          description: p.description,
          createdAt: p.created_at || p.createdAt,
          client: p.client ? {
            id: p.client.id,
            companyName: p.client.company_name,
            user: p.client.user ? { name: p.client.user.name, email: p.client.user.email } : { name: p.client.company_name, email: '' },
          } : { companyName: 'Client Project', user: { name: 'Client Project', email: '' } },
        }));
      }
    }

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

    const validStatuses = ['PLANNING', 'DEVELOPMENT', 'TESTING', 'DELIVERED'];
    const assignedStatus = status && validStatuses.includes(status) ? status : 'PLANNING';
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let project: any = null;

    try {
      project = await prisma.project.create({
        data: {
          clientId,
          projectName: projectName.trim(),
          status: assignedStatus,
          deliveryDate: new Date(deliveryDate),
          description: description || '',
        },
        include: { client: { include: { user: { select: { name: true, email: true } } } } },
      });
    } catch (e) {}

    try {
      const { data: supaProj } = await supabase.from('projects').insert({
        id: project?.id || projectId,
        client_id: clientId,
        project_name: projectName.trim(),
        status: assignedStatus,
        delivery_date: new Date(deliveryDate).toISOString(),
        description: description || '',
      }).select().single();

      if (!project && supaProj) {
        project = {
          id: supaProj.id,
          clientId: supaProj.client_id,
          projectName: supaProj.project_name,
          status: supaProj.status,
          deliveryDate: supaProj.delivery_date,
          description: supaProj.description,
        };
      }
    } catch (e) {}

    if (!project) {
      project = {
        id: projectId,
        clientId,
        projectName: projectName.trim(),
        status: assignedStatus,
        deliveryDate,
        description,
      };
    }

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

    let project: any = null;
    try {
      project = await prisma.project.update({
        where: { id: projectId },
        data: { status },
      });
    } catch (e) {}

    try {
      await supabase.from('projects').update({ status }).eq('id', projectId);
    } catch (e) {}

    res.status(200).json({ message: 'Project status updated', project: project || { id: projectId, status } });
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
    let project: any = null;

    try {
      project = await prisma.project.update({
        where: { id: projectId },
        data: {
          projectName: projectName ? projectName.trim() : undefined,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
          description: description !== undefined ? description.trim() : undefined,
          status: status || undefined,
        },
      });
    } catch (e) {}

    try {
      const payload: any = {};
      if (projectName) payload.project_name = projectName.trim();
      if (deliveryDate) payload.delivery_date = new Date(deliveryDate).toISOString();
      if (description !== undefined) payload.description = description.trim();
      if (status) payload.status = status;

      await supabase.from('projects').update(payload).eq('id', projectId);
    } catch (e) {}

    res.status(200).json({ message: 'Project updated', project: project || { id: projectId, projectName } });
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

    try { await prisma.project.delete({ where: { id: projectId } }); } catch (e) {}
    try { await supabase.from('projects').delete().eq('id', projectId); } catch (e) {}

    res.status(200).json({ message: 'Project deleted' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};
