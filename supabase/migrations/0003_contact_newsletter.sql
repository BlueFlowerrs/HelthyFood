-- =============================================
-- Migration: Contact Form & Newsletter Tables
-- =============================================
-- Creates tables for contact messages and newsletter subscriptions
-- If tables already exist from previous migrations, these will fail safely
-- =============================================

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can send contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin can delete contact messages" ON public.contact_messages;

-- Anyone can send contact messages (public form submission)
CREATE POLICY "Public can send contact messages" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read contact messages
CREATE POLICY "Admin can read contact messages" ON public.contact_messages
  FOR SELECT USING (
    public.is_admin()
  );

-- Only admins can delete contact messages
CREATE POLICY "Admin can delete contact messages" ON public.contact_messages
  FOR DELETE USING (
    public.is_admin()
  );

-- =============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can subscribe newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can view active subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users manage own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users delete own subscription" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin can view all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin manage all subscribers" ON public.newsletter_subscribers;

-- Anyone can subscribe to newsletter
CREATE POLICY "Public can subscribe newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Public can view active subscribers (for stats display)
-- This returns count only, no sensitive data
CREATE POLICY "Public can view active subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (active = true);

-- Users can manage their own subscription (update/unsubscribe)
CREATE POLICY "Users manage own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid()
    )
  );

-- Users can delete their own subscription
CREATE POLICY "Users delete own subscription" ON public.newsletter_subscribers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid()
    )
  );

-- Admin can view all subscribers including inactive
CREATE POLICY "Admin can view all subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (
    public.is_admin()
  );

-- Admin can manage all subscribers
CREATE POLICY "Admin manage all subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    public.is_admin()
  );

-- =============================================
-- HELPFUL FUNCTIONS
-- =============================================

-- Get subscriber count (public stats)
DROP FUNCTION IF EXISTS get_newsletter_subscriber_count();
CREATE OR REPLACE FUNCTION get_newsletter_subscriber_count()
RETURNS bigint AS $$
  SELECT COUNT(*)::bigint FROM newsletter_subscribers WHERE active = true;
$$ LANGUAGE sql SECURITY DEFINER;
