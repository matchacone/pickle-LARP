-- =============================================================================
-- profiles auto-creation trigger
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- This is NOT managed by drizzle-kit — do not put it in the migrations folder
-- for drizzle-kit to process. It lives here purely as a reference/runbook.
-- =============================================================================

-- 1. Function: called by the trigger after each new auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role, created_at, updated_at)
  values (
    new.id,
    -- Use the email prefix as the default username (editable later by the user)
    split_part(new.email, '@', 1),
    'user',
    now(),
    now()
  )
  on conflict (id) do nothing; -- idempotent: safe to re-run or replay
  return new;
end;
$$;

-- 2. Trigger: fires after every INSERT into auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
