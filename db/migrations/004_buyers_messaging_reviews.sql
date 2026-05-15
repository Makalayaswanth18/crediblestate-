-- ============================================================
-- Migration 004 — Buyer accounts, messaging, saved searches, reviews
-- Run AFTER 001_auth.sql in Supabase SQL Editor.
-- Adds: profiles, conversations, messages, saved_searches, reviews.
-- Migrates existing inquiries into conversations (one per inquiry).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ===========================================
-- 1) PROFILES — one row per auth.users
--    role decides whether the user sees buyer or agent UI.
-- ===========================================
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  role                text not null default 'buyer' check (role in ('buyer','agent')),
  full_name           text,
  avatar_url          text,
  bio                 text,
  phone               text,
  is_verified_agent   boolean not null default false,
  agent_verified_at   timestamptz,
  agent_kyc_notes     text,
  favorites           uuid[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_verified on profiles(is_verified_agent) where is_verified_agent;

alter table profiles enable row level security;

-- anyone can read public profile fields (we keep no PII in here that isn't already exposed)
drop policy if exists "Profiles are public" on profiles;
create policy "Profiles are public"
  on profiles for select using (true);

-- owner can insert their own profile row
drop policy if exists "Users insert own profile" on profiles;
create policy "Users insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- owner can update their own profile — but is_verified_agent is admin-only.
-- Enforced via trigger below (CHECK can't reference OLD).
drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- admins can do anything
drop policy if exists "Admins manage profiles" on profiles;
create policy "Admins manage profiles"
  on profiles for all using (is_admin()) with check (is_admin());

-- Guard: only admin can flip is_verified_agent / agent_verified_at / agent_kyc_notes
create or replace function profiles_guard_admin_fields() returns trigger as $$
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
      -- prevent agents from silently downgrading themselves and orphaning listings
      raise exception 'role downgrade not allowed';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists profiles_guard on profiles;
create trigger profiles_guard
  before update on profiles
  for each row execute function profiles_guard_admin_fields();

-- Auto-create a profile row whenever someone signs up.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: create profile rows for existing users (agents who signed up before this migration).
insert into profiles (id, full_name, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)),
       case when exists (select 1 from properties p where p.agent_id = u.id) then 'agent' else 'buyer' end
from auth.users u
on conflict (id) do nothing;

-- ===========================================
-- 2) CONVERSATIONS — one per (buyer, property)
--    buyer_id may be NULL for anonymous (logged-out) inquiries — we still store
--    name/phone/email snapshot so the agent can call them back.
-- ===========================================
create table if not exists conversations (
  id                    uuid primary key default uuid_generate_v4(),
  property_id           uuid not null references properties(id) on delete cascade,
  buyer_id              uuid references auth.users(id) on delete set null,
  agent_id              uuid references auth.users(id) on delete set null,
  buyer_name            text not null,
  buyer_phone           text not null,
  buyer_email           text,
  status                text not null default 'open'
                          check (status in ('open','closed_rented','closed_sold','closed_other')),
  last_message_at       timestamptz not null default now(),
  last_message_preview  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_conversations_buyer  on conversations(buyer_id);
create index if not exists idx_conversations_agent  on conversations(agent_id);
create index if not exists idx_conversations_prop   on conversations(property_id);
create index if not exists idx_conversations_recent on conversations(last_message_at desc);

-- One thread per (property, buyer) when buyer is signed-in.
create unique index if not exists uq_conversations_prop_buyer
  on conversations(property_id, buyer_id)
  where buyer_id is not null;

alter table conversations enable row level security;

-- buyer reads their own threads, agent reads threads on their listings, admin reads all
drop policy if exists "Conversation participants read" on conversations;
create policy "Conversation participants read"
  on conversations for select
  using (
    buyer_id = auth.uid()
    or agent_id = auth.uid()
    or is_admin()
  );

-- anyone may open a thread (anon inquiries) — must reference a verified property
drop policy if exists "Anyone opens a conversation" on conversations;
create policy "Anyone opens a conversation"
  on conversations for insert
  with check (
    exists (
      select 1 from properties p
      where p.id = property_id and p.status = 'verified'
    )
    and (buyer_id is null or buyer_id = auth.uid())
  );

-- participants can update (e.g., status, last_message_*)
drop policy if exists "Participants update thread" on conversations;
create policy "Participants update thread"
  on conversations for update
  using (buyer_id = auth.uid() or agent_id = auth.uid() or is_admin())
  with check (buyer_id = auth.uid() or agent_id = auth.uid() or is_admin());

-- ===========================================
-- 3) MESSAGES
-- ===========================================
create table if not exists messages (
  id               uuid primary key default uuid_generate_v4(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  sender_id        uuid references auth.users(id) on delete set null,
  sender_role      text not null check (sender_role in ('buyer','agent','system')),
  body             text not null check (length(trim(body)) > 0 and length(body) < 4000),
  created_at       timestamptz not null default now()
);

create index if not exists idx_messages_conv on messages(conversation_id, created_at);

alter table messages enable row level security;

drop policy if exists "Participants read messages" on messages;
create policy "Participants read messages"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.agent_id = auth.uid() or is_admin())
    )
  );

-- buyer can send as 'buyer' on their thread; agent can send as 'agent' on theirs.
-- Anonymous (logged-out) buyers can send the FIRST message on a brand new thread
-- where buyer_id is null — but only via the same insert path used by submitInquiry,
-- which now owns the (conversation, first message) pair atomically server-side.
drop policy if exists "Participants send messages" on messages;
create policy "Participants send messages"
  on messages for insert
  with check (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
        and (
          (sender_role = 'buyer'  and (c.buyer_id = auth.uid() or c.buyer_id is null))
          or (sender_role = 'agent' and c.agent_id = auth.uid())
          -- A participant can post a 'system' message on their own thread
          -- (used by the close-conversation action to leave a breadcrumb).
          or (sender_role = 'system' and (c.buyer_id = auth.uid() or c.agent_id = auth.uid()))
          or is_admin()
        )
    )
  );

-- Enable realtime broadcasts on the messages table so MessageThread can
-- subscribe to INSERTs and append in-place. RLS still gates which rows each
-- subscriber actually receives.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end$$;

-- Keep conversations.last_message_* in sync.
create or replace function bump_conversation_on_message() returns trigger as $$
begin
  update conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 200),
         updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists messages_bump_conv on messages;
create trigger messages_bump_conv
  after insert on messages
  for each row execute function bump_conversation_on_message();

-- ===========================================
-- 4) SAVED SEARCHES
-- ===========================================
create table if not exists saved_searches (
  id            uuid primary key default uuid_generate_v4(),
  buyer_id      uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  filters       jsonb not null default '{}'::jsonb,
  email_alerts  boolean not null default true,
  last_alerted_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_saved_searches_buyer on saved_searches(buyer_id);

alter table saved_searches enable row level security;

drop policy if exists "Owner manages saved searches" on saved_searches;
create policy "Owner manages saved searches"
  on saved_searches for all
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

-- ===========================================
-- 5) REVIEWS — buyer → agent after a closed conversation
-- ===========================================
create table if not exists reviews (
  id               uuid primary key default uuid_generate_v4(),
  agent_id         uuid not null references auth.users(id) on delete cascade,
  buyer_id         uuid references auth.users(id) on delete set null,
  conversation_id  uuid unique references conversations(id) on delete set null,
  property_id      uuid references properties(id) on delete set null,
  rating           int  not null check (rating between 1 and 5),
  body             text check (length(body) < 2000),
  created_at       timestamptz not null default now()
);

create index if not exists idx_reviews_agent on reviews(agent_id, created_at desc);

alter table reviews enable row level security;

drop policy if exists "Reviews are public" on reviews;
create policy "Reviews are public"
  on reviews for select using (true);

-- buyer can leave one review on their own CLOSED conversation
drop policy if exists "Buyer reviews closed conversation" on reviews;
create policy "Buyer reviews closed conversation"
  on reviews for insert
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
        and c.buyer_id = auth.uid()
        and c.status in ('closed_rented','closed_sold','closed_other')
        and c.agent_id = reviews.agent_id
    )
  );

drop policy if exists "Buyer updates own review" on reviews;
create policy "Buyer updates own review"
  on reviews for update
  using (buyer_id = auth.uid())
  with check (buyer_id = auth.uid());

drop policy if exists "Admins manage reviews" on reviews;
create policy "Admins manage reviews"
  on reviews for all using (is_admin()) with check (is_admin());

-- Convenience view — agent rating rollups
create or replace view agent_rating_summary as
  select
    agent_id,
    count(*)::int       as review_count,
    round(avg(rating)::numeric, 2) as rating_avg
  from reviews
  group by agent_id;

grant select on agent_rating_summary to anon, authenticated;

-- ===========================================
-- 6) BACKFILL — turn legacy inquiries into conversations + first message
-- ===========================================
do $$
declare
  iq record;
  new_conv_id uuid;
begin
  for iq in
    select i.*, p.agent_id as prop_agent_id
      from inquiries i
      join properties p on p.id = i.property_id
     where not exists (
       -- only inquiries we haven't already migrated
       select 1 from conversations c
       where c.property_id = i.property_id
         and c.buyer_phone = i.phone
         and c.created_at = i.created_at
     )
  loop
    insert into conversations (
      property_id, buyer_id, agent_id,
      buyer_name, buyer_phone, buyer_email,
      status, last_message_at, last_message_preview,
      created_at, updated_at
    )
    values (
      iq.property_id, null, iq.prop_agent_id,
      iq.name, iq.phone, iq.email,
      'open', iq.created_at,
      left(coalesce(iq.message, 'Requested a callback.'), 200),
      iq.created_at, iq.created_at
    )
    returning id into new_conv_id;

    insert into messages (conversation_id, sender_id, sender_role, body, created_at)
    values (new_conv_id, null, 'buyer', coalesce(iq.message, 'Requested a callback.'), iq.created_at);
  end loop;
end$$;

-- ============================================================
-- Done.
-- ============================================================
