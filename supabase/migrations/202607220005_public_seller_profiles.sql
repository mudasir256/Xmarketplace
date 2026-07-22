-- Allow buyers to see seller display fields for marketplace contact cards.
drop policy if exists "Public can read seller profile basics" on public.profiles;
create policy "Public can read seller profile basics"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.marketplace_listings l
      where l.user_id = profiles.id
        and l.status = 'PUBLISHED'
    )
  );
