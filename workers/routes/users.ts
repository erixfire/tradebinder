import { Hono } from 'hono';
import type { Env } from '../types';

export const usersRoutes = new Hono<{ Bindings: Env }>();

// Get all users (admin only)
usersRoutes.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { results } = await c.env.DB.prepare(
      'SELECT id, email, username, first_name, last_name, phone, role, is_active, created_at FROM users'
    ).all();

    return c.json({ data: results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get user profile
usersRoutes.get('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const id = parseInt(c.req.param('id'));

    // Users can only view their own profile unless admin
    if (payload.role !== 'admin' && payload.id !== id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, username, first_name, last_name, phone, role, created_at FROM users WHERE id = ?'
    ).bind(id).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update user profile
usersRoutes.patch('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const id = parseInt(c.req.param('id'));

    if (payload.role !== 'admin' && payload.id !== id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { first_name, last_name, phone } = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(first_name, last_name, phone, id).run();

    return c.json({ message: 'Profile updated' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
