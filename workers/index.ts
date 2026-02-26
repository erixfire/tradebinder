import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';
import { authRoutes } from './routes/auth';
import { cardsRoutes } from './routes/cards';
import { inventoryRoutes } from './routes/inventory';
import { ordersRoutes } from './routes/orders';
import { usersRoutes } from './routes/users';
import { wishlistsRoutes } from './routes/wishlists';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://tradebinder.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.route('/api/auth', authRoutes);

// Protected routes - JWT middleware
const protectedRoutes = new Hono<{ Bindings: Env }>();

protectedRoutes.use('/*', async (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
});

protectedRoutes.route('/api/cards', cardsRoutes);
protectedRoutes.route('/api/inventory', inventoryRoutes);
protectedRoutes.route('/api/orders', ordersRoutes);
protectedRoutes.route('/api/users', usersRoutes);
protectedRoutes.route('/api/wishlists', wishlistsRoutes);

app.route('/', protectedRoutes);

// Error handling
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: err.message }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;
