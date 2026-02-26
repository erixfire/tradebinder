import { Hono } from 'hono';
import type { Env, Card } from '../types';

export const cardsRoutes = new Hono<{ Bindings: Env }>();

// Search cards
cardsRoutes.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const set = c.req.query('set');
    const rarity = c.req.query('rarity');
    const colors = c.req.query('colors');
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM cards WHERE 1=1';
    const params: any[] = [];

    if (query) {
      sql += ' AND name LIKE ?';
      params.push(`%${query}%`);
    }

    if (set) {
      sql += ' AND set_code = ?';
      params.push(set);
    }

    if (rarity) {
      sql += ' AND rarity = ?';
      params.push(rarity);
    }

    if (colors) {
      sql += ' AND colors LIKE ?';
      params.push(`%${colors}%`);
    }

    sql += ' ORDER BY name LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const { results } = await c.env.DB.prepare(sql).bind(...params).all<Card>();

    // Get total count
    let countSql = 'SELECT COUNT(*) as count FROM cards WHERE 1=1';
    const countParams: any[] = [];
    
    if (query) {
      countSql += ' AND name LIKE ?';
      countParams.push(`%${query}%`);
    }
    if (set) {
      countSql += ' AND set_code = ?';
      countParams.push(set);
    }
    if (rarity) {
      countSql += ' AND rarity = ?';
      countParams.push(rarity);
    }
    if (colors) {
      countSql += ' AND colors LIKE ?';
      countParams.push(`%${colors}%`);
    }

    const countResult = await c.env.DB.prepare(countSql).bind(...countParams).first<{ count: number }>();
    const total = countResult?.count || 0;

    return c.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get single card
cardsRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const card = await c.env.DB.prepare('SELECT * FROM cards WHERE id = ?').bind(id).first<Card>();

    if (!card) {
      return c.json({ error: 'Card not found' }, 404);
    }

    // Get inventory for this card
    const { results: inventory } = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE card_id = ? AND quantity > 0'
    ).bind(id).all();

    return c.json({ card, inventory });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create card (admin only)
cardsRoutes.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload');
    if (payload.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const cardData = await c.req.json();
    const result = await c.env.DB.prepare(
      `INSERT INTO cards (scryfall_id, oracle_id, name, set_code, set_name, collector_number, 
       rarity, mana_cost, cmc, type_line, oracle_text, colors, color_identity, image_uri, 
       prices_usd, prices_php, foil) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      cardData.scryfall_id, cardData.oracle_id, cardData.name, cardData.set_code,
      cardData.set_name, cardData.collector_number, cardData.rarity, cardData.mana_cost,
      cardData.cmc, cardData.type_line, cardData.oracle_text, cardData.colors,
      cardData.color_identity, cardData.image_uri, cardData.prices_usd, cardData.prices_php,
      cardData.foil || 0
    ).run();

    return c.json({ id: result.meta.last_row_id, message: 'Card created' }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});
