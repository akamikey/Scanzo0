-- 1. Create the table if it doesn't exist (idempotent)
create table if not exists public.business_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Force enable RLS
alter table public.business_settings enable row level security;

-- 3. Create a permissive policy for the owner (just in case direct access is needed)
drop policy if exists "Owner all access" on public.business_settings;
create policy "Owner all access" on public.business_settings
for all using (auth.uid() = id) with check (auth.uid() = id);

-- 4. Create a public read policy
drop policy if exists "Public read" on public.business_settings;
create policy "Public read" on public.business_settings
for select using (true);

-- 5. Create the V2 RPC function (The "Silver Bullet")
create or replace function save_settings_v2(link_url text)
returns boolean
language plpgsql
security definer -- Runs with admin privileges
set search_path = public
as $$
declare
  v_uid uuid;
begin
  -- Get current user ID
  v_uid := auth.uid();
  
  -- Safety check
  if v_uid is null then
    return false;
  end if;

  -- Upsert the setting
  insert into public.business_settings (id, google_review_link, updated_at)
  values (v_uid, link_url, now())
  on conflict (id) do update
  set google_review_link = excluded.google_review_link,
      updated_at = now();
      
  return true;
exception when others then
  return false;
end;
$$;

-- 6. Grant permissions
grant all on public.business_settings to authenticated;
grant all on public.business_settings to anon; -- Needed for public read
grant execute on function save_settings_v2 to authenticated;
