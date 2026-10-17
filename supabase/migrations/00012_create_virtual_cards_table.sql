CREATE TABLE IF NOT EXISTS public.virtual_cards (
  id text PRIMARY KEY,
  user_phone text NOT NULL,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  card_number text,
  cardholder_name text,
  expiry_date text,
  cvv text,
  card_type text DEFAULT 'DBS Platinum Virtual',
  spending_limit numeric DEFAULT 100000,
  balance numeric DEFAULT 0,
  requested_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'virtual_cards' AND policyname = 'Public access virtual_cards') THEN
    CREATE POLICY "Public access virtual_cards" ON public.virtual_cards FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.virtual_cards;
