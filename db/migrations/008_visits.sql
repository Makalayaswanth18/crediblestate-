-- Migration 008: visit scheduling inside conversations
-- A "visit" is a proposal to physically see the property at a specific time.
-- Either side can propose; the other side confirms or declines.
--
-- Run in Supabase Dashboard → SQL Editor

create extension if not exists "uuid-ossp";

create table if not exists visits (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  property_id      uuid not null references properties(id) on delete cascade,
  proposer_id      uuid not null,
  proposer_role    text not null check (proposer_role in ('buyer', 'agent', 'owner')),
  proposed_at      timestamptz not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),
  note             text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_visits_conversation on visits(conversation_id, created_at);
create index if not exists idx_visits_status on visits(status) where status = 'pending';

-- ---------- RLS ----------
alter table visits enable row level security;

drop policy if exists "Participants read visits" on visits;
create policy "Participants read visits"
  on visits for select
  using (
    conversation_id in (
      select id from conversations
      where buyer_id = auth.uid() or agent_id = auth.uid()
    )
    or is_admin()
  );

drop policy if exists "Participants propose visits" on visits;
create policy "Participants propose visits"
  on visits for insert
  with check (
    proposer_id = auth.uid()
    and conversation_id in (
      select id from conversations
      where buyer_id = auth.uid() or agent_id = auth.uid()
    )
  );

drop policy if exists "Participants update visits" on visits;
create policy "Participants update visits"
  on visits for update
  using (
    conversation_id in (
      select id from conversations
      where buyer_id = auth.uid() or agent_id = auth.uid()
    )
    or is_admin()
  );

-- Auto-update updated_at on row updates
create or replace function update_visit_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_visits_updated_at on visits;
create trigger trg_visits_updated_at
  before update on visits
  for each row execute function update_visit_updated_at();

comment on table visits is
  'Proposed property visits. Either buyer or lister can propose; the other side confirms.';
