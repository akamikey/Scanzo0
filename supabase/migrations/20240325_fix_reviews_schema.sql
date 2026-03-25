-- Migration to fix reviews schema and update save_google_link_robust
-- Date: 2026-03-25

-- 1. Update owners table
alter table public.owners 
add column if not exists email text;

-- 2. Fix reviews table (Migrate owner_id to business_id)
do $$
begin
    if exists (select 1 from information_schema.columns where table_name = 'reviews' and column_name = 'owner_id') then
        if not exists (select 1 from information_schema.columns where table_name = 'reviews' and column_name = 'business_id') then
            alter table public.reviews add column business_id uuid references public.businesses(id) on delete cascade;
            
            -- Try to populate business_id from owner_id
            update public.reviews r
            set business_id = b.id
            from public.businesses b
            where r.owner_id = b.owner_id;
            
            -- Now drop owner_id
            alter table public.reviews drop column owner_id;
            
            -- Make business_id not null
            alter table public.reviews alter column business_id set not null;
        end if;
    end if;
end $$;

-- 3. Fix private_reviews table (Migrate owner_id to business_id)
do $$
begin
    if exists (select 1 from information_schema.columns where table_name = 'private_reviews' and column_name = 'owner_id') then
        if not exists (select 1 from information_schema.columns where table_name = 'private_reviews' and column_name = 'business_id') then
            alter table public.private_reviews add column business_id uuid references public.businesses(id) on delete cascade;
            
            -- Try to populate business_id from owner_id
            update public.private_reviews r
            set business_id = b.id
            from public.businesses b
            where r.owner_id = b.owner_id;
            
            -- Now drop owner_id
            alter table public.private_reviews drop column owner_id;
            
            -- Make business_id not null
            alter table public.private_reviews alter column business_id set not null;
        end if;
    end if;
end $$;

-- 4. Update RLS Policies
drop policy if exists "Owners can view their own reviews" on public.reviews;
create policy "Owners can view their own reviews" on public.reviews for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Owners can view their own private reviews" on public.private_reviews;
create policy "Owners can view their own private reviews" on public.private_reviews for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- 5. Update save_google_link_robust
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

  -- 1. Get email
  select email into v_email from auth.users where id = v_uid;
  
  -- 2. Upsert into owners
  insert into public.owners (id, email, google_review_link)
  values (v_uid, coalesce(v_email, ''), p_link)
  on conflict (id) do update
  set google_review_link = p_link,
      email = coalesce(excluded.email, public.owners.email);
  
  -- 3. Update businesses
  update public.businesses
  set google_review_link = p_link,
      updated_at = now()
  where owner_id = v_uid;

  -- 4. Update business_links
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
