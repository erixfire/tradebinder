-- Seed Data for TradeBinder

-- Admin User (password: admin123)
INSERT INTO users (email, username, password_hash, first_name, last_name, role) VALUES
('admin@tradebinder.com', 'admin', '$2a$10$rQJ5xK3q5P5p5p5p5p5p5OqK5K5K5K5K5K5K5K5K5K5K5K5K5K', 'Admin', 'User', 'admin');

-- Sample Staff User (password: staff123)
INSERT INTO users (email, username, password_hash, first_name, last_name, role) VALUES
('staff@tradebinder.com', 'staff', '$2a$10$rQJ5xK3q5P5p5p5p5p5p5OqK5K5K5K5K5K5K5K5K5K5K5K5K5K', 'Staff', 'Member', 'staff');

-- Sample Customer (password: customer123)
INSERT INTO users (email, username, password_hash, first_name, last_name, role, phone) VALUES
('customer@example.com', 'customer1', '$2a$10$rQJ5xK3q5P5p5p5p5p5p5OqK5K5K5K5K5K5K5K5K5K5K5K5K5K', 'John', 'Doe', 'customer', '+639171234567');

-- Sample MTG Cards
INSERT INTO cards (scryfall_id, name, set_code, set_name, collector_number, rarity, mana_cost, cmc, type_line, oracle_text, colors, color_identity, prices_usd, prices_php, foil) VALUES
('5f70c4ff-0a68-4738-a199-11d06d54cda4', 'Lightning Bolt', 'LEA', 'Limited Edition Alpha', '161', 'common', '{R}', 1, 'Instant', 'Lightning Bolt deals 3 damage to any target.', 'R', 'R', 150.00, 8500.00, 0),
('2a3b8c39-4f51-4713-b8b1-4b9a0f7f8c1a', 'Black Lotus', 'LEA', 'Limited Edition Alpha', '232', 'rare', '{0}', 0, 'Artifact', '{T}, Sacrifice Black Lotus: Add three mana of any one color.', '', '', 50000.00, 2800000.00, 0),
('3c5d8e47-5g62-5824-c9c2-5c0b1g8g9d2b', 'Counterspell', '2ED', 'Unlimited Edition', '54', 'uncommon', '{U}{U}', 2, 'Instant', 'Counter target spell.', 'U', 'U', 15.00, 850.00, 0),
('4d6e9f58-6h73-6935-d0d3-6d1c2h9h0e3c', 'Sol Ring', 'LEA', 'Limited Edition Alpha', '268', 'uncommon', '{1}', 1, 'Artifact', '{T}: Add {C}{C}.', '', '', 1200.00, 68000.00, 0),
('5e7f0g69-7i84-7046-e1e4-7e2d3i0i1f4d', 'Birds of Paradise', 'LEA', 'Limited Edition Alpha', '163', 'rare', '{G}', 1, 'Creature — Bird', 'Flying\n{T}: Add one mana of any color.', 'G', 'G', 800.00, 45000.00, 0);

-- Sample Inventory
INSERT INTO inventory (card_id, quantity, condition, price_php, location) VALUES
(1, 10, 'NM', 8500.00, 'Shelf A1'),
(1, 5, 'LP', 7500.00, 'Shelf A1'),
(3, 15, 'NM', 850.00, 'Shelf B2'),
(3, 8, 'LP', 700.00, 'Shelf B2'),
(4, 3, 'NM', 68000.00, 'Display Case'),
(5, 7, 'NM', 45000.00, 'Display Case'),
(5, 4, 'LP', 40000.00, 'Display Case');

-- Sample Order
INSERT INTO orders (order_number, user_id, status, subtotal, tax, shipping, total, payment_method, payment_status, shipping_address) VALUES
('ORD-20260226-001', 3, 'completed', 9350.00, 1122.00, 150.00, 10622.00, 'GCash', 'paid', 'Iloilo City, Western Visayas, Philippines');

INSERT INTO order_items (order_id, card_id, inventory_id, quantity, unit_price, subtotal, condition) VALUES
(1, 1, 1, 1, 8500.00, 8500.00, 'NM'),
(1, 3, 3, 1, 850.00, 850.00, 'NM');

-- Sample Wishlist
INSERT INTO wishlists (user_id, card_id, max_price, notes) VALUES
(3, 2, 2500000.00, 'Grail card - saving up'),
(3, 4, 60000.00, 'Need for Commander deck');
