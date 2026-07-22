-- Optional: chat attachment storage (run after setup_chat_tables.sql)

insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Authenticated upload chat attachments" on storage.objects;
create policy "Authenticated upload chat attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public read chat attachments" on storage.objects;
create policy "Public read chat attachments"
  on storage.objects for select
  using (bucket_id = 'chat-attachments');

drop policy if exists "Participants read chat attachments" on storage.objects;
