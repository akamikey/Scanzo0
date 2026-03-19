-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

-- Drop generic policies to avoid conflicts with previous broad policies
drop policy if exists "Authenticated Menu Images Full Access" on storage.objects;
drop policy if exists "Public Access Menu Images" on storage.objects;
drop policy if exists "Authenticated Upload Menu Images" on storage.objects;
drop policy if exists "Authenticated Update Menu Images" on storage.objects;
drop policy if exists "Authenticated Delete Menu Images" on storage.objects;

-- Re-create precise policies to allow uploads
create policy "Public Access Menu Images"
  on storage.objects for select
  using ( bucket_id = 'menu-images' );

create policy "Authenticated Upload Menu Images"
  on storage.objects for insert
  with check ( bucket_id = 'menu-images' and auth.role() = 'authenticated' );

create policy "Authenticated Update Menu Images"
  on storage.objects for update
  using ( bucket_id = 'menu-images' and auth.role() = 'authenticated' );

create policy "Authenticated Delete Menu Images"
  on storage.objects for delete
  using ( bucket_id = 'menu-images' and auth.role() = 'authenticated' );
