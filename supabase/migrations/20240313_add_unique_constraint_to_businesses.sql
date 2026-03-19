-- Add unique constraint to owner_id in businesses table
ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_id_unique UNIQUE (owner_id);
