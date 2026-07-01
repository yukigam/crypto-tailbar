-- v2: Add avg_buy_price to demo_portfolio + create trade_history table

ALTER TABLE IF EXISTS public.demo_portfolio
ADD COLUMN IF NOT EXISTS avg_buy_price NUMERIC(16,8) DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.demo_trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id),
  coin TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(16,8) NOT NULL,
  price NUMERIC(16,8) NOT NULL,
  total NUMERIC(16,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
