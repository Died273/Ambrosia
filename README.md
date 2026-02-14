# Ambrosia

**See the person, not just the picture.**

A modern, emotionally intelligent dating app MVP where profile photos stay blurred until meaningful conversation deepens. No swiping. No gamification.

## Design

- **Palette:** `#3F1414` (background), `#940128` (CTA), `#800022` (highlights), `#550015` (cards), warm off-white text.
- **Tone:** Minimal, dark romantic, calm, premium.

## Features

1. **Landing** — Hero, “How it works” (3 steps), CTA to quiz.
2. **Compatibility Quiz** — 8–10 values-based questions, progress bar, then “Compatibility Snapshot” and CTA to create profile.
3. **Sign up & Profile** — Name, age, gender, location, email/password; then Core Values, Emotional Depth, Lifestyle & Vision (displayed as profile cards).
4. **Matches** — 3–5 curated matches, blurred photo, compatibility summary, “Start conversation.”
5. **Chat** — Progressive blur: 100% → 70% (5 msgs) → 40% (15 msgs) → full (30 msgs or mutual “Reveal”). Connection level label and optional conversation prompts.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (auth + profiles)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
3. In the Supabase **SQL Editor**, run the schema: paste and run the contents of `supabase/schema.sql`. This creates the `profiles` table and RLS policies.
4. (Optional) In **Authentication → Providers → Email**, turn off “Confirm email” if you want sign-up without verification for local dev.

Without Supabase env vars, the app still runs and uses `localStorage` for auth (no real login).

## Tech

- Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Auth:** Supabase Auth when env is set; otherwise `localStorage`.
- **Profiles:** Stored in Supabase `profiles` (id = `auth.uid()`).
- Quiz, matches, conversations: still in `localStorage` for now.
- Compatibility score from quiz overlap; blur level from message count and mutual reveal.
