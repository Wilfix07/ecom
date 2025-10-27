# Supabase Setup Guide

This document explains the Supabase database setup and recommended optimizations for the TechMart Haiti e-commerce platform.

## ✅ What's Already Set Up

1. **Database Schema**: All tables created (products, orders, customers, coupons)
2. **Sample Data**: Pre-populated with realistic Haitian e-commerce data
3. **Row Level Security (RLS)**: Enabled on all tables
4. **React Integration**: Custom hooks for data fetching
5. **TypeScript Types**: Generated from database schema

## 📊 Database Tables

### Products Table
```sql
- id (BIGSERIAL)
- name (TEXT)
- price (DECIMAL)
- category (TEXT)
- image (TEXT - emoji)
- rating (DECIMAL)
- reviews (INTEGER)
- stock (INTEGER)
- sales (INTEGER)
- discount (INTEGER - percentage)
- created_at, updated_at (TIMESTAMPTZ)
```

### Orders Table
```sql
- id (TEXT - order number)
- customer_id (BIGINT - FK to customers)
- customer_name (TEXT)
- total (DECIMAL)
- status (TEXT - pending/processing/shipped/delivered)
- items (INTEGER)
- order_date (DATE)
- created_at, updated_at (TIMESTAMPTZ)
```

### Customers Table
```sql
- id (BIGSERIAL)
- name (TEXT)
- email (TEXT UNIQUE)
- orders (INTEGER - count)
- spent (DECIMAL - total)
- joined (TIMESTAMPTZ)
- created_at, updated_at (TIMESTAMPTZ)
```

### Coupons Table
```sql
- id (BIGSERIAL)
- code (TEXT UNIQUE)
- discount (DECIMAL)
- type (TEXT - percentage/fixed)
- active (BOOLEAN)
- uses (INTEGER)
- created_at, updated_at (TIMESTAMPTZ)
```

## 🔐 Current RLS Policies

### Products
- ✅ Public read access
- ✅ Authenticated users can insert/update/delete

### Orders, Customers
- ✅ Authenticated users only

### Coupons
- ✅ Public read for active coupons
- ✅ Authenticated users full access

## ⚡ Recommended Performance Optimizations

The Supabase advisor has identified some performance improvements:

### 1. Add Index to Foreign Key
```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

### 2. Optimize RLS Policies (Auth Function Calls)
Replace `auth.role()` with `(select auth.role())` in all policies to prevent re-evaluation per row.

**Example for products table:**
```sql
-- Drop existing policies
DROP POLICY "Allow authenticated users to insert" ON products;
DROP POLICY "Allow authenticated users to update" ON products;
DROP POLICY "Allow authenticated users to delete" ON products;

-- Create optimized policies
CREATE POLICY "Allow authenticated users to insert" ON products
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON products
  FOR UPDATE USING ((select auth.role()) = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON products
  FOR DELETE USING ((select auth.role()) = 'authenticated');
```

### 3. Simplify Coupons RLS Policies
Currently has multiple permissive policies. Simplify to one policy per action.

```sql
-- Drop existing policies
DROP POLICY "Allow public read access to active coupons" ON coupons;
DROP POLICY "Allow authenticated users full access to coupons" ON coupons;

-- Create simplified policy
CREATE POLICY "Allow read access to coupons" ON coupons
  FOR SELECT USING (active = true OR (select auth.role()) = 'authenticated');

CREATE POLICY "Allow authenticated users to modify coupons" ON coupons
  FOR ALL USING ((select auth.role()) = 'authenticated');
```

## 🚀 How to Apply Optimizations

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the optimization queries
4. Execute them

### Option 2: Using Supabase MCP (if available)
Run migrations through the Supabase CLI or MCP tools.

## 🔄 Real-time Features (Future)

To enable real-time updates:

```javascript
// In your hooks (e.g., useProducts.js)
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Subscribe to changes
useEffect(() => {
  const subscription = supabase
    .channel('products-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, 
      (payload) => {
        console.log('Products changed:', payload);
        refetch(); // Refetch data
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## 🔑 Authentication (Future)

To add user authentication:

```javascript
// In src/lib/supabase.js or a new auth context
import { supabase } from './supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## 📝 Notes

- The current setup uses public access for products and coupons for demo purposes
- In production, you should implement proper authentication
- Consider adding audit logs for sensitive operations
- Add proper error handling and validation in your React components
- Implement rate limiting for API calls

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/database-linter)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

