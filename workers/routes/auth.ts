import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import type { Env, User } from '../types';
import { hashPassword, verifyPassword } from '../utils/auth';

export const authRoutes = new Hono<{ Bindings: Env }>();

// Register new user
authRoutes.post('/register', async (c) => {
  try {
    const { email, username, password, first_name, last_name, phone } = await c.req.json();

    // Validation
    if (!email || !username || !password) {
      return c.json({ error: 'Email, username, and password are required' }, 400);
    }

    // Check if user exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first();

    if (existing) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await c.env.DB.prepare(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?, 'customer')`
    ).bind(email, username, password_hash, first_name || null, last_name || null, phone || null).run();

    // Generate JWT
    const token = await sign(
      {
        id: result.meta.last_row_id,
        email,
        username,
        role: 'customer',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      },
      c.env.JWT_SECRET
    );

    return c.json({ token, user: { id: result.meta.last_row_id, email, username, role: 'customer' } }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Login
authRoutes.post('/login', async (c) => {
  try {
    const { login, password } = await c.req.json();

    if (!login || !password) {
      return c.json({ error: 'Login and password are required' }, 400);
    }

    // Find user by email or username
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE (email = ? OR username = ?) AND is_active = 1'
    ).bind(login, login).first<User>();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      },
      c.env.JWT_SECRET
    );

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return c.json({ token, user: userWithoutPassword });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get current user
authRoutes.get('/me', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, first_name, last_name, phone, role, created_at FROM users WHERE id = ?'
    ).bind(payload.id).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
