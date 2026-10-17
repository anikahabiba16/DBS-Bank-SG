CREATE TABLE IF NOT EXISTS customer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone TEXT NOT NULL,
  user_name TEXT,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'admin')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'voice')),
  content TEXT,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_customer_messages_phone ON customer_messages(user_phone);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created ON customer_messages(created_at);

ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read customer_messages" ON customer_messages;
CREATE POLICY "Allow public read customer_messages" ON customer_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert customer_messages" ON customer_messages;
CREATE POLICY "Allow public insert customer_messages" ON customer_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update customer_messages" ON customer_messages;
CREATE POLICY "Allow public update customer_messages" ON customer_messages FOR UPDATE USING (true);