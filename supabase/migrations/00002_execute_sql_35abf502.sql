ALTER TABLE admin_auth 
  ALTER COLUMN totp_secret DROP NOT NULL; ALTER TABLE admin_auth 
  ALTER COLUMN totp_secret SET DEFAULT '';