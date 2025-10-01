/*
  # B2B Marketplace Database Schema

  ## Overview
  Complete database schema for a B2B marketplace platform connecting retailers and sellers.
  
  ## New Tables Created
  
  ### 1. `users` - User Management
  Stores all platform users (retailers, sellers, admins)
  - `id` (uuid, primary key) - Unique user identifier
  - `username` (text, unique) - Username for login
  - `email` (text, unique) - User email address
  - `password_hash` (text) - Hashed password for security
  - `role` (text) - User role: 'retailer', 'seller', or 'admin'
  - `phone_number` (text) - Phone for SMS notifications
  - `business_name` (text) - Company/business name
  - `address` (text) - Business address
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. `products` - Product Catalog
  Stores all products listed by sellers
  - `id` (uuid, primary key) - Unique product identifier
  - `seller_id` (uuid, foreign key) - References users(id)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (numeric) - Unit price
  - `image_url` (text) - Product image URL
  - `stock_quantity` (integer) - Available stock count
  - `created_at` (timestamptz) - Product creation timestamp
  
  ### 3. `orders` - Order Management
  Stores order information and status
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number (ORD-YYYY-NNNN)
  - `retailer_id` (uuid, foreign key) - References users(id)
  - `seller_id` (uuid, foreign key) - References users(id)
  - `product_id` (uuid, foreign key) - References products(id)
  - `quantity` (integer) - Order quantity
  - `unit_price` (numeric) - Price per unit at order time
  - `total_amount` (numeric) - Total order amount
  - `status` (text) - Order status: 'Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
  - `invoice_path` (text) - Path to generated PDF invoice
  - `invoice_number` (text) - Invoice number (INV-YYYY-NNNN)
  - `order_date` (timestamptz) - Order placement timestamp
  - `shipped_date` (timestamptz) - Shipping timestamp
  - `delivered_date` (timestamptz) - Delivery timestamp
  
  ## Security Configuration
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies:
  
  #### Users Table Policies
  1. Users can view their own profile
  2. Users can update their own profile
  3. Anyone can create a new account (registration)
  4. Sellers can view retailer info for their orders
  5. Retailers can view seller info for their orders
  
  #### Products Table Policies
  1. Everyone can view all products (public catalog)
  2. Sellers can create their own products
  3. Sellers can update their own products
  4. Sellers can delete their own products
  
  #### Orders Table Policies
  1. Retailers can view their own orders
  2. Sellers can view orders for their products
  3. Retailers can create orders
  4. Sellers can update order status for their products
  
  ## Important Notes
  - All IDs use UUID for security and scalability
  - Timestamps use timestamptz for timezone awareness
  - Passwords are stored as hashes only (never plaintext)
  - Order numbers and invoice numbers are auto-generated
  - Stock quantities are updated on order placement
  - Invoice generation happens when status changes to 'Shipped'
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('retailer', 'seller', 'admin')),
  phone_number text,
  business_name text,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  image_url text,
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  retailer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'Ordered' CHECK (status IN ('Ordered', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
  invoice_path text,
  invoice_number text,
  order_date timestamptz DEFAULT now(),
  shipped_date timestamptz,
  delivered_date timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_retailer_id ON orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create account"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Sellers can view retailer info for their orders"
  ON users FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT retailer_id FROM orders WHERE seller_id = auth.uid()
    )
  );

CREATE POLICY "Retailers can view seller info for their orders"
  ON users FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT seller_id FROM orders WHERE retailer_id = auth.uid()
    )
  );

-- Products table policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Sellers can create own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Orders table policies
CREATE POLICY "Retailers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = retailer_id);

CREATE POLICY "Sellers can view orders for their products"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Retailers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = retailer_id);

CREATE POLICY "Sellers can update order status"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  year_part text;
  seq_num integer;
  order_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO seq_num
  FROM orders
  WHERE EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM NOW());
  
  order_num := 'ORD-' || year_part || '-' || LPAD(seq_num::text, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_part text;
  seq_num integer;
  invoice_num text;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO seq_num
  FROM orders
  WHERE invoice_number IS NOT NULL
  AND EXTRACT(YEAR FROM order_date) = EXTRACT(YEAR FROM NOW());
  
  invoice_num := 'INV-' || year_part || '-' || LPAD(seq_num::text, 4, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;