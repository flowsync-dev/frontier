-- Comprehensive Row Level Security Setup for Frontier SaaS
-- This script ensures all tables have proper RLS policies with principle of least privilege

-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================
-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can only insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent users from deleting their own profiles (data retention)
-- No DELETE policy - users cannot delete their accounts

-- ============================================================================
-- STORES TABLE RLS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Store owners can view their own stores" ON stores;
DROP POLICY IF EXISTS "Store owners can insert stores" ON stores;
DROP POLICY IF EXISTS "Store owners can update their own stores" ON stores;
DROP POLICY IF EXISTS "Store owners can delete their own stores" ON stores;
DROP POLICY IF EXISTS "Anyone can view published stores" ON stores;

-- Store owners can view their own stores
CREATE POLICY "Store owners can view their own stores" ON stores
  FOR SELECT USING (auth.uid() = owner_id);

-- Store owners can insert new stores
CREATE POLICY "Store owners can insert stores" ON stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Store owners can update their own stores
CREATE POLICY "Store owners can update their own stores" ON stores
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Store owners can delete their own stores
CREATE POLICY "Store owners can delete their own stores" ON stores
  FOR DELETE USING (auth.uid() = owner_id);

-- Public: Anyone can view published stores (for storefront)
CREATE POLICY "Anyone can view published stores" ON stores
  FOR SELECT USING (is_published = TRUE);

-- ============================================================================
-- PRODUCTS TABLE RLS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Store owners can view their own products" ON products;
DROP POLICY IF EXISTS "Store owners can insert products" ON products;
DROP POLICY IF EXISTS "Store owners can update their own products" ON products;
DROP POLICY IF EXISTS "Store owners can delete their own products" ON products;
DROP POLICY IF EXISTS "Anyone can view products from published stores" ON products;

-- Store owners can view all their products (including inactive ones)
CREATE POLICY "Store owners can view their own products" ON products
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Store owners can insert products into their stores
CREATE POLICY "Store owners can insert products" ON products
  FOR INSERT WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Store owners can update their own products
CREATE POLICY "Store owners can update their own products" ON products
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Store owners can delete their own products
CREATE POLICY "Store owners can delete their own products" ON products
  FOR DELETE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Public: Anyone can view active products from published stores (for storefront)
CREATE POLICY "Anyone can view products from published stores" ON products
  FOR SELECT USING (
    is_active = TRUE AND
    store_id IN (
      SELECT id FROM stores WHERE is_published = TRUE
    )
  );

-- ============================================================================
-- SALES TABLE RLS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Store owners can view their own sales" ON sales;
DROP POLICY IF EXISTS "Anyone can insert sales" ON sales;
DROP POLICY IF EXISTS "Store owners can update their own sales" ON sales;

-- Store owners can view all sales from their stores
CREATE POLICY "Store owners can view their own sales" ON sales
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Anyone can insert sales (customers making purchases)
-- This allows unauthenticated users to create sales records
CREATE POLICY "Anyone can insert sales" ON sales
  FOR INSERT WITH CHECK (TRUE);

-- Store owners can update their own sales (e.g., mark as completed)
CREATE POLICY "Store owners can update their own sales" ON sales
  FOR UPDATE USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Prevent sales deletion (audit trail)
-- No DELETE policy - sales records cannot be deleted

-- ============================================================================
-- VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- 1. Users table: Users can only view/update their own profiles
-- 2. Stores table: Owners manage their stores; public can view published stores
-- 3. Products table: Owners manage their products; public can view active products from published stores
-- 4. Sales table: Owners view their sales; anyone can create sales (for checkout); no deletion allowed
-- 5. All policies use WITH CHECK to ensure data integrity on updates
-- 6. Cascading deletes are configured at the table level for data consistency
