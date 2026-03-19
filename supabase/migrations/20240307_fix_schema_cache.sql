-- 1. Create the table if it doesn't exist
create table if not exists public.business_settings (
  id uuid primary key,
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.business_settings enable row level security;

-- 3. Create policies
drop policy if exists "Public read access" on public.business_settings;
create policy "Public read access" on public.business_settings for select using (true);

drop policy if exists "Owner full access" on public.business_settings;
create policy "Owner full access" on public.business_settings for all using (auth.uid() = id);

-- 4. Grant permissions
grant all on public.business_settings to authenticated;
grant select on public.business_settings to anon;

-- 5. Notify PostgREST to reload schema
notify pgrst, 'reload config';
