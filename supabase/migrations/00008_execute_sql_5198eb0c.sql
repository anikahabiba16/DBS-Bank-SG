ALTER TABLE customer_messages 
  REPLICA IDENTITY FULL; ALTER PUBLICATION supabase_realtime ADD FOR TABLE TABLE customer_messages;