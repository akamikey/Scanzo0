-- NUCLEAR OPTION: Reset RLS for owners table completely
-- This fixes any potential recursion, locking, or permission issues

-- 1. Disable RLS temporarily to clear any locks
alter table public.owners disable row level security;

-- 2. Drop ALL existing policies (using a do block to catch dynamic names if needed, but explicit drops are safer if we know names)
-- We drop common names to be sure
drop policy if exists "Users can manage own owner profile" on public.owners;
drop policy if exists "Public can view owners" on public.owners;
drop policy if exists "Public select owners" on public.owners;
drop policy if exists "Users update own profile" on public.owners;
drop policy if exists "Users insert own profile" on public.owners;
drop policy if exists "Users delete own profile" on public.owners;
drop policy if exists "Users can view own profile" on public.owners;
drop policy if exists "Enable update for users based on id" on public.owners;
drop policy if exists "Enable insert for users based on id" on public.owners;
drop policy if exists "Enable select for users based on id" on public.owners;

-- 3. Re-enable RLS
alter table public.owners enable row level security;

-- 4. Create SIMPLE, NON-RECURSIVE policies

-- SELECT: Allow public read access (needed for public review page)
create policy "Public_Read_Access"
on public.owners for select
using (true);

-- INSERT: Allow authenticated users to insert their own profile
create policy "User_Insert_Own"
on public.owners for insert
with check (auth.uid() = id);

-- UPDATE: Allow authenticated users to update their own profile
create policy "User_Update_Own"
on public.owners for update
using (auth.uid() = id);

-- DELETE: Allow authenticated users to delete their own profile
create policy "User_Delete_Own"
on public.owners for delete
using (auth.uid() = id);

-- 5. Grant permissions to authenticated users (just in case)
grant all on public.owners to authenticated;
