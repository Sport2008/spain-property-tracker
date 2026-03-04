# Spanjehuizen — Setup & Deployment Guide

## 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)
- A [Mapbox](https://mapbox.com) account (free tier includes 50k map loads/month)
- A [Vercel](https://vercel.com) account for deployment

---

## 2. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_MAPBOX_TOKEN=pk.<your-mapbox-public-token>
```

Where to find them:
- **Supabase**: Project Settings → API → Project URL + anon public key
- **Mapbox**: account.mapbox.com → Tokens → your default public token

---

## 3. Supabase — Database Setup

Go to your Supabase project → **SQL Editor** → **New query**, paste and run the contents of:

```
supabase/migration.sql
```

This creates:
- `properties` table with all fields + RLS policy
- `property_photos` table with cascade delete + RLS policy
- `update_updated_at` trigger function

---

## 4. Supabase — Storage Bucket

1. Go to **Storage** → **New bucket**
   - Name: `property-photos`
   - Public: **off** (private bucket)

2. Go to **Storage** → **Policies** → Add policy for `objects`:
   - **Policy name**: `owner all`
   - **Allowed operations**: SELECT, INSERT, UPDATE, DELETE
   - **Policy definition** (USING and WITH CHECK):
     ```sql
     bucket_id = 'property-photos'
     AND auth.uid()::text = (storage.foldername(name))[1]
     ```
   Photos are stored at path: `{user_id}/{property_id}/{filename}`

---

## 5. Supabase — Auth Setup

1. Go to **Authentication** → **Providers** → confirm **Email** is enabled
2. Go to **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000` (for dev) / `https://your-vercel-domain.vercel.app` (for prod)
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://your-vercel-domain.vercel.app/auth/callback`

---

## 6. Run Locally

```powershell
cd C:\Users\Jorrit\projects\spanjehuizen

# Fill in .env.local first, then:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## 7. Deploy to Vercel

```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel
```

Or connect via the Vercel dashboard → Import Git Repository.

**Add environment variables in Vercel**:
Go to Project → Settings → Environment Variables and add the same three vars from `.env.local`.

---

## 8. Add to Home Screen (PWA)

On iOS Safari: tap the Share button → "Add to Home Screen"  
On Android Chrome: tap the browser menu → "Add to Home Screen" or "Install app"

---

## 9. Invite your wife

Since RLS is per-user, you both sign in with your own email addresses. Each user only sees their own properties. If you want **shared** access (both see the same properties), update the RLS policies to allow access by a list of user IDs, or use a shared Supabase team/org with a single user account.
