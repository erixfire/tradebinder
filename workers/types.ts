export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  SCRYFALL_API: string;
  ENVIRONMENT: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: number;
  scryfall_id?: string;
  oracle_id?: string;
  name: string;
  set_code: string;
  set_name?: string;
  collector_number?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special';
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  colors?: string;
  color_identity?: string;
  image_uri?: string;
  prices_usd?: number;
  prices_php?: number;
  foil: number;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: number;
  card_id: number;
  quantity: number;
  condition: 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';
  price_php: number;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment_method?: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  shipping_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  card_id: number;
  inventory_id?: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  condition?: string;
  created_at: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  username: string;
  role: string;
  exp: number;
}
