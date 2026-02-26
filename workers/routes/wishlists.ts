import { Hono } from 'hono';
import type { Env } from '../types';

export const wishlistsRoutes = new Hono<{ Bindings: Env }>();

// Get user's wishlist
wishlistsRoutes.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');

    const { results } = await c.env.DB.prepare(
      `SELECT w.*, c.name, c.set_code, c.set_name, c.image_uri, c.prices_php,
       CASE WHEN i.card_id IS NOT NULL THEN 1 ELSE 0 END as in_stock
       FROM wishlists w
       JOIN cards c ON w.card_id = c.id
       LEFT JOIN inventory i ON c.id = i.card_id AND i.quantity > 0
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`
    ).bind(payload.id).all();

    return c.json({ data: results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Add to wishlist
wishlistsRoutes.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const { card_id, max_price, notes } = await c.req.json();

    const result = await c.env.DB.prepare(
      'INSERT INTO wishlists (user_id, card_id, max_price, notes) VALUES (?, ?, ?, ?)'
    ).bind(payload.id, card_id, max_price, notes).run();

    return c.json({ id: result.meta.last_row_id, message: 'Added to wishlist' }, 201);
  } catch (error: any) {
    if (error.message.includes('UNIQUE')) {
      return c.json({ error: 'Card already in wishlist' }, 409);
    }
    return c.json({ error: error.message }, 500);
  }
});

// Remove from wishlist
wishlistsRoutes.delete('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const id = parseInt(c.req.param('id'));

    await c.env.DB.prepare(
      'DELETE FROM wishlists WHERE id = ? AND user_id = ?'
    ).bind(id, payload.id).run();

    return c.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
