
-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('business-gallery', 'business-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Set up RLS for business-logos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id IN ('business-logos', 'business-gallery') );

DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'business-logos' AND 
    name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Users can update their own logos" ON storage.objects;
CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'business-logos' AND 
    name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'business-logos' AND 
    name LIKE (auth.uid()::text || '/%')
);

-- 3. Set up RLS for business-gallery
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
    bucket_id = 'business-gallery' AND 
    name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Users can update their own gallery images" ON storage.objects;
CREATE POLICY "Users can update their own gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
    bucket_id = 'business-gallery' AND 
    name LIKE (auth.uid()::text || '/%')
);

DROP POLICY IF EXISTS "Users can delete their own gallery images" ON storage.objects;
CREATE POLICY "Users can delete their own gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
    bucket_id = 'business-gallery' AND 
    name LIKE (auth.uid()::text || '/%')
);
