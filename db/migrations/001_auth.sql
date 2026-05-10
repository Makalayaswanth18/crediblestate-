-- ============================================================
-- Migration 001 — Add authentication and ownership
-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- It only ADDs columns and policies; existing data is preserved.
-- ============================================================

-- 1. Link properties to authenticated users
alter table properties
  add column if not exists agent_id uuid references auth.users(id) on delete set null;

create index if not exists idx_properties_agent on properties(agent_id);

-- 2. Helper function to check if current user is admin
-- Edit the email list below to add more admins later.
create or replace function is_admin() returns boolean as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'yaswanthganesh39@gmail.com'
    ),
    false
  );
$$ language sql stable security definer;

-- 3. Replace insert policy: allow anonymous (status=pending) + signed-in users
drop policy if exists "Public can insert pending properties" on properties;
drop policy if exists "Anyone can insert pending properties" on properties;
create policy "Anyone can insert pending properties"
  on properties for insert
  with check (status = 'pending');

-- 4. Agents can READ their own listings regardless of status
drop policy if exists "Agents read own listings" on properties;
create policy "Agents read own listings"
  on properties for select
  using (agent_id = auth.uid());

-- 5. Agents can UPDATE their own listings
drop policy if exists "Agents update own listings" on properties;
create policy "Agents update own listings"
  on properties for update
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

-- 6. Admins can do anything
drop policy if exists "Admins manage all properties" on properties;
create policy "Admins manage all properties"
  on properties for all
  using (is_admin())
  with check (is_admin());

-- 7. Property owners can read inquiries on their listings
drop policy if exists "Property owner reads inquiries" on inquiries;
create policy "Property owner reads inquiries"
  on inquiries for select
  using (
    exists (
      select 1 from properties
      where properties.id = inquiries.property_id
        and properties.agent_id = auth.uid()
    )
  );

-- 8. Admins can read all inquiries
drop policy if exists "Admins read all inquiries" on inquiries;
create policy "Admins read all inquiries"
  on inquiries for select
  using (is_admin());

-- ============================================================
-- Done. Your existing 12 listings have agent_id = NULL (orphaned).
-- That's fine — they're public seed data. Future submissions
-- via /list while logged in will be linked to the agent.
-- ============================================================
