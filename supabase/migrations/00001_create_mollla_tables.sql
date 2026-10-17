-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.site_users (
  phone text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. LOAN APPLICATIONS
CREATE TABLE IF NOT EXISTS public.site_loans (
  id text PRIMARY KEY,
  user_phone text,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. DEPOSIT REQUESTS
CREATE TABLE IF NOT EXISTS public.site_deposits (
  id text PRIMARY KEY,
  user_phone text,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. WITHDRAWAL REQUESTS
CREATE TABLE IF NOT EXISTS public.site_withdrawals (
  id text PRIMARY KEY,
  user_phone text,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. LOAN INSTALLMENTS
CREATE TABLE IF NOT EXISTS public.site_installments (
  id text PRIMARY KEY,
  loan_id text,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. SYSTEM PAYMENT METHODS
CREATE TABLE IF NOT EXISTS public.site_payment_methods (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. FIXED DEPOSIT SCHEMES
CREATE TABLE IF NOT EXISTS public.site_dps_schemes (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. CUSTOMER FIXED DEPOSITS
CREATE TABLE IF NOT EXISTS public.site_customer_fixed_deposits (
  id text PRIMARY KEY,
  user_phone text,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. LOAN PACKAGES
CREATE TABLE IF NOT EXISTS public.site_packages (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. SYSTEM SETTINGS & NOTICES
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. STAFF ID CARDS & VISITING CARDS
CREATE TABLE IF NOT EXISTS public.site_staff_cards (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. DIGITAL LOAN CONTRACTS
CREATE TABLE IF NOT EXISTS public.site_contracts (
  id text PRIMARY KEY,
  loan_id text,
  user_phone text,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. WITHDRAWAL CONDITIONS
CREATE TABLE IF NOT EXISTS public.withdrawal_conditions (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  step_order int NOT NULL DEFAULT 1,
  condition_title text NOT NULL,
  condition_description text,
  fee_amount numeric NOT NULL DEFAULT 0,
  trx_id text,
  slip_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. PROMOTION MEDIA & NEWS
CREATE TABLE IF NOT EXISTS public.promotion_media (
  id text PRIMARY KEY,
  title_bn text NOT NULL,
  caption_bn text,
  category text NOT NULL DEFAULT 'news',
  image_url text NOT NULL,
  loan_amount text,
  customer_name text,
  customer_location text,
  customer_profession text,
  badge_bn text,
  story_bn text,
  cta_text_bn text,
  cta_link text,
  date text,
  display_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. ADMIN AUTH & 2FA GOOGLE AUTHENTICATOR
CREATE TABLE IF NOT EXISTS public.admin_auth (
  username text PRIMARY KEY,
  password_hash text NOT NULL,
  totp_secret text NOT NULL,
  totp_configured boolean NOT NULL DEFAULT false,
  session_token text,
  session_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. USER SESSIONS (ZERO LOCALSTORAGE IN-MEMORY / SUPABASE SESSION VERIFICATION)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  token text PRIMARY KEY,
  user_phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'site_users',
      'site_loans',
      'site_deposits',
      'site_withdrawals',
      'site_installments',
      'site_payment_methods',
      'site_dps_schemes',
      'site_customer_fixed_deposits',
      'site_packages',
      'site_settings',
      'site_staff_cards',
      'site_contracts',
      'withdrawal_conditions',
      'promotion_media',
      'admin_auth',
      'user_sessions'
    ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public access %I" ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public access %I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END
$$;

-- REALTIME PUBLICATION
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'site_users',
      'site_loans',
      'site_deposits',
      'site_withdrawals',
      'site_installments',
      'site_payment_methods',
      'site_dps_schemes',
      'site_customer_fixed_deposits',
      'site_packages',
      'site_settings',
      'site_staff_cards',
      'site_contracts',
      'withdrawal_conditions',
      'promotion_media',
      'admin_auth'
    ])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = tbl
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I;', tbl);
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END IF;
  END LOOP;
END
$$;