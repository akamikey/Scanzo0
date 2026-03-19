-- Ensure table exists and has correct structure
create table if not exists public.business_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.business_settings enable row level security;

-- Re-apply policies to be safe
drop policy if exists "Public read access" on public.business_settings;
create policy "Public read access" on public.business_settings for select using (true);

drop policy if exists "Users can insert their own settings" on public.business_settings;
create policy "Users can insert their own settings" on public.business_settings for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own settings" on public.business_settings;
create policy "Users can update their own settings" on public.business_settings for update using (auth.uid() = id);

-- Grant permissions
grant all on public.business_settings to authenticated;
grant select on public.business_settings to anon;

-- Create the RPC function for robust saving
create or replace function save_business_settings(p_link text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;

  insert into public.business_settings (id, google_review_link, updated_at)
  values (v_uid, p_link, now())
  on conflict (id) do update
  set google_review_link = excluded.google_review_link,
      updated_at = now();
      
  return true;
end;
$$;

grant execute on function save_business_settings to authenticated;
