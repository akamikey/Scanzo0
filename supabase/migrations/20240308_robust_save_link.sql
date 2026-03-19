-- Ensure columns exist in both tables to be safe
alter table public.owners 
add column if not exists google_review_link text;

alter table public.businesses 
add column if not exists google_review_link text;

-- Create robust save function that updates both locations
create or replace function save_google_link_robust(p_link text)
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

  -- 1. Update owners table (Always)
  update public.owners
  set google_review_link = p_link
  where id = v_uid;
  
  -- 2. Update businesses table (If exists)
  -- We don't insert here to avoid violating other constraints (like slug, name) if the row is missing.
  -- If the row is missing, the frontend falls back to the 'owners' table anyway.
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
