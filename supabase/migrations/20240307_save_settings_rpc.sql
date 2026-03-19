-- Create a robust RPC function to save settings
-- This runs with SECURITY DEFINER to bypass RLS and ensure the save happens
create or replace function save_google_link(link_url text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  user_id := auth.uid();
  if user_id is null then
    return false;
  end if;

  insert into public.business_settings (id, google_review_link, updated_at)
  values (user_id, link_url, now())
  on conflict (id) do update
  set google_review_link = excluded.google_review_link,
      updated_at = now();
      
  return true;
exception when others then
  return false;
end;
$$;

grant execute on function save_google_link to authenticated;
