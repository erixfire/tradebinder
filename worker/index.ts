/**
 * Cloudflare Workers API for TradeBinder
 * Complete MTG Card Trading Platform Backend
 */

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  SCRYFALL_API_URL: string;
}

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (path === '/api/health') {
        return jsonResponse({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          environment: env.ENVIRONMENT || 'production'
        }, corsHeaders);
      }

      // Auth routes
      if (path === '/api/auth/login' && method === 'POST') {
        return handleLogin(request, env, corsHeaders);
      }

      if (path === '/api/auth/register' && method === 'POST') {
        return handleRegister(request, env, corsHeaders);
      }

      // Inventory routes
      if (path === '/api/inventory' && method === 'GET') {
        return handleGetInventory(request, env, corsHeaders);
      }

      if (path === '/api/cards' && method === 'GET') {
        return handleGetCards(request, env, corsHeaders);
      }

      if (path.startsWith('/api/cards/') && method === 'GET') {
        const cardId = path.split('/')[3];
        return handleGetCard(cardId, env, corsHeaders);
      }

      // Orders routes
      if (path === '/api/orders' && method === 'GET') {
        return handleGetOrders(request, env, corsHeaders);
      }

      if (path === '/api/orders' && method === 'POST') {
        return handleCreateOrder(request, env, corsHeaders);
      }

      // Customers routes
      if (path === '/api/customers' && method === 'GET') {
        return handleGetCustomers(request, env, corsHeaders);
      }

      // Reports routes
      if (path === '/api/reports/sales' && method === 'GET') {
        return handleSalesReport(request, env, corsHeaders);
      }

      // 404 for unknown routes
      return jsonResponse(
        { error: 'Not found', path },
        corsHeaders,
        404
      );
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        { error: 'Internal server error', message: error instanceof Error ? error.message : String(error) },
        corsHeaders,
        500
      );
    }
  },
};

// ============================================
// AUTH HANDLERS
// ============================================

async function handleLogin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { email, password } = await request.json() as { email: string; password: string };

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password required' }, corsHeaders, 400);
    }

    // Get user from database
    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, first_name, last_name, role FROM customers WHERE email = ? AND is_active = 1'
    ).bind(email).first();

    if (!user) {
      return jsonResponse({ error: 'Invalid credentials' }, corsHeaders, 401);
    }

    // Simple password verification (in production, use bcrypt)
    // For now, accept password 'admin123' for admin@tradebinder.com
    const passwordValid = email === 'admin@tradebinder.com' && password === 'admin123';

    if (!passwordValid) {
      return jsonResponse({ error: 'Invalid credentials' }, corsHeaders, 401);
    }

    // Generate simple JWT token (in production, use proper JWT library)
    const token = btoa(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));

    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Login failed', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

async function handleRegister(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { email, password, firstName, lastName } = await request.json() as any;

    if (!email || !password || !firstName || !lastName) {
      return jsonResponse({ error: 'All fields required' }, corsHeaders, 400);
    }

    // Check if user exists
    const existing = await env.DB.prepare(
      'SELECT id FROM customers WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return jsonResponse({ error: 'User already exists' }, corsHeaders, 409);
    }

    // Insert new user
    const result = await env.DB.prepare(
      'INSERT INTO customers (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)'
    ).bind(email, password, firstName, lastName, 'customer').run();

    return jsonResponse({ message: 'User created successfully', userId: result.meta.last_row_id }, corsHeaders, 201);
  } catch (error) {
    return jsonResponse({ error: 'Registration failed', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

// ============================================
// INVENTORY HANDLERS
// ============================================

async function handleGetInventory(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const inventory = await env.DB.prepare(`
      SELECT 
        i.id, i.quantity, i.condition, i.price_php,
        c.name, c.mana_cost, c.type_line, c.oracle_text, c.power, c.toughness,
        c.colors, c.set_code, c.set_name, c.rarity, c.image_url
      FROM inventory i
      JOIN cards c ON i.card_id = c.id
      WHERE i.quantity > 0
      ORDER BY c.name
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    return jsonResponse({ inventory: inventory.results || [], total: inventory.results?.length || 0 }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get inventory', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

async function handleGetCards(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = 'SELECT * FROM cards';
    const params: any[] = [];

    if (search) {
      query += ' WHERE name LIKE ? OR type_line LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name LIMIT ?';
    params.push(limit);

    const cards = await env.DB.prepare(query).bind(...params).all();

    return jsonResponse({ cards: cards.results || [], total: cards.results?.length || 0 }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get cards', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

async function handleGetCard(cardId: string, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const card = await env.DB.prepare('SELECT * FROM cards WHERE id = ?').bind(cardId).first();

    if (!card) {
      return jsonResponse({ error: 'Card not found' }, corsHeaders, 404);
    }

    return jsonResponse({ card }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get card', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

// ============================================
// ORDER HANDLERS
// ============================================

async function handleGetOrders(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const orders = await env.DB.prepare(`
      SELECT 
        o.id, o.customer_id, o.order_date, o.total_amount, o.status, o.payment_method,
        c.first_name, c.last_name, c.email
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.order_date DESC
      LIMIT 50
    `).all();

    return jsonResponse({ orders: orders.results || [] }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get orders', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

async function handleCreateOrder(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const { customerId, items, totalAmount, paymentMethod } = await request.json() as any;

    if (!customerId || !items || !totalAmount) {
      return jsonResponse({ error: 'Missing required fields' }, corsHeaders, 400);
    }

    // Create order
    const orderResult = await env.DB.prepare(
      'INSERT INTO orders (customer_id, total_amount, payment_method, status) VALUES (?, ?, ?, ?)'
    ).bind(customerId, totalAmount, paymentMethod || 'cash', 'pending').run();

    const orderId = orderResult.meta.last_row_id;

    // Insert order items
    for (const item of items) {
      await env.DB.prepare(
        'INSERT INTO order_items (order_id, inventory_id, quantity, price_php) VALUES (?, ?, ?, ?)'
      ).bind(orderId, item.inventoryId, item.quantity, item.price).run();

      // Update inventory
      await env.DB.prepare(
        'UPDATE inventory SET quantity = quantity - ? WHERE id = ?'
      ).bind(item.quantity, item.inventoryId).run();
    }

    return jsonResponse({ message: 'Order created', orderId }, corsHeaders, 201);
  } catch (error) {
    return jsonResponse({ error: 'Failed to create order', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

// ============================================
// CUSTOMER HANDLERS
// ============================================

async function handleGetCustomers(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const customers = await env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, created_at
      FROM customers
      ORDER BY created_at DESC
      LIMIT 100
    `).all();

    return jsonResponse({ customers: customers.results || [] }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get customers', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

// ============================================
// REPORT HANDLERS
// ============================================

async function handleSalesReport(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_sales,
        AVG(total_amount) as average_order
      FROM orders
      WHERE status = 'completed'
    `).first();

    return jsonResponse({ stats }, corsHeaders);
  } catch (error) {
    return jsonResponse({ error: 'Failed to get sales report', message: error instanceof Error ? error.message : String(error) }, corsHeaders, 500);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function jsonResponse(data: any, headers: Record<string, string> = {}, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
