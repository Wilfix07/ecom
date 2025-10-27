-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid()::text = user_id);

-- Policy: Public can read all profiles (for social features)
CREATE POLICY "Public can read all profiles"
ON user_profiles
FOR SELECT
USING (true);

-- Enable RLS on bookmarks if not already enabled
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks"
ON bookmarks
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Enable RLS on notifications if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can update their own notifications
CREATE POLICY "Users can update own notifications"
ON notifications
FOR UPDATE
USING (auth.uid()::text = user_id);

-- Enable RLS on activity_logs if not already enabled
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activity logs
CREATE POLICY "Users can read own activity logs"
ON activity_logs
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own activity logs
CREATE POLICY "Users can insert own activity logs"
ON activity_logs
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Enable RLS on notification_settings if not already enabled
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own notification settings
CREATE POLICY "Users can manage own notification settings"
ON notification_settings
FOR ALL
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Enable RLS on orders for user-specific access
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders"
ON orders
FOR SELECT
USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
ON orders
FOR INSERT
WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'authenticated');

-- Enable RLS on order_items for user-specific access
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read order items for their own orders
CREATE POLICY "Users can read own order items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()::text
  )
  OR auth.role() = 'authenticated'
);

-- Policy: Users can insert order items for their own orders
CREATE POLICY "Users can insert own order items"
ON order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()::text
  )
  OR auth.role() = 'authenticated'
);

