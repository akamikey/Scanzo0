-- 1. Create the businesses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    review_link TEXT,
    website_link TEXT,
    google_review_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id)
);

-- 2. Add the column if the table exists but column is missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'google_review_link') THEN
        ALTER TABLE public.businesses ADD COLUMN google_review_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'review_link') THEN
        ALTER TABLE public.businesses ADD COLUMN review_link TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'website_link') THEN
        ALTER TABLE public.businesses ADD COLUMN website_link TEXT;
    END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Safe versions that don't error if they exist)

-- Allow owners to view their own business
DROP POLICY IF EXISTS "Owners can view own business" ON public.businesses;
CREATE POLICY "Owners can view own business" ON public.businesses
    FOR SELECT USING (auth.uid() = owner_id);

-- Allow owners to insert/update their own business
DROP POLICY IF EXISTS "Owners can upsert own business" ON public.businesses;
CREATE POLICY "Owners can upsert own business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;
CREATE POLICY "Owners can update own business" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

-- Allow PUBLIC access for the QR code page (Critical for redirection)
DROP POLICY IF EXISTS "Public can view business details" ON public.businesses;
CREATE POLICY "Public can view business details" ON public.businesses
    FOR SELECT USING (true);
