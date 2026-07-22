-- Account APIs: buyer requests, notifications, store wishlist, settings

create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category_slug text,
  city text,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  contact_number text,
  status text not null default 'OPEN' check (status in ('OPEN', 'CLOSED', 'FULFILLED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  link_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.store_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.account_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  profile_visibility text not null default 'public' check (profile_visibility in ('public', 'private')),
  updated_at timestamptz not null default now()
);

create index if not exists buyer_requests_public_idx on public.buyer_requests (status, created_at desc);
create index if not exists buyer_requests_user_idx on public.buyer_requests (user_id, created_at desc);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists store_wishlist_user_idx on public.store_wishlist (user_id, created_at desc);

alter table public.buyer_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.store_wishlist enable row level security;
alter table public.account_settings enable row level security;

drop policy if exists "Public can read open buyer requests" on public.buyer_requests;
create policy "Public can read open buyer requests"
  on public.buyer_requests for select
  using (status = 'OPEN');

drop policy if exists "Users manage own buyer requests" on public.buyer_requests;
create policy "Users manage own buyer requests"
  on public.buyer_requests for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own notifications" on public.notifications;
create policy "Users manage own notifications"
  on public.notifications for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own wishlist" on public.store_wishlist;
create policy "Users manage own wishlist"
  on public.store_wishlist for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users manage own settings" on public.account_settings;
create policy "Users manage own settings"
  on public.account_settings for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
