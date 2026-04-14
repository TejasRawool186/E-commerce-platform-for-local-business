-- MySQL Database Setup Script for LocalB2B

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS local_b2b_2;

-- Use the database
USE local_b2b_2;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('seller', 'retailer', 'admin') NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  businessName VARCHAR(255),
  businessType ENUM('Manufacturing', 'Trading', 'Service Provider', 'Distributor'),
  address VARCHAR(255) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  sellerId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('electronics', 'machinery', 'furniture', 'food', 'textiles', 'chemicals', 'other') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  moq INT NOT NULL,
  unit VARCHAR(50) DEFAULT 'pieces',
  brand VARCHAR(100),
  leadTime INT,
  images JSON,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  retailerId VARCHAR(36) NOT NULL,
  sellerId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  totalAmount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'ordered', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'pending',
  orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  invoiceNumber VARCHAR(50),
  invoicePath VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (retailerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Create order timeline table
CREATE TABLE IF NOT EXISTS order_timeline (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  status ENUM('pending', 'ordered', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL,
  message VARCHAR(255),
  occurredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_products_sellerId ON products(sellerId);
CREATE INDEX idx_orders_retailerId ON orders(retailerId);
CREATE INDEX idx_orders_sellerId ON orders(sellerId);
CREATE INDEX idx_orders_productId ON orders(productId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_timeline_orderId ON order_timeline(orderId);

-- Create admin user if not exists
INSERT INTO users (id, email, password, role, firstName, lastName, address, pincode, isActive)
VALUES (
  UUID(), 
  'admin@localb2b.com', 
  '$2a$10$eCJgzBJ.hxVXDo1RgRNMn.a1.Q2s.KXH5D5JK.xGFVzSQQpLtvnVq', -- password: admin123
  'admin',
  'Admin',
  'User',
  'Admin Address',
  '000000',
  TRUE
) ON DUPLICATE KEY UPDATE email = email;