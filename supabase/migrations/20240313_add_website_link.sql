DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'website_link') THEN
        ALTER TABLE public.businesses ADD COLUMN website_link TEXT;
    END IF;
END $$;
