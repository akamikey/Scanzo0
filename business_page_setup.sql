-- Create business_pages table
CREATE TABLE IF NOT EXISTS public.business_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    logo_url TEXT,
    cover_url TEXT,
    theme_color TEXT DEFAULT '#3b82f6',
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id)
);

-- Create business_services table
CREATE TABLE IF NOT EXISTS public.business_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.business_pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_gallery table
CREATE TABLE IF NOT EXISTS public.business_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.business_pages(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_gallery ENABLE ROW LEVEL SECURITY;

-- Policies for business_pages
DROP POLICY IF EXISTS "Owners can manage own business page" ON public.business_pages;
CREATE POLICY "Owners can manage own business page" ON public.business_pages
    FOR ALL USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can view business pages" ON public.business_pages;
CREATE POLICY "Public can view business pages" ON public.business_pages
    FOR SELECT USING (true);

-- Policies for business_services
DROP POLICY IF EXISTS "Owners can manage own business services" ON public.business_services;
CREATE POLICY "Owners can manage own business services" ON public.business_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_pages
            WHERE id = business_services.page_id AND owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Public can view business services" ON public.business_services;
CREATE POLICY "Public can view business services" ON public.business_services
    FOR SELECT USING (true);

-- Policies for business_gallery
DROP POLICY IF EXISTS "Owners can manage own business gallery" ON public.business_gallery;
CREATE POLICY "Owners can manage own business gallery" ON public.business_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.business_pages
            WHERE id = business_gallery.page_id AND owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Public can view business gallery" ON public.business_gallery;
CREATE POLICY "Public can view business gallery" ON public.business_gallery
    FOR SELECT USING (true);
