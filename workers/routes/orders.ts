import { Hono } from 'hono';
import type { Env } from '../types';

export const ordersRoutes = new Hono<{ Bindings: Env }>();

// Get user's orders
ordersRoutes.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const userId = payload.role === 'customer' ? payload.id : c.req.query('user_id');

    let sql = `SELECT * FROM orders WHERE 1=1`;
    const params: any[] = [];

    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY created_at DESC';

    const { results } = await c.env.DB.prepare(sql).bind(...params).all();

    return c.json({ data: results });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get single order with items
ordersRoutes.get('/:id', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const id = parseInt(c.req.param('id'));

    const order = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Check authorization
    if (payload.role === 'customer' && order.user_id !== payload.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get order items with card details
    const { results: items } = await c.env.DB.prepare(
      `SELECT oi.*, c.name as card_name, c.set_code, c.image_uri
       FROM order_items oi
       JOIN cards c ON oi.card_id = c.id
       WHERE oi.order_id = ?`
    ).bind(id).all();

    return c.json({ order, items });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create order
ordersRoutes.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    const { items, payment_method, shipping_address, notes } = await c.req.json();

    if (!items || items.length === 0) {
      return c.json({ error: 'Order must have at least one item' }, 400);
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const inventory = await c.env.DB.prepare(
        'SELECT price_php, quantity FROM inventory WHERE id = ?'
      ).bind(item.inventory_id).first<{ price_php: number; quantity: number }>();

      if (!inventory || inventory.quantity < item.quantity) {
        return c.json({ error: `Insufficient stock for item ${item.inventory_id}` }, 400);
      }

      subtotal += inventory.price_php * item.quantity;
    }

    const tax = subtotal * 0.12; // 12% VAT
    const shipping = 150; // Flat rate for now
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;

    // Create order
    const orderResult = await c.env.DB.prepare(
      `INSERT INTO orders (order_number, user_id, status, subtotal, tax, shipping, total, 
       payment_method, shipping_address, notes)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      orderNumber, payload.id, subtotal, tax, shipping, total,
      payment_method, shipping_address, notes
    ).run();

    const orderId = orderResult.meta.last_row_id;

    // Create order items and update inventory
    for (const item of items) {
      const inventory = await c.env.DB.prepare(
        'SELECT card_id, price_php, condition FROM inventory WHERE id = ?'
      ).bind(item.inventory_id).first();

      await c.env.DB.prepare(
        `INSERT INTO order_items (order_id, card_id, inventory_id, quantity, unit_price, subtotal, condition)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        orderId, inventory.card_id, item.inventory_id, item.quantity,
        inventory.price_php, inventory.price_php * item.quantity, inventory.condition
      ).run();

      // Update inventory quantity
      await c.env.DB.prepare(
        `UPDATE inventory SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(item.quantity, item.inventory_id).run();
    }

    return c.json({ order_id: orderId, order_number: orderNumber, total }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update order status
ordersRoutes.patch('/:id/status', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const id = parseInt(c.req.param('id'));
    const { status, payment_status } = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE orders SET status = ?, payment_status = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(status, payment_status, id).run();

    return c.json({ message: 'Order status updated' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
