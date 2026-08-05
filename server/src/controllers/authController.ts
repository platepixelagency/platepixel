import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { supabase } from '../supabase.js';
import { generateToken } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, companyName, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const assignedRole = role && ['ADMIN', 'TEAM_MEMBER', 'CLIENT'].includes(role) ? role : 'CLIENT';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const clientId = crypto.randomUUID();

    // 1. Check existing client in Supabase DB (portal_clients & users)
    try {
      const { data: existingPortalClient } = await supabase
        .from('portal_clients')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingPortalClient) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      const { data: existingSupaUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingSupaUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }
    } catch (e) {}

    let user: any = null;

    // 2. Primary Insert into Dedicated Supabase portal_clients Table
    try {
      const { data: newPortalClient, error: portalErr } = await supabase
        .from('portal_clients')
        .insert({
          id: userId,
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          company_name: companyName || `${cleanName}'s Business`,
          phone: phone || '',
          role: assignedRole,
        })
        .select()
        .maybeSingle();

      if (portalErr) {
        console.error('Supabase portal_clients insert notice:', portalErr.message);
      } else if (newPortalClient) {
        user = {
          id: newPortalClient.id,
          name: newPortalClient.name,
          email: newPortalClient.email,
          role: newPortalClient.role,
          companyName: newPortalClient.company_name,
          phone: newPortalClient.phone,
          createdAt: newPortalClient.created_at || new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.error('Supabase portal_clients insert exception:', err);
    }

    // 3. Mirror Insert into Supabase users & clients tables
    try {
      await supabase.from('users').upsert({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
      });

      if (assignedRole === 'CLIENT') {
        await supabase.from('clients').upsert({
          id: clientId,
          user_id: userId,
          company_name: companyName || `${cleanName}'s Business`,
          phone: phone || '',
          address: address || 'PlatePixel Client Workspace',
          renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } catch (e) {}

    // Fallback user object if user was not populated by portal_clients select
    if (!user) {
      user = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: assignedRole,
        companyName: companyName || `${cleanName}'s Business`,
        createdAt: new Date().toISOString(),
      };
    }

    // 4. Mirror Sync to Prisma ORM if Prisma is online
    try {
      await prisma.user.upsert({
        where: { email: cleanEmail },
        update: { password: hashedPassword, role: assignedRole },
        create: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          role: assignedRole,
        },
      });

      if (assignedRole === 'CLIENT') {
        await prisma.client.upsert({
          where: { userId },
          update: { companyName: companyName || `${cleanName}'s Business` },
          create: {
            id: clientId,
            userId,
            companyName: companyName || `${cleanName}'s Business`,
            phone: phone || '',
            address: address || '',
            renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } catch (e) {}

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
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    let user: any = null;

    // 1. Lookup in Supabase portal_clients DB Table
    try {
      const { data: portalClient } = await supabase
        .from('portal_clients')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (portalClient) {
        user = {
          id: portalClient.id,
          name: portalClient.name,
          email: portalClient.email,
          password: portalClient.password,
          role: portalClient.role || 'CLIENT',
          companyName: portalClient.company_name,
          phone: portalClient.phone,
          createdAt: portalClient.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {}

    // 2. Lookup in Supabase users DB Table if not found in portal_clients
    if (!user) {
      try {
        const { data: supaUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (supaUser) {
          user = {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            password: supaUser.password,
            role: supaUser.role,
            createdAt: supaUser.created_at || new Date().toISOString(),
          };
        }
      } catch (e) {}
    }

    // 3. Lookup in Prisma DB if not found in Supabase
    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { email: cleanEmail },
          include: { client: true },
        });
      } catch (e) {}
    }

    // STRICT CHECK: If user does NOT exist in database, DENY ACCESS!
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password. User profile not found in database.' });
      return;
    }

    // STRICT CHECK: Verify BCrypt password hash
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
        createdAt: user.createdAt || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    let user: any = null;

    try {
      const { data: portalClient } = await supabase
        .from('portal_clients')
        .select('*')
        .eq('id', req.user.userId)
        .maybeSingle();

      if (portalClient) {
        user = {
          id: portalClient.id,
          name: portalClient.name,
          email: portalClient.email,
          role: portalClient.role || 'CLIENT',
          companyName: portalClient.company_name,
          phone: portalClient.phone,
          createdAt: portalClient.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {}

    if (!user) {
      try {
        const { data: supaUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', req.user.userId)
          .maybeSingle();

        if (supaUser) {
          user = {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role,
            createdAt: supaUser.created_at || new Date().toISOString(),
          };
        }
      } catch (e) {}
    }

    if (!user) {
      try {
        user = await prisma.user.findUnique({
          where: { id: req.user.userId },
          include: { client: true },
        });
      } catch (e) {}
    }

    if (!user) {
      res.status(404).json({ error: 'User profile not found in database' });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: error.message || 'Internal server error fetching user profile' });
  }
};

export const seedDefaultAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminEmail = 'platepixelagency@gmail.com';
    const adminId = 'a0000000-0000-0000-0000-000000000001';
    const hashedPassword = await bcrypt.hash('Sonu@0431', 10);

    try {
      await supabase.from('portal_clients').upsert({
        id: adminId,
        name: 'PlatePixel Admin',
        email: adminEmail,
        password: hashedPassword,
        company_name: 'PlatePixel Agency HQ',
        phone: '+91 8510050467',
        role: 'ADMIN',
      });
    } catch (e) {}

    try {
      await supabase.from('users').upsert({
        id: adminId,
        name: 'PlatePixel Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      });
    } catch (e) {}

    try {
      await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: hashedPassword, role: 'ADMIN' },
        create: {
          id: adminId,
          name: 'PlatePixel Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    } catch (e) {}

    res.status(201).json({
      message: 'Default admin created successfully',
      credentials: {
        email: adminEmail,
        password: 'Sonu@0431',
        role: 'ADMIN',
      },
    });
  } catch (error: any) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: error.message || 'Error seeding admin' });
  }
};
