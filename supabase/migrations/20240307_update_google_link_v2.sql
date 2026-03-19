-- 1. Create a new, simplified RPC function
-- This function does a direct SQL update, bypassing any potential RLS complexity
-- It is marked as SECURITY DEFINER to run with the privileges of the creator (postgres)
create or replace function update_google_link_v2(p_link text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  -- Get the current user ID
  v_uid := auth.uid();
  
  -- Check if user is authenticated
  if v_uid is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Perform the update directly
  update public.owners
  set google_review_link = p_link
  where id = v_uid;
  
  -- Check if the update affected any rows
  if not found then
     -- If no row was updated, it means the user doesn't exist in the owners table
     -- This is a critical error state for a logged-in user
     return json_build_object('success', false, 'error', 'User profile not found');
  end if;

  return json_build_object('success', true);
exception when others then
  -- Catch any other errors (e.g., database constraints)
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- 2. Grant execute permission to authenticated users
grant execute on function update_google_link_v2 to authenticated;
