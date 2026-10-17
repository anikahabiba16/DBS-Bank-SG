CREATE TABLE IF NOT EXISTS site_purged_users (
  id text PRIMARY KEY,
  phone text NOT NULL,
  purged_at timestamptz DEFAULT now()
); ALTER TABLE site_purged_users 
  ENABLE ROW LEVEL SECURITY; CREATE POLICY "Public access site_purged_users"
  ON site_purged_users
  AS PERMISSIVE
  FOR ALL
  TO PUBLIC
  USING (
    true
  )
  WITH CHECK (
    true
  );