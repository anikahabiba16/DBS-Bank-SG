CREATE POLICY "Allow public delete customer_messages"
  ON customer_messages
  AS PERMISSIVE
  FOR DELETE
  TO PUBLIC
  USING (
    true
  );