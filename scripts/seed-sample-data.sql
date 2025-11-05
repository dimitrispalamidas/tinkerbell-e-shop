-- Sample data for Tinkerbell E-Shop
-- Run this in your Supabase SQL Editor to populate the database with sample data

-- Sample Categories
INSERT INTO categories (slug, type, name_el, name_en, description_el, description_en) VALUES
('boys-clothing', 'clothing', 'Ρούχα Αγοριών', 'Boys Clothing', 'Μοντέρνα ρούχα για αγόρια', 'Modern clothing for boys'),
('girls-clothing', 'clothing', 'Ρούχα Κοριτσιών', 'Girls Clothing', 'Όμορφα ρούχα για κορίτσια', 'Beautiful clothing for girls'),
('boys-shoes', 'shoes', 'Παπούτσια Αγοριών', 'Boys Shoes', 'Άνετα παπούτσια για αγόρια', 'Comfortable shoes for boys'),
('girls-shoes', 'shoes', 'Παπούτσια Κοριτσιών', 'Girls Shoes', 'Στυλάτα παπούτσια για κορίτσια', 'Stylish shoes for girls');

-- Sample Products
-- Note: Stock is now managed through product_variants table
INSERT INTO products (sku, name_el, name_en, description_el, description_en, price, sizes, colors, is_active, category_id) 
SELECT 
    'TSH-001',
    'Παιδικό Μπλουζάκι',
    'Kids T-Shirt',
    'Άνετο βαμβακερό μπλουζάκι για παιδιά',
    'Comfortable cotton t-shirt for kids',
    19.99,
    ARRAY['4Y', '6Y', '8Y', '10Y', '12Y'],
    ARRAY['Ροζ', 'Μπλε', 'Πράσινο'],
    true,
    id
FROM categories WHERE slug = 'boys-clothing' LIMIT 1;

INSERT INTO products (sku, name_el, name_en, description_el, description_en, price, sizes, colors, is_active, category_id) 
SELECT 
    'DRS-001',
    'Παιδικό Φόρεμα',
    'Girls Dress',
    'Υπέροχο φόρεμα για κορίτσια',
    'Beautiful dress for girls',
    34.99,
    ARRAY['4Y', '6Y', '8Y', '10Y'],
    ARRAY['Ροζ', 'Λευκό', 'Μωβ'],
    true,
    id
FROM categories WHERE slug = 'girls-clothing' LIMIT 1;

INSERT INTO products (sku, name_el, name_en, description_el, description_en, price, sizes, colors, is_active, category_id) 
SELECT 
    'SNK-001',
    'Παιδικά Αθλητικά',
    'Kids Sneakers',
    'Άνετα αθλητικά παπούτσια',
    'Comfortable sports shoes',
    44.99,
    ARRAY['28', '29', '30', '31', '32', '33'],
    ARRAY['Λευκό', 'Μαύρο', 'Μπλε'],
    true,
    id
FROM categories WHERE slug = 'boys-shoes' LIMIT 1;

INSERT INTO products (sku, name_el, name_en, description_el, description_en, price, sizes, colors, is_active, category_id) 
SELECT 
    'SND-001',
    'Παιδικά Σανδάλια',
    'Kids Sandals',
    'Καλοκαιρινά σανδάλια για κορίτσια',
    'Summer sandals for girls',
    29.99,
    ARRAY['28', '29', '30', '31', '32'],
    ARRAY['Ροζ', 'Χρυσό', 'Ασημί'],
    true,
    id
FROM categories WHERE slug = 'girls-shoes' LIMIT 1;

INSERT INTO products (sku, name_el, name_en, description_el, description_en, price, sizes, colors, is_active, category_id) 
SELECT 
    'JNS-001',
    'Παιδικό Τζιν Παντελόνι',
    'Kids Jeans',
    'Κλασικό τζιν παντελόνι',
    'Classic jeans pants',
    39.99,
    ARRAY['4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
    ARRAY['Μπλε Σκούρο', 'Μπλε Ανοιχτό'],
    true,
    id
FROM categories WHERE slug = 'boys-clothing' LIMIT 1;

-- Sample Gallery Items
-- Note: Gallery items now only store images with display_order. Add items through admin panel.
-- Example:
-- INSERT INTO gallery_items (category, display_order, is_active, images) VALUES
-- ('baptism', 1, true, ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg']),
-- ('decoration', 1, true, ARRAY['https://example.com/image3.jpg', 'https://example.com/image4.jpg']);

-- Note: To create an admin user, first create a user in Supabase Auth, then run:
-- INSERT INTO admin_users (user_id, role) VALUES ('your-user-id-here', 'admin');

