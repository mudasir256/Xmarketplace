# X Marketplace

Classified marketplace + official store built with Next.js and Supabase.

## Setup

1. Copy env vars:

```bash
cp .env.example .env.local
```

2. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project **Settings → API**.

3. Apply the marketplace schema in Supabase:
   - Open **SQL Editor** in your Supabase project
   - Paste and run `supabase/setup_post_ad.sql` (one-shot setup for profiles, categories, listings, contact number, and photo storage)
   - Or run the files in `supabase/migrations/` in order if you prefer incremental migrations

4. Apply chat schema (conversations, messages, blocks, attachments):
   - Paste and run `supabase/setup_chat.sql` in the SQL Editor
   - Or run `supabase/migrations/202607220010_chat.sql`

5. Start the app (custom server includes Socket.IO on `/api/socketio`):

```bash
npm install
npm run dev
```

> Chat requires `npm run dev` / `npm start` (tsx `server.ts`). Plain `next dev` serves REST only — realtime sockets will not connect.

## Auth (email + Google)

Auth pages:

- `/login` — email/password + Google
- `/signup` — create account + Google
- `/forgot-password` / `/update-password`
- `/auth/callback` — OAuth / email confirmation exchange

### Supabase dashboard

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

2. **Authentication → Providers → Email** — enabled (default)

3. **Authentication → Providers → Google**
   - Enable Google
   - Add Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - In Google Cloud, set Authorized redirect URI to:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`

Protected routes (`/account`, `/post-ad`) redirect guests to `/login`.
