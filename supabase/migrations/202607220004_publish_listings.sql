-- Allow sellers to publish ads immediately so they appear on the homepage.
drop policy if exists "Sellers insert own listings" on public.marketplace_listings;
create policy "Sellers insert own listings"
  on public.marketplace_listings for insert to authenticated
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED'));

drop policy if exists "Sellers update own draft/pending listings" on public.marketplace_listings;
drop policy if exists "Sellers update own listings" on public.marketplace_listings;
create policy "Sellers update own listings"
  on public.marketplace_listings for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and status in ('DRAFT', 'PENDING', 'PUBLISHED', 'SOLD', 'ARCHIVED'));

drop policy if exists "Sellers insert own listing images" on public.marketplace_listing_images;
create policy "Sellers insert own listing images"
  on public.marketplace_listing_images for insert to authenticated
  with check (
    exists (
      select 1 from public.marketplace_listings l
      where l.id = listing_id
        and l.user_id = auth.uid()
        and l.status in ('DRAFT', 'PENDING', 'PUBLISHED')
    )
  );
