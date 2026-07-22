-- Location-aware marketplace listings
-- Adds lat/lng columns, optional PostGIS geography, nearby search RPC,
-- and preferred_location on profiles.

create extension if not exists postgis;

alter table public.marketplace_listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists area text;

alter table public.profiles
  add column if not exists preferred_location jsonb;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'marketplace_listings'
      and column_name = 'location'
  ) then
    alter table public.marketplace_listings
      add column location geography(Point, 4326);
  end if;
exception
  when others then
    raise notice 'PostGIS geography column skipped: %', sqlerrm;
end $$;

-- Keep geography in sync when lat/lng exist
create or replace function public.sync_listing_location_geography()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    begin
      new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
    exception
      when others then
        null;
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists marketplace_listings_sync_location on public.marketplace_listings;
create trigger marketplace_listings_sync_location
  before insert or update of latitude, longitude
  on public.marketplace_listings
  for each row
  execute function public.sync_listing_location_geography();

create index if not exists marketplace_listings_lat_lng_idx
  on public.marketplace_listings (latitude, longitude)
  where latitude is not null and longitude is not null;

do $$
begin
  create index if not exists marketplace_listings_location_gix
    on public.marketplace_listings
    using gist (location);
exception
  when others then
    raise notice 'PostGIS GIST index skipped: %', sqlerrm;
end $$;

-- Seed approximate city centers for existing ads without coordinates
update public.marketplace_listings
set
  latitude = case lower(coalesce(city, ''))
    when 'karachi' then 24.8607
    when 'lahore' then 31.5204
    when 'islamabad' then 33.6844
    when 'rawalpindi' then 33.5651
    when 'faisalabad' then 31.4504
    when 'multan' then 30.1575
    when 'peshawar' then 34.0151
    when 'quetta' then 30.1798
    when 'sialkot' then 32.4945
    when 'gujranwala' then 32.1877
    else 24.8607
  end,
  longitude = case lower(coalesce(city, ''))
    when 'karachi' then 67.0011
    when 'lahore' then 74.3587
    when 'islamabad' then 73.0479
    when 'rawalpindi' then 73.0169
    when 'faisalabad' then 73.1350
    when 'multan' then 71.5249
    when 'peshawar' then 71.5249
    when 'quetta' then 66.9750
    when 'sialkot' then 74.5229
    when 'gujranwala' then 74.1945
    else 67.0011
  end,
  area = coalesce(area, city)
where latitude is null or longitude is null;

-- Nearby listings via Haversine (works even if PostGIS query path fails)
create or replace function public.nearby_marketplace_listings(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 10,
  p_category_slug text default null,
  p_limit integer default 48,
  p_offset integer default 0
)
returns table (
  id uuid,
  user_id uuid,
  title text,
  slug text,
  description text,
  price numeric,
  condition text,
  city text,
  area text,
  contact_number text,
  is_featured boolean,
  created_at timestamptz,
  category_name text,
  category_slug text,
  primary_image_path text,
  distance_km double precision
)
language sql
stable
as $$
  with ranked as (
    select
      l.id,
      l.user_id,
      l.title,
      l.slug,
      l.description,
      l.price,
      l.condition,
      l.city,
      l.area,
      l.contact_number,
      l.is_featured,
      l.created_at,
      c.name as category_name,
      c.slug as category_slug,
      (
        select i.storage_path
        from public.marketplace_listing_images i
        where i.listing_id = l.id
        order by i.is_primary desc, i.display_order asc
        limit 1
      ) as primary_image_path,
      (
        6371 * acos(
          least(
            1.0,
            greatest(
              -1.0,
              cos(radians(p_lat))
              * cos(radians(l.latitude))
              * cos(radians(l.longitude) - radians(p_lng))
              + sin(radians(p_lat))
              * sin(radians(l.latitude))
            )
          )
        )
      ) as distance_km
    from public.marketplace_listings l
    join public.marketplace_categories c on c.id = l.category_id
    where l.status = 'PUBLISHED'
      and l.latitude is not null
      and l.longitude is not null
      and (
        p_category_slug is null
        or p_category_slug = ''
        or p_category_slug = 'all'
        or c.slug = p_category_slug
      )
  )
  select *
  from ranked
  where distance_km <= greatest(p_radius_km, 0.1)
  order by distance_km asc, created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.nearby_marketplace_listings(
  double precision, double precision, double precision, text, integer, integer
) to anon, authenticated, service_role;
