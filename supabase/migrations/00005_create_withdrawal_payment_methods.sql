CREATE TABLE IF NOT EXISTS public.withdrawal_payment_methods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label_bn TEXT NOT NULL,
    channel_type TEXT NOT NULL DEFAULT 'mobile_banking', -- 'mobile_banking' | 'bank' | 'other'
    logo_url TEXT DEFAULT '',
    account_number_placeholder TEXT DEFAULT '',
    instructions_bn TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.withdrawal_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active withdrawal payment methods"
ON public.withdrawal_payment_methods
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow all write on withdrawal payment methods"
ON public.withdrawal_payment_methods
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Insert initial methods if empty
INSERT INTO public.withdrawal_payment_methods (id, name, label_bn, channel_type, logo_url, account_number_placeholder, instructions_bn, is_active, display_order)
VALUES 
  ('bKash', 'bKash', 'বিকাশ', 'mobile_banking', 'https://upload.wikimedia.org/wikipedia/commons/7/77/BKash_Logo.svg', '017XXXXXXXX', 'সঠিক বিকাশ পার্সোনাল বা এজেন্ট নম্বর দিন।', true, 1),
  ('Nagad', 'Nagad', 'নগদ', 'mobile_banking', 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Nagad_Logo.png', '01XXXXXXXXX', 'সঠিক নগদ একাউন্ট নম্বর দিন।', true, 2),
  ('Rocket', 'Rocket', 'রকেট', 'mobile_banking', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Dutch-Bangla_Bank_Rocket_logo.svg/300px-Dutch-Bangla_Bank_Rocket_logo.svg.png', '01XXXXXXXXXX (১২ ডিজিট)', 'রকেট একাউন্টের ১২ ডিজিটের নম্বর দিন।', true, 3),
  ('Bank', 'Bank', 'ব্যাংক হিসাব', 'bank', 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=100&q=80', 'হিসাব নম্বর', 'যেকোনো অনুমোদিত তফসিলি ব্যাংকের তথ্য দিন।', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Publish to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_payment_methods;
