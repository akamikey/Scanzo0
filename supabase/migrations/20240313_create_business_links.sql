CREATE TABLE IF NOT EXISTS public.business_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    review_link TEXT,
    website_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id)
);

ALTER TABLE public.business_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view business links"
    ON public.business_links FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert their own links"
    ON public.business_links FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own links"
    ON public.business_links FOR UPDATE
    USING (auth.uid() = owner_id);
