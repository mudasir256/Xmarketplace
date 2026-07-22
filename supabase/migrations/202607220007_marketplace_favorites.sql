-- Saved marketplace ads (favorites / wishlist hearts)

create table if not exists public.marketplace_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists marketplace_favorites_user_idx
  on public.marketplace_favorites (user_id, created_at desc);

create index if not exists marketplace_favorites_listing_idx
  on public.marketplace_favorites (listing_id);

alter table public.marketplace_favorites enable row level security;

drop policy if exists "Users read own favorites" on public.marketplace_favorites;
drop policy if exists "Users insert own favorites" on public.marketplace_favorites;
drop policy if exists "Users delete own favorites" on public.marketplace_favorites;

create policy "Users read own favorites"
  on public.marketplace_favorites for select to authenticated
  using (user_id = auth.uid());

create policy "Users insert own favorites"
  on public.marketplace_favorites for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users delete own favorites"
  on public.marketplace_favorites for delete to authenticated
  using (user_id = auth.uid());
