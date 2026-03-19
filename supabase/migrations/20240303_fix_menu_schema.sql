-- 1. Explicitly add image_url column if it is missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_categories' AND column_name = 'image_url') THEN
        ALTER TABLE menu_categories ADD COLUMN image_url text;
    END IF;
END $$;

-- 2. Reload the PostgREST schema cache to ensure the API knows about the new column
NOTIFY pgrst, 'reload schema';
