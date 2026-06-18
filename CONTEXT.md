# OCL Selection — Project Context

A trip-registration / city-selection web app for students. Students enter their
student ID, pick a city for a trip, and register subject to per-city quotas.
A teacher view and a registration-check view round out the flows.

> This file is a tool-agnostic project context for any AI coding assistant
> (Claude Code, Cursor, Copilot, Aider, Windsurf, etc.). Some tools auto-load a
> specific filename — Claude Code reads `CLAUDE.md`, several others read `AGENTS.md`.
> To have it picked up automatically, symlink or copy this file to the name your
> tool expects, or reference it from that file.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19, TypeScript 5
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **3D / motion:** `@react-three/fiber` + `@react-three/drei` (Three.js), `framer-motion`
- **Backend:** Supabase — Postgres + Edge Functions (Deno)
- **Analytics:** `@vercel/analytics`, `@vercel/speed-insights`
- **Deploy target:** Vercel (see `DEPLOYMENT.md`, `QUICKSTART.md`)

## Layout

```
app/
  page.tsx                  Home (uses Scene + Countdown)
  layout.tsx                Root layout
  check/page.tsx            Registration-check page
  register/page.tsx         Registration form
  teacher/page.tsx          Teacher view
  trips/page.tsx            Trips listing
  api/server-time/route.ts  Authoritative server clock endpoint
  components/               Countdown.tsx, Scene.tsx
  hooks/useServerTime.ts    Clock sync via performance.now() (anti clock-tamper)
  globals.css
lib/supabase.ts             Browser Supabase client (anon key)
types/index.ts              Shared types: City, Student, RegisterRequest, ApiResponse, ErrorCode
supabase/
  functions/                Deno edge functions (service-role key, server-side)
    check-registration/  city-status/  get-students/  register-trip/
  migrations/               01_create_cities … 04_add_student_level
  config.toml
```

## Data model (Postgres)

- **cities**: `id uuid pk`, `name text`, `quota int` (seeded: Bangkok 50, Chiang Mai 40, Phuket 35, Pattaya 45)
- **students**: `student_id text pk`, `name`, `surname`, `class`, `class_no`, `city_id uuid → cities.id`, `level text`, `created_at timestamptz`
  - Index on `city_id`. Realtime enabled on `students`.

⚠️ **Known mismatch:** `types/index.ts` `City` uses `city_id`, `current_count`,
`remaining`, but the DB table uses `id` and computes counts at query time. Treat the
DB schema as source of truth; the `City` type is partly a view/derived shape.

## Conventions

- **Client vs server keys:** `lib/supabase.ts` uses the **anon** key
  (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) for browser code.
  Edge functions use the **service-role** key (`SUPABASE_SERVICE_ROLE_KEY`) server-side only.
  Never expose the service-role key to the client.
- **Edge functions** (Deno): import via `https://deno.land/std@0.168.0/http/server.ts`
  and `https://esm.sh/@supabase/supabase-js@2`. Always handle the CORS `OPTIONS`
  preflight and return `corsHeaders`. Return `{ success, error_code?, message? }`
  with `error_code` from the `ErrorCode` union in `types/index.ts`.
- **Quota enforcement** lives server-side in `register-trip`: check already-registered →
  validate city → count current registrations → compare to quota → insert.
- **Time:** Do not trust the client clock. Use `useServerTime()` and `/api/server-time`.
- **'use client'** required for any component using hooks, framer-motion, or R3F.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — serve the build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npx supabase functions deploy <name>` — deploy an edge function
- `npx supabase db push` — apply migrations

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client, in `.env.local`)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (edge function runtime, set in Supabase dashboard)
