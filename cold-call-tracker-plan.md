# Cold Call Tracker

## Goal
Build a Next.js + Supabase cold call tracker with call logging, dashboard stats, search/filter, dark theme, mobile-friendly.

## Database Schema

```sql
-- Single table: calls
create table calls (
  id uuid default gen_random_uuid() primary key,
  contact_name text not null,
  company text,
  phone text,
  outcome text check (outcome in ('no_answer', 'voicemail', 'callback', 'interested', 'not_interested', 'closed')),
  notes text,
  follow_up_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for dashboard queries
create index idx_calls_created_at on calls(created_at);
create index idx_calls_follow_up on calls(follow_up_date);
```

## File Structure

```
app/
  layout.tsx          -- dark theme, global styles
  page.tsx            -- dashboard (stats + recent calls)
  calls/
    page.tsx          -- all calls list with search/filter
    new/page.tsx      -- log new call form
    [id]/page.tsx     -- edit call
components/
  CallForm.tsx        -- reusable form for new/edit
  CallsTable.tsx      -- sortable table with search
  StatsCards.tsx      -- today's calls, conversion rate, follow-ups due
  OutcomeBadge.tsx    -- colored badge per outcome
lib/
  supabase.ts         -- client init
  actions.ts          -- server actions (CRUD)
```

## Tasks

- [ ] 1: `npx create-next-app@latest . --ts --tailwind --app --src=no` → Verify: `npm run dev` shows default page
- [ ] 2: Install deps: `npm i @supabase/supabase-js`, create `lib/supabase.ts` with env vars → Verify: file exists, `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 3: Run SQL schema in Supabase dashboard (or migration file) → Verify: table `calls` exists
- [ ] 4: Build `lib/actions.ts` with server actions: `createCall`, `updateCall`, `deleteCall`, `getCalls`, `getStats` → Verify: types correct, no build errors
- [ ] 5: Build `CallForm.tsx` (contact, company, phone, outcome dropdown, notes, follow-up date picker) → Verify: renders on `/calls/new`
- [ ] 6: Build `CallsTable.tsx` with search input + outcome filter → Verify: renders on `/calls`
- [ ] 7: Build `StatsCards.tsx` (calls today, conversion %, follow-ups due) → Verify: renders on `/`
- [ ] 8: Wire up dashboard `page.tsx` with stats + 5 recent calls → Verify: shows real data from Supabase
- [ ] 9: Dark theme (`globals.css` dark bg, Tailwind dark classes), mobile responsive → Verify: looks good on mobile viewport
- [ ] 10: Final QA — all CRUD works, stats update, search filters, no console errors → Verify: full user flow works

## Done When
- [ ] Can log a call, see it in dashboard, search/filter, edit it
- [ ] Stats show correct numbers
- [ ] Dark theme, works on mobile
