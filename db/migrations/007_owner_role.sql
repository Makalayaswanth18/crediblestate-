-- Migration 007: add 'owner' as a valid profile role
-- Owners are property owners who list their own homes directly (no broker).
-- They get a simplified dashboard at /owner/dashboard.
--
-- Run in Supabase Dashboard → SQL Editor

alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'agent', 'owner'));

comment on column profiles.role is
  'buyer = renter/buyer searching for property
   agent = KYC-verified agent who lists on behalf of owners
   owner = property owner who lists their own property directly';
