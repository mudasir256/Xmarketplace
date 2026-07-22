-- Keep marketplace listing condition default as USED (not NEW).
alter table public.marketplace_listings
  alter column condition set default 'USED';

update public.marketplace_listings
set condition = 'USED'
where condition is null;
