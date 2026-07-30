import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, companyName, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role && ['ADMIN', 'TEAM_MEMBER', 'CLIENT'].includes(role) ? role : 'CLIENT';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: assignedRole,
      },
    });

    // If client, create associated Client profile automatically
    if (assignedRole === 'CLIENT') {
      await prisma.client.create({
        data: {
          userId: user.id,
          companyName: companyName || `${user.name}'s Business`,
          phone: phone || '',
          address: address || '',
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year renewal
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEAM_MEMBER' | 'CLIENT',
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { client: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'ADMIN' | 'TEAM_MEMBER' | 'CLIENT',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        client: user.client || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        client: {
          include: {
            projects: true,
            invoices: true,
            tickets: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
};

export const seedDefaultAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminEmail = 'admin@platepixel.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (existingAdmin) {
      res.status(200).json({ message: 'Default admin user already exists', email: adminEmail });
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'PlatePixel Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Also seed a default test lead
    await prisma.lead.create({
      data: {
        name: 'John Doe',
        businessName: 'Apex Culinary Lounge',
        mobile: '+1 555-0192',
        email: 'john@apexlounge.com',
        category: 'Restaurant',
        service: 'Business Website + QR Menu',
        budget: '$1,500 - $3,000',
        message: 'We need a modern website with dynamic QR menu for our dining lounge.',
        status: 'NEW',
      },
    });

    res.status(201).json({
      message: 'Default admin created successfully',
      credentials: {
        email: adminEmail,
        password: 'Admin@123',
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: 'Error seeding admin' });
  }
};
