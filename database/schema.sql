-- Complete TradeBinder Database Schema
-- Run this first before seed.sql

-- Customers/Users table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer',
  is_active BOOLEAN DEFAULT 1,
  store_credit_balance DECIMAL(10,2) DEFAULT 0.00,
  verified_trader BOOLEAN DEFAULT FALSE,
  successful_trades_count INTEGER DEFAULT 0,
  trader_rating DECIMAL(3,2) DEFAULT 0.00,
  gcash_number TEXT,
  paymaya_number TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards master table (from Scryfall)
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  scryfallId TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  mana_cost TEXT,
  cmc INTEGER,
  type_line TEXT NOT NULL,
  oracle_text TEXT,
  power TEXT,
  toughness TEXT,
  colors TEXT,
  color_identity TEXT,
  set_code TEXT NOT NULL,
  set_name TEXT NOT NULL,
  collector_number TEXT,
  rarity TEXT NOT NULL,
  image_url TEXT,
  prices_usd DECIMAL(10,2),
  prices_usd_foil DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory table (store stock)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  condition TEXT NOT NULL DEFAULT 'NM',
  price_php DECIMAL(10,2) NOT NULL,
  is_foil BOOLEAN DEFAULT 0,
  location TEXT,
  notes TEXT,
  actual_image_front_url TEXT,
  actual_image_back_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  inventory_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price_php DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

-- Trade Offers (both P2P and Store Buy-Back)
CREATE TABLE IF NOT EXISTS trade_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_type TEXT NOT NULL DEFAULT 'P2P',
  status TEXT NOT NULL DEFAULT 'PENDING',
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER,
  offering_total_value DECIMAL(10,2) NOT NULL,
  requesting_total_value DECIMAL(10,2) DEFAULT 0.00,
  value_difference DECIMAL(10,2) DEFAULT 0.00,
  cash_topup_amount DECIMAL(10,2) DEFAULT 0.00,
  cash_topup_paid BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  payment_reference TEXT,
  escrow_enabled BOOLEAN DEFAULT FALSE,
  tracking_number TEXT,
  store_verified BOOLEAN DEFAULT FALSE,
  buyback_payment_type TEXT,
  buyback_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES customers(id),
  FOREIGN KEY (to_user_id) REFERENCES customers(id)
);

-- Trade Items (cards involved in each trade)
CREATE TABLE IF NOT EXISTS trade_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_offer_id INTEGER NOT NULL,
  side TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_name TEXT NOT NULL,
  set_code TEXT,
  set_name TEXT,
  condition TEXT NOT NULL DEFAULT 'NM',
  market_price_php DECIMAL(10,2) NOT NULL,
  condition_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  adjusted_value DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition_verified BOOLEAN DEFAULT FALSE,
  verified_by INTEGER,
  verification_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id),
  FOREIGN KEY (card_id) REFERENCES cards(id)
);

-- Trade Binder (user's public tradeable collection)
CREATE TABLE IF NOT EXISTS trade_binder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'NM',
  for_trade BOOLEAN DEFAULT TRUE,
  minimum_value_php DECIMAL(10,2),
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES customers(id),
  FOREIGN KEY (card_id) REFERENCES cards(id),
  UNIQUE(user_id, card_id, condition)
);

-- Wishlist (cards users want)
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_name TEXT NOT NULL,
  set_code TEXT,
  max_price_php DECIMAL(10,2),
  priority INTEGER DEFAULT 1,
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES customers(id)
);

-- Store Credit Ledger
CREATE TABLE IF NOT EXISTS store_credit_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id INTEGER,
  reason TEXT,
  processed_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES customers(id)
);

-- Trade Reviews/Feedback
CREATE TABLE IF NOT EXISTS trade_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_offer_id INTEGER NOT NULL,
  reviewer_user_id INTEGER NOT NULL,
  reviewed_user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  meetup_location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id),
  FOREIGN KEY (reviewer_user_id) REFERENCES customers(id),
  FOREIGN KEY (reviewed_user_id) REFERENCES customers(id),
  UNIQUE(trade_offer_id, reviewer_user_id)
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_id INTEGER,
  trade_offer_id INTEGER,
  payment_provider TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  amount_php DECIMAL(10,2) NOT NULL,
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES customers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id)
);

-- Escrow Transactions
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  funded_at DATETIME,
  released_at DATETIME,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES customers(id),
  FOREIGN KEY (seller_id) REFERENCES customers(id)
);

-- Escrow Disputes
CREATE TABLE IF NOT EXISTS escrow_disputes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  escrow_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  resolved BOOLEAN DEFAULT 0,
  resolution TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (escrow_id) REFERENCES escrow_transactions(id)
);

-- Buyback Configuration
CREATE TABLE IF NOT EXISTS buyback_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condition TEXT UNIQUE NOT NULL,
  condition_multiplier DECIMAL(3,2) NOT NULL,
  store_credit_percentage DECIMAL(5,2) NOT NULL,
  cash_percentage DECIMAL(5,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COGS Tracking
CREATE TABLE IF NOT EXISTS inventory_cogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id TEXT NOT NULL,
  acquisition_type TEXT NOT NULL,
  acquisition_cost_php DECIMAL(10,2) NOT NULL,
  acquisition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trade_offer_id INTEGER,
  sold_at TIMESTAMP,
  sale_price_php DECIMAL(10,2),
  profit_php DECIMAL(10,2),
  FOREIGN KEY (card_id) REFERENCES cards(id),
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
CREATE INDEX IF NOT EXISTS idx_cards_set ON cards(set_code);
CREATE INDEX IF NOT EXISTS idx_inventory_card ON inventory(card_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON trade_offers(status);
CREATE INDEX IF NOT EXISTS idx_trade_offers_users ON trade_offers(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_trade_binder_user ON trade_binder(user_id, for_trade);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_store_credit_ledger_user ON store_credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_trade ON payment_transactions(trade_offer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_transactions(seller_id);

-- Insert default buyback rates
INSERT OR IGNORE INTO buyback_config (condition, condition_multiplier, store_credit_percentage, cash_percentage) VALUES
('NM', 1.00, 70.00, 60.00),
('LP', 0.90, 60.00, 50.00),
('MP', 0.75, 45.00, 35.00),
('HP', 0.50, 30.00, 25.00),
('DMG', 0.25, 15.00, 10.00);

-- Insert default admin user
INSERT OR IGNORE INTO customers (id, email, password_hash, first_name, last_name, role) 
VALUES (1, 'admin@tradebinder.com', 'admin123', 'Admin', 'User', 'admin');
