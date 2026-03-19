-- Create a secure server-side function to update the link
-- This bypasses complex RLS policies that might be causing deadlocks/timeouts
create or replace function update_google_link(link_url text)
returns boolean
language plpgsql
security definer -- Runs with admin permissions to bypass RLS recursion
set search_path = public -- Security best practice
as $$
begin
  -- Update the record strictly for the authenticated user
  update public.owners
  set google_review_link = link_url
  where id = auth.uid();
  
  -- Return true if a row was updated, false otherwise
  return found;
end;
$$;
