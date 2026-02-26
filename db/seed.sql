-- TradeBinder Seed Data
-- Sample data for development and testing

-- Sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO customers (email, password_hash, first_name, last_name, role) VALUES
('admin@tradebinder.com', '$2a$10$example_hash_replace_with_real_hash', 'Admin', 'User', 'admin');

-- Sample cards (using real MTG cards)
INSERT INTO cards (scryfall_id, name, set_code, set_name, collector_number, rarity, type_line) VALUES
('f2f7c6b2-3c0a-4a8f-9f3e-2c5a8b3f1234', 'Lightning Bolt', 'LEA', 'Limited Edition Alpha', '161', 'common', 'Instant'),
('a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6', 'Black Lotus', 'LEA', 'Limited Edition Alpha', '232', 'rare', 'Artifact'),
('b2c3d4e5-6f7g-8h9i-0j1k-l2m3n4o5p6q7', 'Counterspell', 'LEA', 'Limited Edition Alpha', '055', 'uncommon', 'Instant');

-- Sample inventory
INSERT INTO inventory (card_id, condition, quantity, cost_price, sell_price) VALUES
(1, 'NM', 10, 50.00, 100.00),
(1, 'LP', 5, 40.00, 80.00),
(2, 'NM', 1, 50000.00, 100000.00),
(3, 'NM', 15, 20.00, 40.00);

-- Note: Update password hashes before using in production!
