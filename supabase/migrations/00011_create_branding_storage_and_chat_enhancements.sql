-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding_assets', 'branding_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow public reads and authenticated/anon uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access branding_assets'
  ) THEN
    CREATE POLICY "Public Access branding_assets" ON storage.objects
      FOR SELECT USING (bucket_id = 'branding_assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Upload Access branding_assets'
  ) THEN
    CREATE POLICY "Upload Access branding_assets" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'branding_assets');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Update Access branding_assets'
  ) THEN
    CREATE POLICY "Update Access branding_assets" ON storage.objects
      FOR UPDATE USING (bucket_id = 'branding_assets');
  END IF;
END $$;

-- Add can_delete_messages column to sub_admins table if not exists
ALTER TABLE sub_admins ADD COLUMN IF NOT EXISTS can_delete_messages BOOLEAN DEFAULT false;
