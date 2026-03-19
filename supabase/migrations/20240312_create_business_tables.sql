create table if not exists public.business_links (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  review_link text,
  website_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(owner_id)
);

alter table public.business_links enable row level security;

drop policy if exists "Public read access" on public.business_links;
create policy "Public read access" on public.business_links for select using (true);

drop policy if exists "Owner full access" on public.business_links;
create policy "Owner full access" on public.business_links for all using (auth.uid() = owner_id);

grant all on public.business_links to authenticated;
grant select on public.business_links to anon;
