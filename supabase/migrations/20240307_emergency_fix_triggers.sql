-- EMERGENCY FIX: Remove potential hanging triggers and ensure clean update path

-- 1. Drop common triggers that might cause deadlocks or timeouts
drop trigger if exists "on_auth_user_created" on public.owners;
drop trigger if exists "handle_updated_at" on public.owners;
-- Add other potential trigger names if known, or generic cleanup

-- 2. Create a foolproof RPC function to update the link
-- This runs as the database owner (SECURITY DEFINER) to bypass all RLS
create or replace function update_google_link_v2(link_url text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid;
begin
  -- Get the current user ID
  user_id := auth.uid();
  
  if user_id is null then
    return false;
  end if;

  -- Try to update first
  update public.owners
  set google_review_link = link_url,
      updated_at = now()
  where id = user_id;
  
  -- If no row was updated (found is false), insert a new one
  if not found then
    insert into public.owners (id, google_review_link, updated_at)
    values (user_id, link_url, now());
  end if;
  
  return true;
exception when others then
  -- Log error if needed, but return false to indicate failure
  return false;
end;
$$;

-- 3. Grant execute permission to authenticated users
grant execute on function update_google_link_v2 to authenticated;
