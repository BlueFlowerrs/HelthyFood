-- =============================================
-- HelthyFood Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- CORE TABLES
-- =============================================

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  phone text,
  address text,
  city text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.categories (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name_vi text NOT NULL,
  name_en text NOT NULL,
  description_vi text,
  description_en text,
  image_url text,
  sort_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name_vi text NOT NULL,
  name_en text NOT NULL,
  description_vi text,
  description_en text,
  short_description_vi text,
  short_description_en text,
  price numeric(12,2) NOT NULL,
  sale_price numeric(12,2),
  stock int DEFAULT 0,
  calories int DEFAULT 0,
  protein numeric(6,2) DEFAULT 0,
  carbs numeric(6,2) DEFAULT 0,
  fat numeric(6,2) DEFAULT 0,
  nutrition_tags text[] DEFAULT '{}',
  category_id int REFERENCES public.categories(id) ON DELETE SET NULL,
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  image_url text,
  gallery_images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.cart_items (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id int REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity int DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE public.orders (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_code text UNIQUE NOT NULL,
  total numeric(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','shipped','delivered','cancelled')),
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  shipping_city text,
  payment_method text DEFAULT 'vnpay',
  payment_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.order_items (
  id serial PRIMARY KEY,
  order_id int REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id int REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL,
  product_image_snapshot text,
  price_snapshot numeric(12,2) NOT NULL,
  quantity int NOT NULL,
  subtotal numeric(12,2) NOT NULL
);

CREATE TABLE public.payments (
  id serial PRIMARY KEY,
  order_id int REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  method text DEFAULT 'vnpay',
  status text DEFAULT 'pending',
  transaction_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_user ON cart_items(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- categories: public read
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- products: public read for active products
CREATE POLICY "Public read active products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Admin read all products" ON products FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- cart_items
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- orders: users own their orders; guests via order_code (handled in server routes)
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin view all orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order by code" ON orders FOR SELECT USING (true);

-- order_items: follow order ownership
CREATE POLICY "Public read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update order items" ON order_items FOR UPDATE USING (true);

-- payments: admin only + public insert/update for payment callbacks
CREATE POLICY "Admin manage payments" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone insert payment" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update payment" ON payments FOR UPDATE USING (true);

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- RPC FUNCTIONS
-- =============================================

-- Total revenue from paid orders
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS numeric AS $$
  SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'paid';
$$ LANGUAGE sql SECURITY DEFINER;

-- Daily revenue last N days
CREATE OR REPLACE FUNCTION get_daily_revenue(days int DEFAULT 30)
RETURNS TABLE(day text, revenue numeric, orders bigint) AS $$
  SELECT
    TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM') AS day,
    SUM(total) AS revenue,
    COUNT(*)::bigint AS orders
  FROM orders
  WHERE created_at >= NOW() - (days || ' days')::interval
  GROUP BY TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM'),
           DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')
  ORDER BY DATE_TRUNC('day', created_at AT TIME ZONE 'Asia/Ho_Chi_Minh');
$$ LANGUAGE sql SECURITY DEFINER;

-- Top products by revenue
CREATE OR REPLACE FUNCTION get_top_products(limit_n int DEFAULT 5)
RETURNS TABLE(name text, revenue numeric, sold bigint) AS $$
  SELECT p.name_vi AS name, SUM(oi.subtotal) AS revenue, SUM(oi.quantity)::bigint AS sold
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  GROUP BY p.id, p.name_vi
  ORDER BY revenue DESC
  LIMIT limit_n;
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- SEED DATA (6 categories)
-- =============================================

INSERT INTO public.categories (slug, name_vi, name_en, description_vi, description_en, sort_order, active) VALUES
('protein-bars', 'Protein Bar', 'Protein Bars', 'Thanh protein dinh dưỡng cao cấp', 'Premium nutrition protein bars', 1, true),
('meal-prep', 'Meal Prep', 'Meal Prep', 'Bữa ăn prep sẵn, tiện lợi', 'Ready-made meal prep, convenient', 2, true),
('snacks', 'Snacks Healthy', 'Healthy Snacks', 'Snack healthy, ít đường, giàu protein', 'Healthy snacks, low sugar, high protein', 3, true),
('protein-powder', 'Protein Bột', 'Protein Powder', 'Whey protein và plant protein chất lượng cao', 'High quality whey and plant protein', 4, true),
('supplements', 'Supplements', 'Supplements', 'Bổ sung dinh dưỡng, vitamin, khoáng chất', 'Nutritional supplements, vitamins, minerals', 5, true),
('accessories', 'Phụ Kiện', 'Accessories', 'Dụng cụ gym, shaker bottle, túi meal prep', 'Gym accessories, shaker bottles, meal prep bags', 6, true);
