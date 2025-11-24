-- ============================================
-- TINKERBELL E-SHOP - SECURITY & PERFORMANCE
-- ============================================
-- This file contains recommended RLS policies and indexes
-- Run these in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. HELPER FUNCTIONS (MUST BE CREATED FIRST)
-- ============================================

-- Function to check if user is admin
-- SECURITY DEFINER allows this function to bypass RLS when checking admin_users
-- This prevents infinite recursion in RLS policies
-- IMPORTANT: Create this BEFORE the RLS policies that use it
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = check_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PRODUCTS TABLE POLICIES
-- ============================================

-- Public can read active products
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true AND status IN ('active', 'sold_out'));

-- Admins can do everything
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- CATEGORIES TABLE POLICIES
-- ============================================

-- Public can read all categories
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

-- Admins can manage categories
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- PRODUCT_VARIANTS TABLE POLICIES
-- ============================================

-- Public can read variants for active products
CREATE POLICY "Public can read variants for active products"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.is_active = true
      AND products.status IN ('active', 'sold_out')
    )
  );

-- Admins can manage variants
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage variants"
  ON product_variants FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Admins can read all orders
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can read orders"
  ON orders FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update orders
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (is_admin(auth.uid()));

-- Service role can insert orders (for checkout)
-- Note: This is handled by service role key which bypasses RLS
-- But we add policy for clarity

-- ============================================
-- ORDER_ITEMS TABLE POLICIES
-- ============================================

-- Admins can read order items
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can read order items"
  ON order_items FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can manage order items
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- GALLERY_ITEMS TABLE POLICIES
-- ============================================

-- Public can read active gallery items
CREATE POLICY "Public can read active gallery items"
  ON gallery_items FOR SELECT
  USING (is_active = true);

-- Admins can manage gallery items
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage gallery items"
  ON gallery_items FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- ADMIN_USERS TABLE POLICIES
-- ============================================

-- Only admins can read admin_users (for verification)
-- IMPORTANT: Use is_admin() function to avoid infinite recursion
-- The function uses SECURITY DEFINER which bypasses RLS
CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  USING (is_admin(auth.uid()));

-- Service role can manage admin_users (for setup scripts)
-- Handled by service role key

-- ============================================
-- PRODUCT_DISCOUNTS TABLE POLICIES
-- ============================================

-- Public can read active product discounts (for product pages)
CREATE POLICY "Public can read active product discounts"
  ON product_discounts FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

-- Admins can manage product discounts
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage product discounts"
  ON product_discounts FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- DISCOUNT_CODES TABLE POLICIES
-- ============================================

-- Public can read active discount codes (for checkout)
CREATE POLICY "Public can read active discount codes"
  ON discount_codes FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

-- Admins can manage discount codes
-- Use is_admin() function to avoid RLS recursion issues
CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- 3. DATABASE INDEXES FOR PERFORMANCE
-- ============================================

-- PRODUCTS TABLE INDEXES
-- ============================================

-- Index for active products (most common query)
CREATE INDEX IF NOT EXISTS idx_products_active_status
  ON products(is_active, status)
  WHERE is_active = true;

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category_id)
  WHERE is_active = true;

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON products(created_at DESC)
  WHERE is_active = true;

-- Index for search (name fields)
CREATE INDEX IF NOT EXISTS idx_products_name_el
  ON products USING gin(to_tsvector('greek', name_el))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_name_en
  ON products USING gin(to_tsvector('english', name_en))
  WHERE is_active = true;

-- Index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku
  ON products(sku)
  WHERE is_active = true;

-- ============================================
-- PRODUCT_VARIANTS TABLE INDEXES
-- ============================================

-- Index for product variant lookups (cart validation)
CREATE INDEX IF NOT EXISTS idx_variants_product_size_color
  ON product_variants(product_id, size, color);

-- Index for stock checks
CREATE INDEX IF NOT EXISTS idx_variants_stock
  ON product_variants(stock)
  WHERE stock > 0;

-- Index for product_id (for joins)
CREATE INDEX IF NOT EXISTS idx_variants_product_id
  ON product_variants(product_id);

-- ============================================
-- ORDERS TABLE INDEXES
-- ============================================

-- Index for Viva order code lookups (webhook processing)
CREATE INDEX IF NOT EXISTS idx_orders_viva_code
  ON orders(viva_order_code)
  WHERE viva_order_code IS NOT NULL;

-- Index for transaction ID lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id
  ON orders(viva_transaction_id)
  WHERE viva_transaction_id IS NOT NULL;

-- Index for payment status filtering (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON orders(payment_status, created_at DESC);

-- Index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email
  ON orders(customer_email);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

-- ============================================
-- ORDER_ITEMS TABLE INDEXES
-- ============================================

-- Index for order lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

-- ============================================
-- CATEGORIES TABLE INDEXES
-- ============================================

-- Index for type filtering
CREATE INDEX IF NOT EXISTS idx_categories_type
  ON categories(type);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug
  ON categories(slug);

-- ============================================
-- GALLERY_ITEMS TABLE INDEXES
-- ============================================

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_gallery_category
  ON gallery_items(category)
  WHERE is_active = true;

-- Index for display order sorting
CREATE INDEX IF NOT EXISTS idx_gallery_display_order
  ON gallery_items(display_order ASC)
  WHERE is_active = true;

-- ============================================
-- ADMIN_USERS TABLE INDEXES
-- ============================================

-- Index for user_id lookups (admin verification)
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
  ON admin_users(user_id);

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'categories', 'orders', 'order_items', 'gallery_items', 'admin_users')
ORDER BY tablename;

-- Check indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('products', 'product_variants', 'orders', 'order_items')
ORDER BY tablename, indexname;

-- ============================================
-- NOTES
-- ============================================
-- 1. RLS policies use auth.uid() which requires authenticated requests
--    For public API routes, use anon key which bypasses RLS but queries
--    are still filtered by WHERE clauses in the code
--
-- 2. Service role key bypasses RLS completely - use only server-side
--
-- 3. Indexes improve query performance but slightly slow down writes
--    Monitor and adjust based on your usage patterns
--
-- 4. Full-text search indexes (GIN) require pg_trgm extension:
--    CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- ============================================

