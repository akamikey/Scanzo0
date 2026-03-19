-- Add Shield columns to reviews table
alter table public.reviews 
add column if not exists is_valid boolean default true,
add column if not exists rejection_reason text;

-- Update RLS to ensure owners can see blocked reviews (already covered by existing policy, but ensuring clarity)
-- Existing policy: "Owners can view own reviews" using (auth.uid() = owner_id); -> This covers valid and invalid reviews.
