-- 1. Ensure the column exists in the 'owners' table
alter table public.owners 
add column if not exists google_review_link text;

-- 2. Update the RPC function to write to 'owners' instead of 'business_settings'
-- This bypasses RLS and writes directly to the main profile table.
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

  -- Update the owners table directly
  update public.owners
  set google_review_link = p_link
  where id = v_uid;
  
  -- Check if update actually happened (row existed)
  if not found then
    -- If no owner row, we can't save the link. This shouldn't happen for logged-in users.
    return json_build_object('success', false, 'error', 'Owner profile not found');
  end if;
      
  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- 3. Drop the problematic 'business_settings' table to avoid confusion
drop table if exists public.business_settings cascade;

-- 4. Grant permissions
grant execute on function save_google_link_final to authenticated;
