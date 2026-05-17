-- ============================================================
-- Migration 005 — Fix "Database error saving new user" on sign-up.
--
-- Root cause: the handle_new_user() trigger from migration 004
--   (a) didn't have an explicit search_path, so on some Supabase
--       projects the unqualified table reference "profiles" failed
--       to resolve when the trigger ran inside the auth schema,
--   (b) propagated any failure back to the auth.users insert,
--       which Supabase reports to the client as "Database error
--       saving new user" with no further detail.
--
-- This migration:
--   - Re-creates the function with `set search_path = public`,
--     fully-qualified table names,
--   - Wraps the insert in a begin/exception so a profile creation
--     failure NEVER blocks the auth signup. If the insert fails,
--     getCurrentUserWithProfile() in the app lazy-creates the row
--     on first read.
--
-- Safe to re-run.
-- ============================================================

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, full_name)
    values (
      new.id,
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        split_part(coalesce(new.email, ''), '@', 1)
      )
    )
    on conflict (id) do nothing;
  exception when others then
    -- Log + swallow. Never let a profile-row hiccup roll back the auth signup.
    raise warning 'handle_new_user: profile insert failed: %', sqlerrm;
  end;
  return new;
end;
$$;

-- Re-bind the trigger to the refreshed function (drop-then-create is idempotent).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Same defense for the profiles_guard trigger — set search_path so is_admin()
-- resolves cleanly. (No behavior change otherwise.)
create or replace function public.profiles_guard_admin_fields()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if not is_admin() then
    if new.is_verified_agent is distinct from old.is_verified_agent then
      raise exception 'is_verified_agent is admin-only';
    end if;
    if new.agent_verified_at is distinct from old.agent_verified_at then
      raise exception 'agent_verified_at is admin-only';
    end if;
    if new.agent_kyc_notes is distinct from old.agent_kyc_notes then
      raise exception 'agent_kyc_notes is admin-only';
    end if;
    if new.role is distinct from old.role and old.role = 'agent' and new.role <> 'agent' then
      raise exception 'role downgrade not allowed';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_guard on profiles;
create trigger profiles_guard
  before update on profiles
  for each row execute function public.profiles_guard_admin_fields();

-- bump_conversation_on_message — same hardening.
create or replace function public.bump_conversation_on_message()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 200),
         updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conv on messages;
create trigger messages_bump_conv
  after insert on messages
  for each row execute function public.bump_conversation_on_message();
