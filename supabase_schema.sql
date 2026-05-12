-- =============================================
-- BEANS & BUTTER CAFE - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Users (Owner + Manager)
CREATE TABLE IF NOT EXISTS users (
                                     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'manager',
    created_at TIMESTAMP DEFAULT NOW()
    );

-- Product Categories
CREATE TABLE IF NOT EXISTS categories (
                                          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#8B6F47',
    created_at TIMESTAMP DEFAULT NOW()
    );

-- Products
CREATE TABLE IF NOT EXISTS products (
                                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    description TEXT DEFAULT '',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
    );

-- Orders
CREATE TABLE IF NOT EXISTS orders (
                                      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_type TEXT DEFAULT 'none',
    discount_value NUMERIC(10,2) DEFAULT 0,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    status TEXT DEFAULT 'completed',
    note TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
    );

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
                                           id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL
    );

-- Cost Categories
CREATE TABLE IF NOT EXISTS cost_categories (
                                               id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#E07B39',
    created_at TIMESTAMP DEFAULT NOW()
    );

-- Daily Costs
CREATE TABLE IF NOT EXISTS daily_costs (
                                           id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    cost_category_id UUID REFERENCES cost_categories(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
    );

-- =============================================
-- SEED DEFAULT DATA
-- =============================================

INSERT INTO users (username, password, role) VALUES
                                                 ('owner', 'owner123', 'owner'),
                                                 ('manager', 'manager123', 'manager')
    ON CONFLICT (username) DO NOTHING;

INSERT INTO categories (name, color) VALUES
                                         ('Coffee', '#6F4E37'),
                                         ('Tea', '#2E8B57'),
                                         ('Food', '#D2691E'),
                                         ('Cold Drinks', '#4682B4'),
                                         ('Desserts', '#DB7093')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO cost_categories (name, color) VALUES
                                              ('Ingredients', '#E07B39'),
                                              ('Utilities', '#4682B4'),
                                              ('Staff', '#2E8B57'),
                                              ('Rent', '#9B59B6'),
                                              ('Maintenance', '#E74C3C')
    ON CONFLICT (name) DO NOTHING;

-- Sample products (will use category IDs)
INSERT INTO products (name, price, category_id) VALUES
                                                    ('Espresso', 150, (SELECT id FROM categories WHERE name='Coffee')),
                                                    ('Cappuccino', 250, (SELECT id FROM categories WHERE name='Coffee')),
                                                    ('Latte', 280, (SELECT id FROM categories WHERE name='Coffee')),
                                                    ('Americano', 200, (SELECT id FROM categories WHERE name='Coffee')),
                                                    ('Green Tea', 180, (SELECT id FROM categories WHERE name='Tea')),
                                                    ('Masala Chai', 120, (SELECT id FROM categories WHERE name='Tea')),
                                                    ('Butter Toast', 120, (SELECT id FROM categories WHERE name='Food')),
                                                    ('Club Sandwich', 350, (SELECT id FROM categories WHERE name='Food')),
                                                    ('Pancakes', 280, (SELECT id FROM categories WHERE name='Food')),
                                                    ('Fresh Juice', 200, (SELECT id FROM categories WHERE name='Cold Drinks')),
                                                    ('Lemonade', 150, (SELECT id FROM categories WHERE name='Cold Drinks')),
                                                    ('Brownie', 180, (SELECT id FROM categories WHERE name='Desserts')),
                                                    ('Cheesecake', 320, (SELECT id FROM categories WHERE name='Desserts'));

-- =============================================
-- DISABLE Row Level Security (for simplicity)
-- =============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE cost_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_costs DISABLE ROW LEVEL SECURITY;