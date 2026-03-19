-- Add review_link column to businesses table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'review_link') THEN
        ALTER TABLE public.businesses ADD COLUMN review_link TEXT;
    END IF;
END $$;

-- Migrate existing google_review_link data to review_link if review_link is null
UPDATE public.businesses 
SET review_link = google_review_link 
WHERE review_link IS NULL AND google_review_link IS NOT NULL;
