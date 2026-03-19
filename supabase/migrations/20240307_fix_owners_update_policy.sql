-- 1. Enable RLS on owners (just in case)
alter table public.owners enable row level security;

-- 2. Drop existing update policy to be safe
drop policy if exists "Owners can update their own profile" on public.owners;

-- 3. Create a permissive update policy for owners
create policy "Owners can update their own profile"
on public.owners
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- 4. Grant update permission on the specific column (optional but good practice)
grant update (google_review_link) on public.owners to authenticated;
