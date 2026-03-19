-- Improved robust save function that handles missing owner records via UPSERT
create or replace function save_google_link_robust(p_link text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_email text;
begin
  v_uid := auth.uid();
  
  if v_uid is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- 1. Upsert into owners table
  -- We fetch email from auth.users just in case we need to insert a new record
  select email into v_email from auth.users where id = v_uid;

  insert into public.owners (id, email, google_review_link)
  values (v_uid, v_email, p_link)
  on conflict (id) do update
  set google_review_link = p_link;
  
  -- 2. Update businesses table (If exists)
  -- We still only update here, as creating a business record requires more info (name, slug, etc.)
  update public.businesses
  set google_review_link = p_link,
      updated_at = now()
  where owner_id = v_uid;
  
  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Grant access
grant execute on function save_google_link_robust to authenticated;
