-- ==============================================================================
-- Supabase Database Setup Script
-- ==============================================================================
-- Copy and paste this entire script into the SQL Editor in your Supabase Dashboard.
-- This will reset your public schema and set up the necessary tables for the app.
--
-- WARNING: This script drops existing tables (owners, businesses, reviews, subscriptions).
-- All existing data in these tables will be lost.
-- ==============================================================================

-- 1. Clean up existing tables (Reverse order of dependencies)
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.owners CASCADE;

-- 2. Enable UUID extension (required for ID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Create 'owners' table (Links to Supabase Auth)
CREATE TABLE public.owners (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT,
    public_slug TEXT UNIQUE,
    google_review_link TEXT,
    location TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create 'businesses' table
CREATE TABLE public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    review_link TEXT,
    website_link TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(owner_id)
);

-- 5. Create 'business_pages' table (for public profile/landing)
CREATE TABLE public.business_pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    business_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    theme_color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(owner_id)
);

-- 6. Create 'business_services' table
CREATE TABLE public.business_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_pages(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    price TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create 'business_gallery' table
CREATE TABLE public.business_gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.business_pages(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create 'business_links' table
CREATE TABLE public.business_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    review_link TEXT,
    website_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(owner_id)
);

-- 9. Create 'reviews' table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    platform TEXT DEFAULT 'google',
    is_valid BOOLEAN DEFAULT TRUE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create 'subscriptions' table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    razorpay_subscription_id TEXT,
    plan_id TEXT,
    status TEXT DEFAULT 'inactive',
    current_period_end TIMESTAMP WITH TIME ZONE,
    amount_paid NUMERIC DEFAULT 0,
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(owner_id)
);

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 12. Create Security Policies

-- ... (existing policies) ...

-- BUSINESS_SERVICES Policies
CREATE POLICY "Public can view business services" ON public.business_services FOR SELECT USING (true);
CREATE POLICY "Owners can manage their business services" ON public.business_services FOR ALL USING (
    EXISTS (SELECT 1 FROM public.business_pages WHERE id = business_id AND owner_id = auth.uid())
);

-- BUSINESS_GALLERY Policies
CREATE POLICY "Public can view business gallery" ON public.business_gallery FOR SELECT USING (true);
CREATE POLICY "Owners can manage their business gallery" ON public.business_gallery FOR ALL USING (
    EXISTS (SELECT 1 FROM public.business_pages WHERE id = business_id AND owner_id = auth.uid())
);

-- BUSINESS_LINKS Policies
CREATE POLICY "Public can view business links_table" ON public.business_links FOR SELECT USING (true);
CREATE POLICY "Owners can manage their business links_table" ON public.business_links FOR ALL USING (auth.uid() = owner_id);

-- OWNERS Policies
-- Public can view basic profile info (needed for public review pages)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.owners FOR SELECT 
USING (true);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert their own profile" 
ON public.owners FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.owners FOR UPDATE 
USING (auth.uid() = id);

-- BUSINESSES Policies
-- Public can view business links (needed for redirection)
CREATE POLICY "Public can view business links" 
ON public.businesses FOR SELECT 
USING (true);

-- Users can insert their own businesses
CREATE POLICY "Users can insert their own businesses" 
ON public.businesses FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Users can update their own businesses
CREATE POLICY "Users can update their own businesses" 
ON public.businesses FOR UPDATE 
USING (auth.uid() = owner_id);

-- BUSINESS_PAGES Policies
-- Public can view business pages
CREATE POLICY "Public can view business pages" 
ON public.business_pages FOR SELECT 
USING (true);

-- Owners can manage their business pages
CREATE POLICY "Owners can manage their business pages" 
ON public.business_pages FOR ALL 
USING (auth.uid() = owner_id);

-- REVIEWS Policies
-- Public can insert reviews (for customers submitting reviews)
CREATE POLICY "Public can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);

-- Owners can view reviews for their business
CREATE POLICY "Owners can view their own reviews" 
ON public.reviews FOR SELECT 
USING (auth.uid() = owner_id);

-- SUBSCRIPTIONS Policies
-- Owners can view their own subscription status
CREATE POLICY "Owners can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = owner_id);

-- 9. Create Storage Buckets (For avatars/logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
CREATE POLICY "Anyone can upload an avatar" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' );
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' );
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING ( bucket_id = 'avatars' );

-- 10. Create 'private_reviews' table
CREATE TABLE public.private_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.owners(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.private_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert private reviews" ON public.private_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view their own private reviews" ON public.private_reviews FOR SELECT USING (auth.uid() = owner_id);

-- 11. Create helper functions
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_owner_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE owner_id = p_owner_id 
        AND subscription_status = 'active'
    );
END;
$$;
