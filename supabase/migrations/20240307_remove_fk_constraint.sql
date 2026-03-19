-- 1. Drop the table again to be sure
drop table if exists public.business_settings cascade;

-- 2. Recreate the table WITHOUT Foreign Key to auth.users
-- This prevents any potential locking issues with the auth schema
create table public.business_settings (
  id uuid primary key, -- No references auth.users(id)
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.business_settings enable row level security;

-- 4. Simple Policies
create policy "Public read access" on public.business_settings
  for select using (true);

create policy "Owner full access" on public.business_settings
  for all using (auth.uid() = id);

-- 5. Re-create the RPC function
create or replace function save_google_link_final(p_link text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  
  if v_uid is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Simple Upsert
  insert into public.business_settings (id, google_review_link, updated_at)
  values (v_uid, p_link, now())
  on conflict (id) do update
  set google_review_link = excluded.google_review_link,
      updated_at = now();
      
  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- 6. Grant permissions
grant all on public.business_settings to authenticated;
grant select on public.business_settings to anon;
grant execute on function save_google_link_final to authenticated;
