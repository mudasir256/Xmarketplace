-- Marketplace post-ad: categories, condition, contact number, images RLS, storage

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

-- Sellers can always read their own listings (any status)
drop policy if exists "Sellers manage own listings" on public.marketplace_listings;
create policy "Sellers read own listings"
  on public.marketplace_listings for select to authenticated
  using (user_id = auth.uid());
create policy "Sellers insert own listings"
  on public.marketplace_listings for insert to authenticated
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING'));
create policy "Sellers update own draft/pending listings"
  on public.marketplace_listings for update to authenticated
  using (user_id = auth.uid() and status in ('DRAFT', 'PENDING'))
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING'));
create policy "Sellers delete own draft/pending listings"
  on public.marketplace_listings for delete to authenticated
  using (user_id = auth.uid() and status in ('DRAFT', 'PENDING'));

drop policy if exists "Public can read listing images" on public.marketplace_listing_images;
drop policy if exists "Sellers manage own listing images" on public.marketplace_listing_images;

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
      where l.id = listing_id and l.user_id = auth.uid() and l.status in ('DRAFT', 'PENDING')
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

-- Public storage bucket for listing photos
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
