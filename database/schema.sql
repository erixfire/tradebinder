-- Enhanced Database Schema for ManaVault PH Trading Engine

-- Users table with trader verification
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  store_credit_balance DECIMAL(10,2) DEFAULT 0.00,
  verified_trader BOOLEAN DEFAULT FALSE,
  successful_trades_count INTEGER DEFAULT 0,
  trader_rating DECIMAL(3,2) DEFAULT 0.00,
  gcash_number TEXT,
  paymaya_number TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store Credit Ledger (never just a number!)
CREATE TABLE store_credit_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'TRADE_IN', 'PURCHASE', 'REFUND', 'P2P_TRADE', 'ADJUSTMENT'
  amount DECIMAL(10,2) NOT NULL, -- positive for credit, negative for debit
  balance_after DECIMAL(10,2) NOT NULL,
  reference_id INTEGER, -- links to trade_offer_id or transaction_id
  reason TEXT,
  processed_by INTEGER, -- staff user_id for store transactions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trade Offers (both P2P and Store Buy-Back)
CREATE TABLE trade_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  offer_type TEXT NOT NULL, -- 'P2P', 'STORE_BUYBACK'
  status TEXT NOT NULL, -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'ESCROW'
  
  -- Parties involved
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER, -- NULL for store buybacks
  
  -- Value calculation
  offering_total_value DECIMAL(10,2) NOT NULL,
  requesting_total_value DECIMAL(10,2) DEFAULT 0.00,
  value_difference DECIMAL(10,2) DEFAULT 0.00,
  cash_topup_amount DECIMAL(10,2) DEFAULT 0.00,
  cash_topup_paid BOOLEAN DEFAULT FALSE,
  
  -- Payment details
  payment_method TEXT, -- 'GCASH', 'PAYMAYA', 'STORE_CREDIT', 'CASH'
  payment_reference TEXT,
  
  -- Escrow details
  escrow_enabled BOOLEAN DEFAULT FALSE,
  tracking_number TEXT,
  store_verified BOOLEAN DEFAULT FALSE,
  
  -- Store buyback specific
  buyback_payment_type TEXT, -- 'STORE_CREDIT', 'CASH'
  buyback_percentage DECIMAL(5,2), -- e.g., 70.00 for 70%
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- Trade Items (cards involved in each trade)
CREATE TABLE trade_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_offer_id INTEGER NOT NULL,
  side TEXT NOT NULL, -- 'OFFERING' or 'REQUESTING'
  
  -- Card details
  card_id INTEGER NOT NULL,
  card_name TEXT NOT NULL,
  set_code TEXT,
  set_name TEXT,
  
  -- Condition and valuation
  condition TEXT NOT NULL, -- 'NM', 'LP', 'MP', 'HP', 'DMG'
  market_price_php DECIMAL(10,2) NOT NULL,
  condition_multiplier DECIMAL(3,2) NOT NULL,
  adjusted_value DECIMAL(10,2) NOT NULL, -- market_price * condition_multiplier
  
  quantity INTEGER DEFAULT 1,
  
  -- Verification
  condition_verified BOOLEAN DEFAULT FALSE,
  verified_by INTEGER, -- staff user_id
  verification_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id),
  FOREIGN KEY (card_id) REFERENCES inventory(id)
);

-- Trade Binder (user's public tradeable collection)
CREATE TABLE trade_binder (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_id INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition TEXT NOT NULL,
  for_trade BOOLEAN DEFAULT TRUE,
  minimum_value_php DECIMAL(10,2), -- minimum they'll accept in trade
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (card_id) REFERENCES inventory(id),
  UNIQUE(user_id, card_id, condition)
);

-- Wishlist (cards users want)
CREATE TABLE wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  card_name TEXT NOT NULL,
  set_code TEXT,
  max_price_php DECIMAL(10,2),
  priority INTEGER DEFAULT 1, -- 1=low, 5=high
  notes TEXT,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trade Reviews/Feedback
CREATE TABLE trade_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trade_offer_id INTEGER NOT NULL,
  reviewer_user_id INTEGER NOT NULL,
  reviewed_user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  meetup_location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id),
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_user_id) REFERENCES users(id),
  UNIQUE(trade_offer_id, reviewer_user_id)
);

-- Payment Transactions (GCash, PayMaya)
CREATE TABLE payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trade_offer_id INTEGER,
  payment_provider TEXT NOT NULL, -- 'PAYMONGO', 'XENDIT'
  payment_method TEXT NOT NULL, -- 'GCASH', 'PAYMAYA', 'CARD'
  amount_php DECIMAL(10,2) NOT NULL,
  provider_reference TEXT,
  status TEXT NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
  metadata TEXT, -- JSON string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id)
);

-- Store Buyback Configuration
CREATE TABLE buyback_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condition TEXT UNIQUE NOT NULL,
  condition_multiplier DECIMAL(3,2) NOT NULL,
  store_credit_percentage DECIMAL(5,2) NOT NULL,
  cash_percentage DECIMAL(5,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default buyback rates
INSERT INTO buyback_config (condition, condition_multiplier, store_credit_percentage, cash_percentage) VALUES
('NM', 1.00, 70.00, 60.00),
('LP', 0.90, 60.00, 50.00),
('MP', 0.75, 45.00, 35.00),
('HP', 0.50, 30.00, 25.00),
('DMG', 0.25, 15.00, 10.00);

-- COGS Tracking for traded-in inventory
CREATE TABLE inventory_cogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL,
  acquisition_type TEXT NOT NULL, -- 'TRADE_IN', 'WHOLESALE', 'PURCHASE'
  acquisition_cost_php DECIMAL(10,2) NOT NULL,
  acquisition_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  trade_offer_id INTEGER,
  sold_at TIMESTAMP,
  sale_price_php DECIMAL(10,2),
  profit_php DECIMAL(10,2),
  
  FOREIGN KEY (card_id) REFERENCES inventory(id),
  FOREIGN KEY (trade_offer_id) REFERENCES trade_offers(id)
);

-- Indexes for performance
CREATE INDEX idx_trade_offers_status ON trade_offers(status);
CREATE INDEX idx_trade_offers_users ON trade_offers(from_user_id, to_user_id);
CREATE INDEX idx_trade_binder_user ON trade_binder(user_id, for_trade);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_store_credit_ledger_user ON store_credit_ledger(user_id);
CREATE INDEX idx_payment_transactions_trade ON payment_transactions(trade_offer_id);
