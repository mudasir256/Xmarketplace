-- One-shot setup for X Marketplace post-ad backend.
-- Paste into Supabase Dashboard → SQL Editor → Run.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where possible.

-- ========== From 202607220001_initial_schema.sql (core) ==========
create extension if not exists "pgcrypto";

do $$ begin create type public.user_role as enum ('CUSTOMER', 'SELLER', 'STORE_STAFF', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'); exception when duplicate_object then null; end $$;
do $$ begin create type public.listing_status as enum ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'SOLD', 'EXPIRED', 'ARCHIVED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.product_status as enum ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.order_status as enum ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_path text,
  role public.user_role not null default 'CUSTOMER',
  account_status text not null default 'ACTIVE',
  email_verified boolean not null default false,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.marketplace_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  display_order integer not null default 0
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.marketplace_categories(id),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric(14,2),
  status public.listing_status not null default 'DRAFT',
  city text,
  is_featured boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false
);

create index if not exists marketplace_listings_public_idx on public.marketplace_listings (status, category_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.marketplace_categories enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_listing_images enable row level security;

drop policy if exists "Public can read marketplace categories" on public.marketplace_categories;
create policy "Public can read marketplace categories" on public.marketplace_categories for select using (is_active);

drop policy if exists "Public can read published listings" on public.marketplace_listings;
create policy "Public can read published listings" on public.marketplace_listings for select using (status = 'PUBLISHED');

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Backfill profiles for existing auth users
insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.email
from auth.users u
on conflict (id) do nothing;

-- ========== From 202607220003_marketplace_post_ads.sql ==========
alter table public.marketplace_listings
  add column if not exists condition text,
  add column if not exists contact_number text;

update public.marketplace_listings
set condition = 'USED'
where condition is null;

alter table public.marketplace_listings
  alter column condition set default 'USED',
  alter column condition set not null;

do $$
begin
  alter table public.marketplace_listings
    add constraint marketplace_listings_condition_check
    check (condition in ('NEW', 'USED', 'OPEN_BOX'));
exception
  when duplicate_object then null;
end $$;

comment on column public.marketplace_listings.contact_number is
  'Seller phone number buyers can use to contact about this listing';

insert into public.marketplace_categories (name, slug, display_order, is_active)
values
  ('Vehicles', 'vehicles', 1, true),
  ('Bikes', 'bikes', 2, true),
  ('Property Sale', 'property-sale', 3, true),
  ('Property Rent', 'property-rent', 4, true),
  ('Mobiles', 'mobiles', 5, true),
  ('Electronics', 'electronics', 6, true),
  ('Furniture', 'furniture', 7, true),
  ('Animals', 'animals', 8, true),
  ('Fashion', 'fashion', 9, true),
  ('Services', 'services', 10, true)
on conflict (slug) do update
set
  name = excluded.name,
  display_order = excluded.display_order,
  is_active = true;

drop policy if exists "Sellers manage own listings" on public.marketplace_listings;
drop policy if exists "Sellers read own listings" on public.marketplace_listings;
drop policy if exists "Sellers insert own listings" on public.marketplace_listings;
drop policy if exists "Sellers update own draft/pending listings" on public.marketplace_listings;
drop policy if exists "Sellers delete own draft/pending listings" on public.marketplace_listings;

create policy "Sellers read own listings"
  on public.marketplace_listings for select to authenticated
  using (user_id = auth.uid());
create policy "Sellers insert own listings"
  on public.marketplace_listings for insert to authenticated
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED'));
create policy "Sellers update own draft/pending listings"
  on public.marketplace_listings for update to authenticated
  using (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED'))
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED'));
create policy "Sellers delete own draft/pending listings"
  on public.marketplace_listings for delete to authenticated
  using (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED'));

drop policy if exists "Public can read listing images" on public.marketplace_listing_images;
drop policy if exists "Public can read published listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers manage own listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers read own listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers insert own listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers update own listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers delete own listing images" on public.marketplace_listing_images;

create policy "Public can read published listing images"
  on public.marketplace_listing_images for select
  using (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.status = 'PUBLISHED'
    )
  );

create policy "Sellers read own listing images"
  on public.marketplace_listing_images for select to authenticated
  using (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

create policy "Sellers insert own listing images"
  on public.marketplace_listing_images for insert to authenticated
  with check (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.user_id = auth.uid() and l.status in ('DRAFT', 'PENDING', 'PUBLISHED')
    )
  );

create policy "Sellers update own listing images"
  on public.marketplace_listing_images for update to authenticated
  using (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

create policy "Sellers delete own listing images"
  on public.marketplace_listing_images for delete to authenticated
  using (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id and l.user_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view listing images" on storage.objects;
drop policy if exists "Authenticated users upload listing images" on storage.objects;
drop policy if exists "Users update own listing images" on storage.objects;
drop policy if exists "Users delete own listing images" on storage.objects;

create policy "Public can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users upload listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own listing images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Favorites
create table if not exists public.marketplace_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists marketplace_favorites_user_idx
  on public.marketplace_favorites (user_id, created_at desc);

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
