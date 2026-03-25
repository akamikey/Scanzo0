-- Ensure column exists in owners table
alter table public.owners 
add column if not exists google_review_link text;

-- Ensure column exists in businesses table
alter table public.businesses 
add column if not exists google_review_link text;

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

  -- 1. Get email (safe fallback)
  select email into v_email from auth.users where id = v_uid;
  
  -- 2. Upsert into owners table
  -- We use ON CONFLICT to handle the case where the row already exists
  insert into public.owners (id, email, google_review_link)
  values (v_uid, coalesce(v_email, ''), p_link)
  on conflict (id) do update
  set google_review_link = p_link,
      email = coalesce(excluded.email, public.owners.email); -- Update email if we have a better one
  
  -- 3. Update businesses table (If exists)
  -- We still only update here, as creating a business record requires more info
  update public.businesses
  set google_review_link = p_link,
      updated_at = now()
  where owner_id = v_uid;

  -- 4. Update business_links table (UPSERT)
  insert into public.business_links (owner_id, review_link)
  values (v_uid, p_link)
  on conflict (owner_id) do update
  set review_link = p_link;
  
  return json_build_object('success', true);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;

-- Grant access
grant execute on function save_google_link_robust to authenticated;
