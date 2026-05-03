# Budget Tracker — Setup Guide

## 1. Supabase project

1. Go to https://supabase.com and create a new project.
2. Open **SQL Editor** and run the contents of `supabase/migrations/001_init.sql`.
3. Enable Google OAuth:
   - Dashboard → Authentication → Providers → Google → Enable
   - Add your Google OAuth credentials (Client ID + Secret from Google Cloud Console).
   - Redirect URL to whitelist in Google Cloud: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
4. Copy your project URL and anon key from **Settings → API**.

## 2. Local development

```bash
cd budget-tracker
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 3. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

In the Vercel dashboard → Project Settings → Environment Variables, add:
- `VITE_SUPABASE_URL`  = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

Then add your Vercel deployment URL to:
- Supabase → Authentication → URL Configuration → **Site URL** and **Redirect URLs**
- Google Cloud Console → OAuth → Authorised redirect URIs: `https://<your-supabase>.supabase.co/auth/v1/callback`

## 4. First run

On the first visit to the April 2026 month, the app auto-seeds all 37 expenses from the CSV.
Recurring expenses are auto-inserted on the 1st of every subsequent month.
