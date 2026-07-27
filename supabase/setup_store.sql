-- Official store schema (idempotent) for X Marketplace / xmarketadmin

create extension if not exists "pgcrypto";

do $$ begin
  create type public.product_status as enum ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'ARCHIVED');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED',
    'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'UNPAID', 'PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.store_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.store_categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_path text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  seo_title text,
  seo_description text
);

create table if not exists public.store_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  description text,
  is_active boolean not null default true
);

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.store_categories(id),
  brand_id uuid references public.store_brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  base_price numeric(14,2) not null check (base_price >= 0),
  compare_at_price numeric(14,2),
  cost_price numeric(14,2),
  product_status public.product_status not null default 'DRAFT',
  condition text not null default 'NEW',
  country_of_origin text,
  warranty_information text,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  sku text not null unique,
  barcode text,
  title text not null,
  price numeric(14,2),
  compare_at_price numeric(14,2),
  cost_price numeric(14,2),
  weight numeric(10,3),
  color text,
  size text,
  storage text,
  condition text not null default 'NEW',
  low_stock_threshold integer not null default 5,
  is_active boolean not null default true
);

create table if not exists public.store_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  variant_id uuid references public.store_product_variants(id) on delete set null,
  storage_path text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false
);

create table if not exists public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true
);

create table if not exists public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.inventory_locations(id),
  variant_id uuid not null references public.store_product_variants(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  unique (location_id, variant_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.inventory_locations(id),
  variant_id uuid not null references public.store_product_variants(id),
  movement_type text not null check (movement_type in ('PURCHASE','ORDER','RETURN','CANCELLATION','MANUAL_ADJUSTMENT','DAMAGED','LOST')),
  quantity_delta integer not null,
  reference_id uuid,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  anonymous_session_id text,
  status text not null default 'ACTIVE',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or anonymous_session_id is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.shopping_carts(id) on delete cascade,
  variant_id uuid not null references public.store_product_variants(id),
  quantity integer not null check (quantity > 0),
  unit_price_snapshot numeric(14,2) not null,
  unique (cart_id, variant_id)
);

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  status public.order_status not null default 'PENDING',
  payment_status public.payment_status not null default 'UNPAID',
  fulfillment_status text not null default 'UNFULFILLED',
  currency text not null default 'PKR',
  subtotal numeric(14,2) not null,
  discount_total numeric(14,2) not null default 0,
  shipping_total numeric(14,2) not null default 0,
  tax_total numeric(14,2) not null default 0,
  grand_total numeric(14,2) not null,
  shipping_address_snapshot jsonb not null,
  billing_address_snapshot jsonb,
  customer_notes text,
  admin_notes text,
  placed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_id uuid references public.store_products(id) on delete set null,
  variant_id uuid references public.store_product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text not null,
  image_path text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null,
  discount_amount numeric(14,2) not null default 0,
  line_total numeric(14,2) not null
);

create table if not exists public.store_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists store_products_catalog_idx
  on public.store_products (product_status, category_id, brand_id, created_at desc);
create index if not exists store_products_featured_idx
  on public.store_products (is_featured) where product_status = 'ACTIVE';
create index if not exists store_variant_sku_idx on public.store_product_variants (sku);
create index if not exists store_orders_user_idx on public.store_orders (user_id, created_at desc);
create index if not exists store_wishlist_user_idx on public.store_wishlist (user_id, created_at desc);

alter table public.store_categories enable row level security;
alter table public.store_brands enable row level security;
alter table public.store_products enable row level security;
alter table public.store_product_variants enable row level security;
alter table public.store_product_images enable row level security;
alter table public.inventory_locations enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.shopping_carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.store_orders enable row level security;
alter table public.store_order_items enable row level security;
alter table public.store_wishlist enable row level security;

drop policy if exists "Public can read active store categories" on public.store_categories;
create policy "Public can read active store categories"
  on public.store_categories for select using (is_active);

drop policy if exists "Public can read active brands" on public.store_brands;
create policy "Public can read active brands"
  on public.store_brands for select using (is_active);

drop policy if exists "Public can read active products" on public.store_products;
create policy "Public can read active products"
  on public.store_products for select using (product_status = 'ACTIVE');

drop policy if exists "Users read own orders" on public.store_orders;
create policy "Users read own orders"
  on public.store_orders for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users read own order items" on public.store_order_items;
create policy "Users read own order items"
  on public.store_order_items for select to authenticated
  using (exists (select 1 from public.store_orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "Users manage own wishlist" on public.store_wishlist;
create policy "Users manage own wishlist"
  on public.store_wishlist for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

notify pgrst, 'reload schema';
