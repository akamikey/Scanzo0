-- Fix RLS on owners table to prevent potential recursion or locking
-- This ensures that UPDATE operations are strictly scoped and performant

-- Drop existing policies to start fresh
drop policy if exists "Users can manage own owner profile" on public.owners;
drop policy if exists "Public can view owners" on public.owners;
drop policy if exists "Public select owners" on public.owners;
drop policy if exists "Users update own profile" on public.owners;
drop policy if exists "Users insert own profile" on public.owners;
drop policy if exists "Users delete own profile" on public.owners;

-- 1. SELECT: Public can see everything (needed for public pages)
create policy "Public select owners"
on public.owners for select
using (true);

-- 2. UPDATE: Users can update their own profile
create policy "Users update own profile"
on public.owners for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- 3. INSERT: Users can insert their own profile
create policy "Users insert own profile"
on public.owners for insert
with check (auth.uid() = id);

-- 4. DELETE: Users can delete their own profile
create policy "Users delete own profile"
on public.owners for delete
using (auth.uid() = id);
