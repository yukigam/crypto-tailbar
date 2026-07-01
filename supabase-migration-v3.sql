-- v3: Create demo_positions table

CREATE TABLE IF NOT EXISTS public.demo_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(user_id),
  coin TEXT NOT NULL,
  side TEXT NOT NULL,
  amount NUMERIC(16,8) NOT NULL,
  entry_price NUMERIC(16,8) NOT NULL,
  sl NUMERIC(16,8),
  tp NUMERIC(16,8),
  status TEXT NOT NULL DEFAULT 'open',
  open_time TIMESTAMPTZ DEFAULT now(),
  close_time TIMESTAMPTZ,
  exit_price NUMERIC(16,8),
  pnl NUMERIC(16,8)
);

CREATE INDEX IF NOT EXISTS idx_positions_user_status ON public.demo_positions(user_id, status);
