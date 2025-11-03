-- Add A/B testing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pricing_variant text CHECK (pricing_variant IN ('A', 'B')),
ADD COLUMN IF NOT EXISTS user_credits integer DEFAULT 3;

-- Create user_payments table for tracking purchases
CREATE TABLE IF NOT EXISTS public.user_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant text NOT NULL CHECK (variant IN ('A', 'B')),
  credits_purchased integer NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'ILS',
  payment_status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user_payments
ALTER TABLE public.user_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_payments
CREATE POLICY "Users can view their own payments"
  ON public.user_payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON public.user_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_payments_user_id ON public.user_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pricing_variant ON public.profiles(pricing_variant);

-- Update agent_runs to include variant and credits info
ALTER TABLE public.agent_runs 
ADD COLUMN IF NOT EXISTS variant text,
ADD COLUMN IF NOT EXISTS remaining_credits integer;