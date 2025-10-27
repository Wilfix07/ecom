-- Fix RLS Policies for Settings Table
-- This script fixes the issue where settings are not loading

-- Step 1: Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'json')),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated users to modify settings" ON settings;

-- Step 4: Create new policies that allow PUBLIC read access
-- This is safe for settings because they are read-only configuration
CREATE POLICY "Allow public read access to settings"
ON settings
FOR SELECT
TO public
USING (true);

-- Step 5: Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to modify settings"
ON settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 6: Insert default settings if table is empty
-- Store Information
INSERT INTO settings (key, value, type, category, label, description) VALUES
('store_name', 'TechMart Haiti', 'text', 'store', 'Store Name', 'The name of your store'),
('store_email', 'info@techmart-haiti.com', 'text', 'store', 'Store Email', 'Contact email for your store'),
('store_phone', '+509 1234-5678', 'text', 'store', 'Store Phone', 'Contact phone number'),
('store_address', 'Port-au-Prince, Haiti', 'text', 'store', 'Store Address', 'Physical address of your store')
ON CONFLICT (key) DO NOTHING;

-- Payment Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('currency', 'HTG', 'text', 'payment', 'Currency', 'Default currency code'),
('currency_symbol', 'HTG', 'text', 'payment', 'Currency Symbol', 'Symbol for the currency'),
('payment_enabled', 'true', 'boolean', 'payment', 'Payment Enabled', 'Enable or disable payment processing'),
('payment_methods', 'cash,card,bank', 'text', 'payment', 'Payment Methods', 'Accepted payment methods (comma-separated)'),
('multi_currency_enabled', 'true', 'boolean', 'payment', 'Multi-Currency Support', 'Allow customers to pay in HTG or USD'),
('default_currency', 'HTG', 'text', 'payment', 'Default Currency', 'Default currency for prices'),
('exchange_rate_htg_to_usd', '135', 'number', 'payment', 'Exchange Rate (HTG to USD)', 'Conversion rate from Haitian Gourdes to US Dollars'),
('auto_currency_conversion', 'true', 'boolean', 'payment', 'Auto Currency Conversion', 'Automatically convert prices based on selected currency')
ON CONFLICT (key) DO NOTHING;

-- Shipping Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('shipping_enabled', 'true', 'boolean', 'shipping', 'Shipping Enabled', 'Enable or disable shipping'),
('free_shipping_threshold', '2000', 'number', 'shipping', 'Free Shipping Threshold', 'Minimum order amount for free shipping (in HTG)'),
('shipping_fee', '500', 'number', 'shipping', 'Standard Shipping Fee', 'Standard shipping fee (in HTG)')
ON CONFLICT (key) DO NOTHING;

-- Tax Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('tax_enabled', 'true', 'boolean', 'tax', 'Tax Enabled', 'Enable or disable tax'),
('tax_rate', '10', 'number', 'tax', 'Tax Rate (%)', 'Tax rate percentage')
ON CONFLICT (key) DO NOTHING;

-- Inventory Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('low_stock_threshold', '20', 'number', 'inventory', 'Low Stock Alert', 'Product quantity threshold for low stock alerts'),
('auto_update_stock', 'true', 'boolean', 'inventory', 'Auto Update Stock', 'Automatically update stock when orders are placed')
ON CONFLICT (key) DO NOTHING;

-- Notification Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('notify_new_orders', 'true', 'boolean', 'notifications', 'Notify New Orders', 'Send notification when new orders are received'),
('notify_low_stock', 'true', 'boolean', 'notifications', 'Notify Low Stock', 'Send notification when products reach low stock'),
('admin_email', 'admin@techmart-haiti.com', 'text', 'notifications', 'Admin Email', 'Email address for admin notifications')
ON CONFLICT (key) DO NOTHING;

-- Social Media Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('facebook_url', 'https://facebook.com/techmart-haiti', 'text', 'social', 'Facebook URL', 'Facebook page URL'),
('instagram_url', 'https://instagram.com/techmart-haiti', 'text', 'social', 'Instagram URL', 'Instagram profile URL'),
('twitter_url', 'https://twitter.com/techmart-haiti', 'text', 'social', 'Twitter URL', 'Twitter profile URL')
ON CONFLICT (key) DO NOTHING;

-- Appearance Settings
INSERT INTO settings (key, value, type, category, label, description) VALUES
('theme', 'light', 'text', 'appearance', 'Theme', 'Website theme (light/dark)'),
('primary_color', '#2563eb', 'text', 'appearance', 'Primary Color', 'Primary brand color (hex code)'),
('footer_text', '© 2025 TechMart Haiti. Tout dwa rezève.', 'text', 'appearance', 'Footer Text', 'Text displayed in the footer')
ON CONFLICT (key) DO NOTHING;

-- Success message
SELECT 'Settings table fixed! All policies updated and default data inserted.' AS result;

