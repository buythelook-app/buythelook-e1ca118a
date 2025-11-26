-- ==========================================
-- COMPLETE DATABASE SETUP FOR BUYTHELOOK
-- ==========================================
-- Run this ONCE on a fresh Supabase Auth database
-- This script is SAFE - uses IF NOT EXISTS everywhere
-- ==========================================

-- ==========================================
-- 1. PROFILES TABLE
-- Stores user info, credits, and tour tracking
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name text,
  avatar_url text,
  credits int DEFAULT 10,
  -- Tour/Onboarding tracking
  onboarding_completed boolean DEFAULT false,
  credits_tour_completed boolean DEFAULT false,
  outfits_tour_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add tour columns if table already exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_tour_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS outfits_tour_completed boolean DEFAULT false;

-- ==========================================
-- 2. STYLE_QUIZZES TABLE
-- Stores user quiz answers and preferences
-- ==========================================
CREATE TABLE IF NOT EXISTS public.style_quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  vision text,
  budget text,
  occasion text,
  mood text,
  uploaded_image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. STYLED_PROFILES TABLE
-- Stores body measurements and style preferences
-- ==========================================
CREATE TABLE IF NOT EXISTS public.styled_profiles (
  user_id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  body_type text,
  face_shape text,
  skin_tone text,
  default_budget text,
  default_occasion text,
  preferred_colors jsonb,
  avoided_colors jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 4. GENERATED_OUTFITS TABLE
-- Stores AI-generated outfit collections
-- ==========================================
CREATE TABLE IF NOT EXISTS public.generated_outfits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  quiz_id uuid REFERENCES public.style_quizzes(id),
  name text NOT NULL,
  description text,
  items jsonb NOT NULL,
  is_unlocked boolean DEFAULT false,
  links_unlocked boolean DEFAULT false,
  total_price numeric(10,2),
  why_it_works text,
  stylist_notes jsonb,
  -- Feedback columns
  is_liked boolean DEFAULT NULL,
  feedback_text text,
  feedback_reason text,
  purchased_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if table already exists
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS links_unlocked boolean DEFAULT false;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS total_price numeric(10,2);
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS why_it_works text;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS stylist_notes jsonb;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS is_liked boolean DEFAULT NULL;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS feedback_text text;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS feedback_reason text;
ALTER TABLE public.generated_outfits ADD COLUMN IF NOT EXISTS purchased_at timestamp with time zone;

-- ==========================================
-- 5. PRODUCT_INTERACTIONS TABLE
-- Tracks likes/dislikes/purchases for AI learning
-- ==========================================
CREATE TABLE IF NOT EXISTS public.product_interactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  product_id text NOT NULL,
  product_url text,
  interaction_type text CHECK (interaction_type IN ('disliked', 'purchased', 'liked')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 6. PAYMENT_TRANSACTIONS TABLE
-- Tracks all Stripe payments
-- ==========================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  stripe_session_id text UNIQUE NOT NULL,
  stripe_payment_intent_id text,
  amount_cents int NOT NULL,
  currency text DEFAULT 'usd',
  payment_type text CHECK (payment_type IN ('outfit_unlock', 'credit_purchase')),
  metadata jsonb,
  status text CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styled_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. RLS POLICIES
-- ==========================================

-- Drop existing policies first (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own quizzes" ON public.style_quizzes;
DROP POLICY IF EXISTS "Users can insert own quizzes" ON public.style_quizzes;
DROP POLICY IF EXISTS "Users can view own styled profile" ON public.styled_profiles;
DROP POLICY IF EXISTS "Users can insert own styled profile" ON public.styled_profiles;
DROP POLICY IF EXISTS "Users can update own styled profile" ON public.styled_profiles;
DROP POLICY IF EXISTS "Users can view own outfits" ON public.generated_outfits;
DROP POLICY IF EXISTS "Users can insert own outfits" ON public.generated_outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON public.generated_outfits;
DROP POLICY IF EXISTS "Users can view own interactions" ON public.product_interactions;
DROP POLICY IF EXISTS "Users can insert own interactions" ON public.product_interactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.payment_transactions;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- STYLE_QUIZZES policies
CREATE POLICY "Users can view own quizzes" ON public.style_quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quizzes" ON public.style_quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- STYLED_PROFILES policies
CREATE POLICY "Users can view own styled profile" ON public.styled_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own styled profile" ON public.styled_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own styled profile" ON public.styled_profiles FOR UPDATE USING (auth.uid() = user_id);

-- GENERATED_OUTFITS policies
CREATE POLICY "Users can view own outfits" ON public.generated_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits" ON public.generated_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON public.generated_outfits FOR UPDATE USING (auth.uid() = user_id);

-- PRODUCT_INTERACTIONS policies
CREATE POLICY "Users can view own interactions" ON public.product_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON public.product_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PAYMENT_TRANSACTIONS policies
CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 9. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.style_quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.generated_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON public.generated_outfits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_feedback ON public.generated_outfits(user_id, is_liked);
CREATE INDEX IF NOT EXISTS idx_interactions_user_product ON public.product_interactions(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_session_id ON public.payment_transactions(stripe_session_id);

-- ==========================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, credits)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    10
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();