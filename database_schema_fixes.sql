-- =============================================
-- Database Schema Fixes and Optimizations
-- TechMart Haiti E-commerce Platform
-- =============================================
-- This migration adds missing constraints, indexes, and tables
-- for optimal performance and data integrity.

-- =============================================
-- 1. CREATE MISSING TABLES
-- =============================================

-- Customer Statistics Table (used by CustomerProfileDashboard)
CREATE TABLE IF NOT EXISTS customer_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  delivered_orders integer DEFAULT 0,
  avg_order_value numeric DEFAULT 0,
  last_order_date timestamptz,
  first_order_date timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customer_statistics_user_id_key UNIQUE (user_id)
);

-- =============================================
-- 2. ADD MISSING FOREIGN KEY CONSTRAINTS
-- =============================================

-- Coupon redemptions should reference coupons table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coupon_redemptions_coupon_id_fkey'
  ) THEN
    ALTER TABLE coupon_redemptions 
    ADD CONSTRAINT coupon_redemptions_coupon_id_fkey 
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE;
  END IF;
END $$;

-- User profiles default address reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_default_address_id_fkey'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_default_address_id_fkey 
    FOREIGN KEY (default_address_id) REFERENCES customer_addresses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Roulette results coupon reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roulette_results_coupon_id_fkey'
  ) THEN
    ALTER TABLE roulette_results 
    ADD CONSTRAINT roulette_results_coupon_id_fkey 
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- 3. ADD UNIQUE CONSTRAINTS
-- =============================================

-- Prevent duplicate bookmarks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookmarks_user_product_unique'
  ) THEN
    ALTER TABLE bookmarks 
    ADD CONSTRAINT bookmarks_user_product_unique 
    UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Prevent duplicate wishlist entries
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_wishlist_user_product_unique'
  ) THEN
    ALTER TABLE customer_wishlist 
    ADD CONSTRAINT customer_wishlist_user_product_unique 
    UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Prevent duplicate reviews per user per product
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_user_product_unique'
  ) THEN
    ALTER TABLE reviews 
    ADD CONSTRAINT reviews_user_product_unique 
    UNIQUE (user_id, product_id);
  END IF;
END $$;

-- Prevent duplicate loyalty badges
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'loyalty_badges_user_badge_unique'
  ) THEN
    ALTER TABLE loyalty_badges 
    ADD CONSTRAINT loyalty_badges_user_badge_unique 
    UNIQUE (user_id, badge_type);
  END IF;
END $$;

-- =============================================
-- 4. ADD PERFORMANCE INDEXES
-- =============================================

-- Orders table indexes (most queried)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Order items for fast lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Products for search/filter/sort
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_approved ON products(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales ON products(sales DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- User-related queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_product_id ON bookmarks(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_user_id ON customer_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_product_id ON customer_wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- Customer addresses
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(user_id, is_default) WHERE is_default = true;

-- Chat system indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agent_id ON chat_conversations(agent_id);

-- Points and loyalty system
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_status ON points_history(status);
CREATE INDEX IF NOT EXISTS idx_points_history_expires_at ON points_history(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_loyalty_badges_user_id ON loyalty_badges(user_id);

-- Coupon system
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order_id ON coupon_redemptions(order_id);

-- Payment and shipping
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking_events_order_id ON shipping_tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_tracking_events_tracking_number ON shipping_tracking_events(tracking_number);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_page_url ON heatmap_data(page_url);
CREATE INDEX IF NOT EXISTS idx_heatmap_data_session_id ON heatmap_data(session_id);

-- Blog system
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Email notifications
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_order_id ON email_notifications(order_id);

-- Customer statistics
CREATE INDEX IF NOT EXISTS idx_customer_statistics_user_id ON customer_statistics(user_id);

-- =============================================
-- 5. UPDATE CASCADE DELETE RULES
-- =============================================

-- Order items should cascade when order is deleted
DO $$ 
BEGIN
  ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
  ALTER TABLE order_items 
  ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
END $$;

-- Chat messages should cascade when conversation is deleted
DO $$ 
BEGIN
  ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_conversation_id_fkey;
  ALTER TABLE chat_messages 
  ADD CONSTRAINT chat_messages_conversation_id_fkey 
  FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;
END $$;

-- Blog comments should cascade when post is deleted
DO $$ 
BEGIN
  ALTER TABLE blog_comments DROP CONSTRAINT IF EXISTS blog_comments_post_id_fkey;
  ALTER TABLE blog_comments 
  ADD CONSTRAINT blog_comments_post_id_fkey 
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
END $$;

-- =============================================
-- 6. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- Function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_statistics (user_id, total_orders, total_spent, delivered_orders, avg_order_value, last_order_date, first_order_date)
  SELECT 
    user_id,
    COUNT(*) as total_orders,
    COALESCE(SUM(total), 0) as total_spent,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered_orders,
    COALESCE(AVG(total), 0) as avg_order_value,
    MAX(order_date) as last_order_date,
    MIN(order_date) as first_order_date
  FROM orders
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  GROUP BY user_id
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_spent = EXCLUDED.total_spent,
    delivered_orders = EXCLUDED.delivered_orders,
    avg_order_value = EXCLUDED.avg_order_value,
    last_order_date = EXCLUDED.last_order_date,
    first_order_date = EXCLUDED.first_order_date,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update customer statistics
DROP TRIGGER IF EXISTS update_customer_stats_on_order ON orders;
CREATE TRIGGER update_customer_stats_on_order
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_statistics();

-- Function to update product rating from reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update product ratings
DROP TRIGGER IF EXISTS update_product_rating_on_review ON reviews;
CREATE TRIGGER update_product_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- =============================================
-- 7. ADD ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can only see/edit their own
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Customer Addresses: Users can only manage their own
DROP POLICY IF EXISTS "Users can view own addresses" ON customer_addresses;
CREATE POLICY "Users can view own addresses" ON customer_addresses
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can manage own addresses" ON customer_addresses;
CREATE POLICY "Users can manage own addresses" ON customer_addresses
  FOR ALL USING (auth.uid()::text = user_id);

-- Bookmarks: Users can only manage their own
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid()::text = user_id);

-- Wishlist: Users can only manage their own
DROP POLICY IF EXISTS "Users can manage own wishlist" ON customer_wishlist;
CREATE POLICY "Users can manage own wishlist" ON customer_wishlist
  FOR ALL USING (auth.uid()::text = user_id);

-- Notifications: Users can only see their own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Orders: Users can only see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Order Items: Users can only see items from their orders
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()::text
    )
  );

-- Points and Loyalty: Users can only see their own
DROP POLICY IF EXISTS "Users can view own points" ON user_points;
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own points history" ON points_history;
CREATE POLICY "Users can view own points history" ON points_history
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own badges" ON loyalty_badges;
CREATE POLICY "Users can view own badges" ON loyalty_badges
  FOR SELECT USING (auth.uid()::text = user_id);

-- Customer Statistics: Users can only see their own
DROP POLICY IF EXISTS "Users can view own statistics" ON customer_statistics;
CREATE POLICY "Users can view own statistics" ON customer_statistics
  FOR SELECT USING (auth.uid()::text = user_id);

-- Payment History: Users can only see their own
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid()::text = user_id);

-- Activity Log: Users can only see their own
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log
  FOR SELECT USING (auth.uid()::text = user_id);

-- Products: Public read, authenticated write
DROP POLICY IF EXISTS "Public can view approved products" ON products;
CREATE POLICY "Public can view approved products" ON products
  FOR SELECT USING (approved = true OR auth.uid()::text = vendor_id);

DROP POLICY IF EXISTS "Vendors can manage own products" ON products;
CREATE POLICY "Vendors can manage own products" ON products
  FOR ALL USING (auth.uid()::text = vendor_id);

-- =============================================
-- 8. CREATE USEFUL VIEWS
-- =============================================

-- View for order details with items
CREATE OR REPLACE VIEW order_details_view AS
SELECT 
  o.id as order_id,
  o.user_id,
  o.customer_name,
  o.order_date,
  o.status,
  o.payment_status,
  o.total,
  o.currency,
  o.tracking_number,
  o.carrier,
  o.estimated_delivery,
  o.delivered_at,
  json_agg(
    json_build_object(
      'product_id', oi.product_id,
      'product_name', oi.product_name,
      'quantity', oi.quantity,
      'unit_price', oi.unit_price,
      'total_price', oi.total_price
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View for product statistics
CREATE OR REPLACE VIEW product_stats_view AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock,
  p.sales,
  p.rating,
  p.reviews,
  COUNT(DISTINCT b.user_id) as bookmarked_count,
  COUNT(DISTINCT w.user_id) as wishlisted_count,
  COUNT(DISTINCT r.id) as review_count
FROM products p
LEFT JOIN bookmarks b ON p.id = b.product_id
LEFT JOIN customer_wishlist w ON p.id = w.product_id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log completion
DO $$ 
BEGIN
  RAISE NOTICE 'Database schema fixes and optimizations completed successfully!';
  RAISE NOTICE 'Added: Missing tables, indexes, constraints, triggers, RLS policies, and views';
END $$;

