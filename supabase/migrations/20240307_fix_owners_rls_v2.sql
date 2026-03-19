-- Ensure RLS is enabled and policies are clean/simple to prevent hanging
alter table public.owners enable row level security;

-- Drop potentially conflicting or recursive policies
drop policy if exists "Users can update own profile" on public.owners;
drop policy if exists "Users update own profile" on public.owners;
drop policy if exists "Enable update for users based on id" on public.owners;

-- Create a simple, non-recursive update policy
create policy "Users can update own profile"
on public.owners for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Ensure select is also permitted (often needed for returning data)
drop policy if exists "Users can view own profile" on public.owners;
create policy "Users can view own profile"
on public.owners for select
using (auth.uid() = id);
