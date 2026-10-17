ALTER TABLE public.customer_messages ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat_images', 'chat_images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read chat_images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Insert chat_images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Update chat_images" ON storage.objects;
    DROP POLICY IF EXISTS "Public Delete chat_images" ON storage.objects;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public Read chat_images" ON storage.objects FOR SELECT USING (bucket_id = 'chat_images');
CREATE POLICY "Public Insert chat_images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'chat_images');
CREATE POLICY "Public Update chat_images" ON storage.objects FOR UPDATE USING (bucket_id = 'chat_images');
CREATE POLICY "Public Delete chat_images" ON storage.objects FOR DELETE USING (bucket_id = 'chat_images');