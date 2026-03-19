-- 1. OWNERS TABLE (The Core Identity)
create table if not exists public.owners (
    id uuid references auth.users(id) on delete cascade primary key,
    business_name text not null,
    business_type text,
    google_review_link text,
    public_slug text unique not null,
    location text,
    avatar_url text,
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.owners enable row level security;

-- CLEAR OLD POLICIES to prevent conflicts
drop policy if exists "Users can manage own owner profile" on public.owners;
drop policy if exists "Public can view owners by slug" on public.owners;
drop policy if exists "Public view owners" on public.owners;

-- NEW ROBUST POLICIES
-- Allow users to Insert, Update, Delete, and Select their OWN profile
create policy "Users can manage own owner profile"
on public.owners
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow public to read owner data (required for Public Review Page via Slug)
create policy "Public can view owners"
on public.owners
for select
using (true);

-- 2. MENU CATEGORIES
create table if not exists public.menu_categories (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.owners(id) on delete cascade not null,
    name text not null,
    display_order int default 0,
    created_at timestamp with time zone default now()
);
-- Ensure image_url exists (just in case)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'menu_categories' and column_name = 'image_url') then
        alter table public.menu_categories add column image_url text;
    end if;
end $$;

alter table public.menu_categories enable row level security;

drop policy if exists "Owners manage categories" on public.menu_categories;
drop policy if exists "Public view categories" on public.menu_categories;

create policy "Owners manage categories"
on public.menu_categories for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Public view categories"
on public.menu_categories for select
using (true);

-- 3. MENU ITEMS
create table if not exists public.menu_items (
    id uuid default gen_random_uuid() primary key,
    owner_id uuid references public.owners(id) on delete cascade not null,
    category_id uuid references public.menu_categories(id) on delete set null,
    name text not null,
    description text,
    price numeric(10,2),
    image_url text,
    available boolean default true,
    is_popular boolean default false,
    created_at timestamp with time zone default now()
);

alter table public.menu_items enable row level security;

drop policy if exists "Owners manage items" on public.menu_items;
drop policy if exists "Public view items" on public.menu_items;

create policy "Owners manage items"
on public.menu_items for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Public view items"
on public.menu_items for select
using (true);

-- 4. STORAGE PERMISSIONS (Critical Fix)
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Drop generic/old policies
drop policy if exists "Public Access Menu Images" on storage.objects;
drop policy if exists "Authenticated Menu Images Full Access" on storage.objects;
drop policy if exists "Authenticated Upload Menu Images" on storage.objects;

-- Allow Public Read
create policy "Public Access Menu Images"
on storage.objects for select
using ( bucket_id = 'menu-images' );

-- Allow Authenticated Full Access (Insert/Update/Delete)
create policy "Authenticated Menu Images Full Access"
on storage.objects for all
using ( bucket_id = 'menu-images' and auth.role() = 'authenticated' )
with check ( bucket_id = 'menu-images' and auth.role() = 'authenticated' );

-- Avatar Policies
drop policy if exists "Public Access Avatars" on storage.objects;
drop policy if exists "Authenticated Avatars Full Access" on storage.objects;

create policy "Public Access Avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Authenticated Avatars Full Access"
on storage.objects for all
using ( bucket_id = 'avatars' and auth.role() = 'authenticated' )
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
