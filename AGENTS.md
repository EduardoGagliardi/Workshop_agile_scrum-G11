# AGENTS.md — SkillSwap (G11)

Guide for AI agents and developers working on **Workshop_agile_scrum-G11**.  
Reflects the real state of the repo as of **June 2026**.

**Detailed reference:** `Docs/documentation-technique.md`  
**Architecture choices:** `Docs/justification-architecture.md`  
**Database / user stories:** `Docs/shema mcp_database.md`

---

## 1. Project summary

**SkillSwap** is a campus skill-exchange platform: students learn, teach, book sessions, message peers, and earn XP/badges.

| Layer | Location | Status |
|-------|----------|--------|
| Frontend | `web/` (Vite + React 19 + TypeScript) | Active development |
| Backend | Supabase (Auth + PostgreSQL + RLS) | Auth live; CRUD not wired in UI |
| SQL schema | `web/supabase/migrations/` | Migration written; must be applied on remote project |
| Docs / Figma | `Docs/`, `image figma/` | Reference only |

---

## 2. Stack (what is actually used)

| Used in code | Not used yet (mentioned in architecture docs) |
|--------------|--------------------------------------------------|
| React 19, Vite 8, TypeScript | React Router |
| CSS custom (`App.css`, `index.css`) | Tailwind, shadcn/ui |
| `@supabase/supabase-js` | TanStack Query |
| Ionicons (`IonIcon`, `registerIonIcons.ts`) | — |

**Navigation:** no URL router. Views are driven by `useState` in `App.tsx` (`landing` | `sign-in` | `sign-up` | `dashboard`). Dashboard sections use `activeSectionId` in `DashboardPage.tsx`.

---

## 3. Done (implemented)

### 3.1 Landing page (`web/src/pages/landing/LandingPage.tsx`)

- [x] Sticky top nav (French labels), logo, CTA Connexion / S'inscrire
- [x] Hero with image, floating cards, social proof
- [x] Sections: Comment ça marche, stats, À propos, Blog
- [x] Navigation to auth views via `onNavigate`

### 3.2 Auth UI (`web/src/pages/auth/AuthPage.tsx`)

- [x] Two-panel layout: brand panel (left) + form panel (right)
- [x] Sign-in and sign-up modes (`authMode` prop)
- [x] French copy, loading state, error/success feedback
- [x] Email + password with icon inputs; first/last name on sign-up
- [x] **No mentor account selector** (mentors are invitation-only)
- [x] Password field padding fix (icon no longer overlaps text)
- [x] Responsive: brand panel compact on mobile

### 3.3 Supabase Auth (connected)

- [x] Client: `web/src/lib/supabaseClient.ts` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [x] Sign-in: `signInWithPassword`
- [x] Sign-up: `signUp` with `user_metadata` (`first_name`, `last_name`)
- [x] Session restore on load: `getSession()` in `App.tsx`
- [x] Auth listener: `onAuthStateChange`
- [x] Sign-out: `signOut()` from dashboard sidebar
- [x] Email confirmation flow: success message if no session after sign-up

### 3.4 Dashboard shell (`web/src/pages/dashboard/`)

- [x] Layout: sidebar + header + main + optional right panel
- [x] Sections defined in `skillSwapData.ts` (`DashboardSectionId`)
- [x] **Overview** section: welcome, upcoming sessions, popular skills, stats, recent activity (all **mock data**)
- [x] Other sections: placeholder / partial UI (search, notifications, badges, profile, etc.)
- [x] Sheets for messages / notifications (mock content)
- [x] App sidebar with XP bar, badges preview, sign out

### 3.5 Database (SQL only — not consumed by UI yet)

- [x] Migration `web/supabase/migrations/20260602154716_setup_skillswap_database.sql`
- [x] Tables: `users`, `skills`, `user_skills`, `sessions`, registrations, badges, contacts, conversations, messages, etc.
- [x] RLS on public tables, `app_private` triggers (XP/level, session rules, contacts, messages)
- [x] Supabase CLI config: `web/supabase/config.toml`

### 3.6 Tooling & assets

- [x] ESLint, TypeScript build passes (`npm run build`)
- [x] Favicon, logo, hero/background images under `web/src/assets/`
- [x] `web/.env` with publishable key (`sb_publishable_...`)

---

## 4. To do (prioritized)

### P0 — Auth & user profile (blocking real usage)

| Task | Notes |
|------|--------|
| Sync `public.users` on sign-up | `users.id` references `auth.users`. Add DB trigger `on auth.user_created` or post-signup insert. UI still shows mock **Sarah Martin**. |
| Load real user in dashboard | Replace `currentUser` from `skillSwapData.ts` with `supabase.from('users').select()` for `auth.uid()`. |
| Wire **Mot de passe oublié** | Button exists in `AuthPage.tsx`; call `resetPasswordForEmail` + redirect URL. |
| Verify migration applied on Supabase project | Run `supabase db push` (or dashboard SQL) from `web/`. |
| Auth redirect URLs | Supabase dashboard: Site URL + `http://localhost:5173` for dev. |

### P1 — Core product (schema ready, UI mock)

| Task | Notes |
|------|--------|
| Skills CRUD | `skills`, `user_skills` + RLS |
| Session create / list / register | `sessions`, `session_registrations`; respect triggers |
| Search mentors/skills | Replace search section placeholders |
| Messages & conversations | `conversations`, `messages`; optional Realtime |
| Contact requests & friends | `contact_requests`, `user_contacts` |
| Notifications | Table or derived events; replace mock badges in sidebar |

### P2 — Gamification & roles

| Task | Notes |
|------|--------|
| XP / level display from DB | Trigger `sync_user_level_from_experience` already in migration |
| Badges | `badges`, `user_badges` |
| Mentor invitation flow | No self-service mentor sign-up; admin/invite only |
| `account_type` on `public.users` | Do **not** store authorization in `user_metadata` |

### P3 — Architecture & quality (from docs)

| Task | Notes |
|------|--------|
| React Router (or similar) | Deep links, browser back |
| TanStack Query | Cache + loading/error for Supabase reads |
| Generated DB types | `supabase gen types typescript` |
| Edge Functions | Matching, XP awards, notifications (see `justification-architecture.md`) |
| shadcn + Tailwind | Optional refactor; **not** current codebase style |
| Tests | E2E auth + critical flows |
| Deploy | Vercel/Netlify + `VITE_*` env vars on host |

### P4 — Landing / polish

| Task | Notes |
|------|--------|
| Sections `#discover`, `#blog` | Mostly static copy today |
| i18n consistency | Mix FR landing / EN mock dashboard welcome — align to French |
| Help button on landing | No handler yet |

---

## 5. Mock vs live data

**Rule:** Anything imported from `web/src/data/skillSwapData.ts` is **static mock**.

After Supabase login, the app still shows fake data (Sarah Martin, fake sessions, messages, etc.).  
**Do not** assume the logged-in user matches `currentUser` until P0 tasks are done.

---

## 6. Environment

File: `web/.env` (not committed)

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

- Only `VITE_*` vars are exposed to the browser.
- Never put `service_role` or DB password in frontend env.
- Restart `npm run dev` after `.env` changes.

---

## 7. Commands (from `web/`)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Supabase CLI (when linked):

```bash
supabase db push    # apply migrations to remote
```

---

## 8. Conventions for agents

1. **Minimize scope** — match existing CSS/component patterns; no shadcn unless asked.
2. **Single Supabase client** — `web/src/lib/supabaseClient.ts` only.
3. **No duplicate UI** — check `pages/` and `skillSwapData.ts` before adding components.
4. **Security** — RLS is the enforcement layer; never bypass with service role in client.
5. **User metadata** — display names OK in `user_metadata`; roles/permissions go in `public.users`.
6. **Commits** — only when the user explicitly asks.
7. **Language** — UI copy is mostly French; keep new user-facing strings in French unless told otherwise.

---

## 9. Key files map

| Purpose | Path |
|---------|------|
| App routing / session | `web/src/App.tsx` |
| Auth forms + Supabase calls | `web/src/pages/auth/AuthPage.tsx` |
| Supabase client | `web/src/lib/supabaseClient.ts` |
| Mock dashboard data | `web/src/data/skillSwapData.ts` |
| Global styles | `web/src/App.css` |
| DB migration | `web/supabase/migrations/20260602154716_setup_skillswap_database.sql` |
| Technical doc | `Docs/documentation-technique.md` |

---

## 10. Progress matrix (quick view)

| Area | UI | Supabase Auth | Postgres data in UI |
|------|----|---------------|---------------------|
| Landing | ✅ | — | — |
| Sign-in / Sign-up | ✅ | ✅ | ❌ |
| Dashboard shell | ✅ | ✅ (session) | ❌ (mock) |
| Sessions | 🔶 placeholder | — | ❌ |
| Skills | 🔶 placeholder | — | ❌ |
| Messages / contacts | 🔶 mock sheets | — | ❌ |
| XP / badges | 🔶 mock display | — | 🔶 triggers in DB only |
| Edge Functions | ❌ | — | ❌ |

Legend: ✅ done · 🔶 partial · ❌ not started

---

## 11. When updating this file

Update **§3 Done** and **§4 To do** when:

- a feature is wired to Supabase tables (not just Auth);
- mock data is replaced for a section;
- architecture changes (router, UI kit, etc.).

Keep in sync with `Docs/documentation-technique.md` §15 for formal deliverables.
