-- Create a dedicated table for business settings to isolate it from the owners table issues
create table if not exists public.business_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  google_review_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.business_settings enable row level security;

-- Create simple policies
create policy "Public read access"
on public.business_settings for select
using (true);

create policy "Users can insert their own settings"
on public.business_settings for insert
with check (auth.uid() = id);

create policy "Users can update their own settings"
on public.business_settings for update
using (auth.uid() = id);

-- Grant permissions
grant all on public.business_settings to authenticated;
grant select on public.business_settings to anon;
