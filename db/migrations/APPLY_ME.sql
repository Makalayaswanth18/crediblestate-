-- ============================================================
-- Migrations 006 + 007 — Owner Listings
-- Run this ONCE in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ----- 006: owner_listed flag on properties -----
alter table properties
  add column if not exists owner_listed boolean not null default false;

create index if not exists idx_properties_owner_listed
  on properties(owner_listed)
  where owner_listed = true;

comment on column properties.owner_listed is
  'True when the listing was submitted by the property owner themselves (not a broker/agent).';

-- ----- 007: add ''owner'' as a valid profile role -----
alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'agent', 'owner'));

comment on column profiles.role is
  'buyer | agent | owner — owner = direct property owner (not a broker)';

-- ============================================================
-- Done. Verify with:
--   select column_name, data_type from information_schema.columns
--   where table_name = 'properties' and column_name = 'owner_listed';
-- ============================================================
