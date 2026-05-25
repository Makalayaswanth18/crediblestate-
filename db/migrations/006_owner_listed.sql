-- Migration 006: owner_listed flag on properties
-- Adds a boolean column to distinguish properties listed directly by
-- the owner from those listed by an agent/broker. When owner_listed = true
-- the buyer contacts the owner directly — no broker is involved.
--
-- Run in Supabase Dashboard → SQL Editor

alter table properties
  add column if not exists owner_listed boolean not null default false;

create index if not exists idx_properties_owner_listed
  on properties(owner_listed)
  where owner_listed = true;

comment on column properties.owner_listed is
  'True when the listing was submitted by the property owner themselves (not a broker/agent). Used to show the "Direct from Owner" badge and enable owner-only filtering.';
