-- Chat core tables only (run this first on project jvuxbwlawwvznpbpfvha)
-- If this succeeds, run supabase/setup_chat_storage.sql next.

create extension if not exists "pgcrypto";

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_id uuid,
  last_message_at timestamptz,
  buyer_archived_at timestamptz,
  seller_archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, buyer_id, seller_id),
  check (buyer_id <> seller_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  client_message_id uuid not null,
  message_type varchar(20) not null default 'text'
    check (message_type in ('text', 'image', 'file', 'system')),
  body text,
  reply_to_message_id uuid references public.messages(id) on delete set null,
  delivered_at timestamptz,
  read_at timestamptz,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (conversation_id, client_message_id)
);

alter table public.conversations
  drop constraint if exists conversations_last_message_id_fkey;

alter table public.conversations
  add constraint conversations_last_message_id_fkey
  foreign key (last_message_id) references public.messages(id) on delete set null;

create table if not exists public.conversation_read_state (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_message_id uuid references public.messages(id) on delete set null,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_key text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.chat_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  details text,
  created_at timestamptz not null default now()
);

create index if not exists conversations_buyer_updated_idx
  on public.conversations (buyer_id, last_message_at desc nulls last);
create index if not exists conversations_seller_updated_idx
  on public.conversations (seller_id, last_message_at desc nulls last);
create index if not exists conversations_listing_idx
  on public.conversations (listing_id);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);
create index if not exists message_attachments_message_idx
  on public.message_attachments (message_id);
create index if not exists user_blocks_blocked_idx
  on public.user_blocks (blocked_id);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_read_state enable row level security;
alter table public.message_attachments enable row level security;
alter table public.user_blocks enable row level security;
alter table public.chat_reports enable row level security;

drop policy if exists "Participants read conversations" on public.conversations;
create policy "Participants read conversations"
  on public.conversations for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Buyers create conversations" on public.conversations;
create policy "Buyers create conversations"
  on public.conversations for insert to authenticated
  with check (buyer_id = auth.uid() and buyer_id <> seller_id);

drop policy if exists "Participants update conversations" on public.conversations;
create policy "Participants update conversations"
  on public.conversations for update to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid())
  with check (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists "Participants read messages" on public.messages;
create policy "Participants read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants insert messages" on public.messages;
create policy "Participants insert messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Senders update own messages" on public.messages;
create policy "Senders update own messages"
  on public.messages for update to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants manage read state" on public.conversation_read_state;
create policy "Participants manage read state"
  on public.conversation_read_state for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Participants read attachments" on public.message_attachments;
create policy "Participants read attachments"
  on public.message_attachments for select to authenticated
  using (
    exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Participants insert attachments" on public.message_attachments;
create policy "Participants insert attachments"
  on public.message_attachments for insert to authenticated
  with check (
    exists (
      select 1
      from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_id
        and m.sender_id = auth.uid()
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

drop policy if exists "Users manage own blocks" on public.user_blocks;
create policy "Users manage own blocks"
  on public.user_blocks for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

drop policy if exists "Users create reports" on public.chat_reports;
create policy "Users create reports"
  on public.chat_reports for insert to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "Users read own reports" on public.chat_reports;
create policy "Users read own reports"
  on public.chat_reports for select to authenticated
  using (reporter_id = auth.uid());

-- Verify
select to_regclass('public.conversations') as conversations_table;
