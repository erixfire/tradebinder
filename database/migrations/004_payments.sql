-- Payment and Escrow Tables

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

CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  escrow_id INTEGER,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'PHP',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  checkout_url TEXT,
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (escrow_id) REFERENCES escrow_transactions(id)
);

CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_buyer ON escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_seller ON escrow_transactions(seller_id);
CREATE INDEX idx_payment_status ON payment_transactions(status);
