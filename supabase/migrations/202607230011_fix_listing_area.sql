-- Fix: Post Ad inserts `area`, `latitude`, `longitude` but production may be missing them.
-- Safe to re-run.

alter table public.marketplace_listings
  add column if not exists area text,
  add column if not exists city text,
  add column if not exists formatted_address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'marketplace_listings'
      and column_name = 'location_source'
  ) then
    alter table public.marketplace_listings
      add column location_source text
      check (location_source is null or location_source in ('current', 'custom'));
  end if;
end $$;

-- Keep older ads searchable by city when area was never set.
update public.marketplace_listings
set area = coalesce(nullif(trim(area), ''), nullif(trim(city), ''))
where area is null and city is not null;

notify pgrst, 'reload schema';
