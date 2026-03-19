-- FINAL REBUILD: Dedicated function for saving the Google Review Link
-- This function is the single source of truth for saving the link.
-- It uses the 'business_settings' table which isolates configuration from user profile data.

create or replace function save_google_link_final(p_link text)
returns json
language plpgsql
security definer -- Runs with admin privileges to bypass any RLS complexity
set search_path = public
as $$
declare
  v_uid uuid;
  v_result json;
begin
  -- 1. Get current user ID
  v_uid := auth.uid();
  
  if v_uid is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- 2. Upsert the link into business_settings
  insert into public.business_settings (id, google_review_link, updated_at)
  values (v_uid, p_link, now())
  on conflict (id) do update
  set google_review_link = excluded.google_review_link,
      updated_at = now();
      
  -- 3. Return success
  return json_build_object('success', true);

exception when others then
  -- Catch any unexpected errors
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Grant execute permission to all authenticated users
grant execute on function save_google_link_final to authenticated;
