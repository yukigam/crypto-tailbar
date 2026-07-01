-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  virtual_balance NUMERIC(16,2) DEFAULT 10000.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create demo_portfolio table
CREATE TABLE IF NOT EXISTS public.demo_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id),
  coin TEXT NOT NULL,
  amount NUMERIC(16,8) DEFAULT 0,
  UNIQUE (user_id, coin)
);

-- Insert demo portfolio rows for each user
CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (user_id, virtual_balance)
  VALUES (p_user_id, 10000.00)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
