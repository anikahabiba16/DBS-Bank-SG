CREATE TABLE IF NOT EXISTS public.sub_admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'sub_admin',
  permissions JSONB NOT NULL DEFAULT '["messages"]'::jsonb,
  assigned_customer_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sub_admins ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all client operations since admin panel manages auth logic
CREATE POLICY "Allow public all on sub_admins"
  ON public.sub_admins
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sub_admins;