-- 1. Ensure the image_url column exists on menu_categories
alter table menu_categories add column if not exists image_url text;

-- 2. Create the storage bucket for menu images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- 3. Drop existing policies to allow clean recreation
drop policy if exists "Public Access Menu Images" on storage.objects;
drop policy if exists "Authenticated Upload Menu Images" on storage.objects;
drop policy if exists "Authenticated Menu Images Full Access" on storage.objects;

-- 4. Allow public access to view images (SELECT)
create policy "Public Access Menu Images"
  on storage.objects for select
  using ( bucket_id = 'menu-images' );

-- 5. Allow authenticated users to do ANYTHING (Insert, Update, Delete)
-- Simplified policy to ensure no specific RLS condition blocks the upload
create policy "Authenticated Menu Images Full Access"
  on storage.objects for all
  using ( bucket_id = 'menu-images' and auth.role() = 'authenticated' )
  with check ( bucket_id = 'menu-images' and auth.role() = 'authenticated' );
