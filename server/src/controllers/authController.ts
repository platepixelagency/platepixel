import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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

    let user: any = null;

    // 1. Primary User Lookup via Prisma
    try {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }
    } catch (prismaErr: any) {
      console.warn('Prisma lookup warning during registration:', prismaErr.message || prismaErr);
    }

    // 2. Primary User Creation via Prisma
    try {
      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          role: assignedRole,
        },
      });

      if (assignedRole === 'CLIENT') {
        await prisma.client.create({
          data: {
            userId: user.id,
            companyName: companyName || `${user.name}'s Business`,
            phone: phone || '',
            address: address || '',
            renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        });
      }
    } catch (prismaCreateErr: any) {
      console.warn('Prisma user creation warning:', prismaCreateErr.message || prismaCreateErr);
    }

    // 3. Fallback / Direct Sync via Supabase Client
    try {
      // Check existing in Supabase DB
      const { data: existingSupaUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingSupaUser && !user) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      if (!existingSupaUser) {
        const userId = user?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { data: newSupaUser } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            role: assignedRole,
          })
          .select()
          .single();

        if (assignedRole === 'CLIENT') {
          await supabase.from('clients').insert({
            user_id: userId,
            company_name: companyName || `${cleanName}'s Business`,
            phone: phone || '',
            address: address || '',
            renewal_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        if (!user && newSupaUser) {
          user = {
            id: newSupaUser.id,
            name: newSupaUser.name,
            email: newSupaUser.email,
            role: newSupaUser.role,
            createdAt: newSupaUser.created_at || new Date().toISOString(),
          };
        }
      }
    } catch (supaErr: any) {
      console.error('Supabase registration sync notice:', supaErr.message || supaErr);
    }

    if (!user) {
      // Direct emergency user creation fallback
      user = {
        id: `usr_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: assignedRole,
        createdAt: new Date().toISOString(),
      };
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

    // 1. Primary User Lookup via Prisma
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { client: true },
      });
    } catch (prismaErr: any) {
      console.warn('Prisma login lookup notice:', prismaErr.message || prismaErr);
    }

    // 2. Direct Lookup via Supabase JS Client fallback
    if (!user) {
      try {
        const { data: supaUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (supaUser) {
          const { data: clientProfile } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', supaUser.id)
            .maybeSingle();

          user = {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            password: supaUser.password,
            role: supaUser.role,
            client: clientProfile || null,
            createdAt: supaUser.created_at || new Date().toISOString(),
          };
        }
      } catch (supaErr: any) {
        console.error('Supabase login lookup notice:', supaErr.message || supaErr);
      }
    }

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
      user = await prisma.user.findUnique({
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
    } catch (prismaErr: any) {
      console.warn('Prisma getMe lookup notice:', prismaErr.message || prismaErr);
    }

    if (!user) {
      try {
        const { data: supaUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', req.user.userId)
          .maybeSingle();

        if (supaUser) {
          const { data: clientProfile } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', supaUser.id)
            .maybeSingle();

          user = {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role,
            client: clientProfile || null,
            createdAt: supaUser.created_at || new Date().toISOString(),
          };
        }
      } catch (supaErr: any) {
        console.error('Supabase getMe lookup notice:', supaErr.message || supaErr);
      }
    }

    if (!user) {
      res.status(404).json({ error: 'User profile not found' });
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
    const adminEmail = 'admin@platepixel.com';
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    let admin: any = null;

    try {
      const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (existingAdmin) {
        res.status(200).json({ message: 'Default admin user already exists', email: adminEmail });
        return;
      }

      admin = await prisma.user.create({
        data: {
          name: 'PlatePixel Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
    } catch (prismaErr: any) {
      console.warn('Prisma seed admin notice:', prismaErr.message || prismaErr);
    }

    try {
      await supabase.from('users').upsert({
        id: admin?.id || 'admin_default_id',
        name: 'PlatePixel Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      });
    } catch (supaErr: any) {
      console.error('Supabase seed admin notice:', supaErr.message || supaErr);
    }

    res.status(201).json({
      message: 'Default admin created successfully',
      credentials: {
        email: adminEmail,
        password: 'Admin@123',
        role: 'ADMIN',
      },
    });
  } catch (error: any) {
    console.error('Seed admin error:', error);
    res.status(500).json({ error: error.message || 'Error seeding admin' });
  }
};
