---
trigger: always_on
---

---
description: RAINE project rules — stack, architecture, and UI system. Always apply.
---

# RAINE — Project Rules

RAINE is a fullstack **Next.js (App Router, JavaScript, no TypeScript, no Tailwind)**
movie-browsing study project with a minimalist "rainy lake" aesthetic. It uses the
TMDB API, proxied through server-side route handlers so the API key never reaches
the browser. Treat every instruction below as a hard constraint unless the user
explicitly overrides it.

## 1. Stack & Boundaries

- Next.js App Router, plain JavaScript, React function components only.
- Styling lives in ONE file: `app/globals.css`, using the CSS custom properties
  defined in `:root`. Do NOT add Tailwind, CSS-in-JS, styled-components, SASS,
  UI kits (MUI, shadcn, Chakra), or per-component CSS modules.
- No state libraries (Redux, Zustand) and no data libraries (axios, SWR,
  React Query). Use `useState`/`useEffect` and native `fetch`.
- Fonts come from `next/font` in `app/layout.js`: Fraunces (display/serif) and
  Sora (UI/sans), exposed as `--font-fraunces` and `--font-sora`. Never load
  fonts via <link> tags or @import.
- Posters render through `next/image` with `fill` + `sizes`. TMDB image host is
  whitelisted in `next.config.mjs` (`image.tmdb.org`). Never use raw <img>.

## 2. Backend & Secrets (critical)

- The TMDB key lives ONLY in `.env.local` as `TMDB_API_KEY`. It must never
  appear in client components, be renamed with a `NEXT_PUBLIC_` prefix, be
  hardcoded, logged, or committed.
- All TMDB calls go through `lib/tmdb.js` (server-only helper with
  `revalidate: 600` caching) and are exposed to the client exclusively via
  route handlers in `app/api/`:
  - `GET /api/popular` → TMDB /movie/popular
  - `GET /api/genre/[id]` → TMDB /discover/movie (in dynamic routes,
    `params` is a Promise — always `await params`)
  - `GET /api/search?q=` → TMDB /search/movie (reject empty q with 400)
- Client code must only ever fetch relative `/api/...` URLs. Adding a direct
  `api.themoviedb.org` fetch in a client component is a bug, not a shortcut.
- New endpoints follow the same pattern: helper in `lib/tmdb.js`, thin route
  handler, JSON errors as `{ error }` with proper status codes (502 upstream,
  400 bad input).

## 3. Design System — "rainy lake" (do not drift)

Palette (from `:root` in globals.css — always use the variables, never raw hex):
- `--mist-1/2/3` (#e8f1f6 → #bcd4e2): page background gradient, light surfaces
- `--ink` (#1b2a35) / `--ink-soft` (#4a6274): text
- `--dark` (#16222b) / `--dark-2` (#1e2f3b): ALL interactive input surfaces —
  tabs, search, buttons are deliberately dark against the misty background
- `--accent` (#7fb3d5): rainy light blue — focus rings, caret, highlights only

Visual language:
- Minimalist, calm, editorial. Pill shapes (border-radius 999px) for controls,
  `--radius` (18px) for cards, glassmorphism cards (translucent white +
  backdrop-blur), soft large shadows on hover only.
- Fraunces for headings/titles/logo; Sora for body and UI. Keep the lowercase,
  understated copy voice ("search the lake…", "Nothing surfaced from the lake").
- Never introduce: bright saturated colors, gradients outside the blue/mist
  family, emoji in UI copy, ALL-CAPS marketing text, borders heavier than 1px.
- Animations stay subtle and cheap: transform/opacity transitions ~0.25–0.35s,
  the rain canvas, the typing caret. No spring/bounce libraries, no framer-motion.

## 4. UI Anatomy & Workflow (how the interface behaves)

Layout, top to bottom:
1. **RainCanvas** — fixed full-screen <canvas>, ~90 animated drops, 0.35
   opacity, `pointer-events: none`, z-index 0. Everything else sits above it.
2. **Nav bar** — logo ("rai" + accent italic "ne"), dark pill tab group
   (All / Drama / Sci-Fi / Thriller / Animation), dark pill search input that
   widens on focus (220px → 270px) with an accent glow.
3. **TypingHero** — Claude-style typewriter headline: types a line with
   natural per-character jitter (42–97ms), pauses 2.4s, deletes fast (18ms),
   cycles to the next line; blinking accent caret. Preserve this rhythm.
4. **Section label + Grid** — Fraunces label reflecting state ("Popular now",
   "<Genre> films", "Results for …"); responsive auto-fill grid,
   minmax(180px, 1fr), glass cards that lift 6px on hover.
5. **MovieModal** — opened by card click; backdrop blur, poster left / body
   right (stacks on mobile), closes via ✕, backdrop click, and should also
   close on Escape if you touch this component.

Data workflow (must stay exactly this shape):
- First paint is SSR: `app/page.js` (server component) fetches popular movies
  and passes them as `initialMovies` to the `Browse` client component.
- `Browse` owns all interactive state: `movies`, `genre`, `query`, `selected`,
  `failed`. A `firstRender` ref skips the fetch effect on mount so SSR data is
  not immediately refetched — never remove this guard.
- Search input is debounced 400ms; tab clicks fetch immediately and clear the
  query. Every fetch uses an `AbortController` cancelled on cleanup so stale
  responses can't overwrite newer ones — keep this on any fetch you add.
- Results are capped at 18 items to keep the grid calm.
- Error state shows the themed empty message ("The lake is unreachable…"),
  never a raw error string or alert().

## 5. Code Style

- Components: PascalCase files in `components/`, one component per file,
  client components explicitly marked with "use client" only when they need
  state, effects, or browser APIs. Keep server components server-side.
- Prefer small, flat components over prop-drilling towers; current tree
  (Browse → TypingHero / MovieCard / MovieModal) is the reference pattern.
- Guard against missing TMDB data everywhere: optional chaining for
  `vote_average`, fallbacks for `release_date`, `overview`, `poster_path`
  (gradient fallback tile with the title in Fraunces).
- No console.log left in committed code (console.error in catch blocks is fine).

## 6. Workflow Expectations for the Agent

- Before changing UI, read `app/globals.css` and reuse existing classes and
  variables; extend the design system, don't fork it.
- After any change, verify: `npm run dev` boots clean, no hydration warnings,
  the key is absent from all client bundles, and the rainy-lake look is intact.
- Never run `npm run build` output commits, add dependencies, or restructure
  folders without stating why first. `.env.local` and `node_modules` stay
  gitignored.
- This is a study project: when you implement something non-obvious (SSR
  handoff, aborting fetches, route handler params), add a one-line comment
  explaining the "why" so the author learns from it.
