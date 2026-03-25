CREATE TABLE IF NOT EXISTS public.private_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.private_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert private reviews" 
ON public.private_reviews FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Owners can view their own private reviews" 
ON public.private_reviews FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
);

GRANT ALL ON public.private_reviews TO authenticated;
GRANT INSERT ON public.private_reviews TO anon;
