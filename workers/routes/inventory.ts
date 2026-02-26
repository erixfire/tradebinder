import { Hono } from 'hono';
import type { Env } from '../types';

export const inventoryRoutes = new Hono<{ Bindings: Env }>();

// Get all inventory
inventoryRoutes.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT i.*, c.name as card_name, c.set_code, c.set_name, c.image_uri
       FROM inventory i
       JOIN cards c ON i.card_id = c.id
       WHERE i.quantity > 0
       ORDER BY i.updated_at DESC`
    ).all();

    return c.json({ data: results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update inventory
inventoryRoutes.patch('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const id = parseInt(c.req.param('id'));
    const { quantity, price_php, location, notes } = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE inventory SET quantity = ?, price_php = ?, location = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(quantity, price_php, location, notes, id).run();

    return c.json({ message: 'Inventory updated' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Add inventory
inventoryRoutes.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { card_id, quantity, condition, price_php, location, notes } = await c.req.json();

    const result = await c.env.DB.prepare(
      `INSERT INTO inventory (card_id, quantity, condition, price_php, location, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(card_id, quantity, condition || 'NM', price_php, location, notes).run();

    return c.json({ id: result.meta.last_row_id, message: 'Inventory added' }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
