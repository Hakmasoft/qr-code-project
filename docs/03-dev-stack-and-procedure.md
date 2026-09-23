# Development Stack & Procedure — Soul Hub

## 1. Purpose

This document defines the technical stack, architecture, data model, and build procedure for Soul Hub. It is written for execution, not discussion. Every decision here has a rationale so that future contributors — human or agent — understand why it is the way it is before changing it.

## 2. Architecture Overview

```
Physical Surface (text + QR)
        │
        ▼
Short Link  →  scan.…/c/[slug]
        │
        ▼
Redirect Service (looks up slug, logs scan event)
        │
        ▼
Hub  →  matched clip (embedded from TikTok)  →  season ad  →  next-step form
        │
        ▼
Follow Up (handoff via webhook or manual import)
```

Three components:

1. **Redirect service** — owns the slug mapping, logs every scan, returns a 302 redirect.
2. **Hub** — serves the matched clip (embedded from TikTok), the season ad, and the next-step form.
3. **Handoff** — pushes form submissions to Follow Up.

The QR code never encodes the final Hub URL. It encodes a short link on a domain we control. Destinations are editable without reprinting.

## 3. Stack Decisions

| Layer | Choice | Rationale |
|:---|:---|:---|
| Redirect hosting | Cloudflare Workers | No cold start; 100k requests/day free; global edge |
| Redirect database | Cloudflare D1 | Bound directly to Worker; free tier generous for pilot |
| Hub framework | Next.js (App Router) | SSR/SSG, SEO-friendly, mobile-first, Vercel free tier to start |
| Hub CMS | Sanity (or Strapi 5) | Schema-as-code, editor-friendly, decouples content from code |
| Video hosting | TikTok (embedded on Hub) | Free hosting; native short-form; algorithm as secondary channel |
| Object storage | S3-compatible (Railway, Hetzner, or equivalent) | Source files and fallback delivery |
| Hub database | Supabase (Postgres) | Free to start, scales, includes auth and row-level security |
| Deployment | Vercel (Hub) + Cloudflare (redirect) | Fits each component's strength |
| Follow Up handoff | Webhook or scheduled export | MVP: no deep API integration; validate volume first |

### Alternatives Rejected

| Option | Why rejected |
|:---|:---|
| Render for redirects | Free tier spins down after 15 min idle; cold start kills redirect UX |
| Vercel for redirects | No built-in database on free tier; requires external DB |
| Third-party dynamic QR services | Free tiers have scan limits; redirects can stop; dependency risk |
| Static QR codes | Encode final URL; break when Hub structure changes |
| Self-hosted video | Bandwidth cost and complexity; not a differentiator |
| Mux | Cost scales with viewing minutes; no distribution benefit. See ADR-015 |

## 4. Domain Strategy

**Pilot stage:** use a temporary domain we control (e.g. `soulhub.…` or similar). Do not use `phaneroo.org` at pilot.

**Later:** migrate to a subdomain such as `scan.phaneroo.org` or `word.phaneroo.org`.

**Rules:**
- Never print a final Hub URL. Print only `[domain]/c/[slug]`.
- Never print a third-party domain (bit.ly, qrco.de, etc.).
- The short-link domain is independent of the Hub domain so Hub changes do not break printed material.

## 5. Data Model

### Table: `slugs`

| Field | Type | Notes |
|:---|:---|:---|
| `slug` | text, primary key | e.g. `peace-01` |
| `destination` | text | Current target URL |
| `surface_source` | text | e.g. `cup-pilot`, `hotel-pilot` |
| `topic` | text | Matches form dropdown tag |
| `active` | boolean | Inactive slugs redirect to fallback |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### Table: `scan_events`

| Field | Type | Notes |
|:---|:---|:---|
| `id` | uuid, primary key | |
| `slug` | text, foreign key | |
| `timestamp` | timestamp | |
| `device_type` | text | Parsed from user agent |
| `ip_hash` | text | Hashed; never store raw IP |
| `user_agent` | text | Optional, for debugging |

### Table: `form_submissions`

| Field | Type | Notes |
|:---|:---|:---|
| `id` | uuid, primary key | |
| `name` | text | Required |
| `contact_method` | text | `phone` or `email` |
| `contact_value` | text | Required |
| `topic` | text | From dropdown; optional |
| `surface_source` | text | From slug lookup |
| `created_at` | timestamp | |
| `handoff_status` | text | `pending`, `sent`, `failed` |
| `handoff_at` | timestamp | Nullable |

### Table: `clips`

| Field | Type | Notes |
|:---|:---|:---|
| `id` | uuid, primary key | |
| `topic` | text | Matches slug topic |
| `title` | text | Internal label |
| `video_url` | text | TikTok video URL or ID |
| `surface_codes` | text[] | Slugs this clip serves |
| `active` | boolean | |

### Table: `season_ads`

| Field | Type | Notes |
|:---|:---|:---|
| `id` | uuid, primary key | |
| `title` | text | Internal label |
| `video_url` | text | TikTok video URL or ID |
| `invitation_copy` | text | Warm, specific |
| `active_from` | timestamp | |
| `active_until` | timestamp | |
| `active` | boolean | |

## 6. Redirect Service Procedure

**Route:** `GET /c/:slug`

**Logic:**
1. Look up `slug` in `slugs` table.
2. If not found or `active = false`, redirect to fallback page.
3. If found, log a row in `scan_events`.
4. Return 302 redirect to `destination`.

**Rules:**
- Never return 404. Always redirect somewhere safe.
- Logging must not block the redirect. Fire-and-forget or queue.
- Destination changes are made in the database, not in code.

**Fallback page:** a minimal landing page on the same domain. Explains briefly what this is and links to the Hub homepage.

## 7. Hub Procedure

**Pages:**
- `/` — Hub home; lists available topics.
- `/[topic]` — serves the matched clip, then the season ad, then the next-step form.
- `/fallback` — shown when a slug is inactive or unknown.

**Slug-to-page mapping:** the redirect service points each slug to the appropriate `/[topic]` page. The topic is stored on the slug row.

**Rules:**
- Mobile-first. Test on a phone before desktop.
- Load in under 3 seconds on a 4G connection.
- One primary next step, one secondary. No other options.
- No autoplay audio. Ever.
- No pop-ups.
- Clips are embedded from TikTok. Never redirect the user off-site to TikTok.

## 8. Video Hosting Procedure

- Clips and season ads are uploaded to TikTok.
- Each video has a stable URL. Store it in the `clips` or `season_ads` row as `video_url`.
- The Hub embeds the video using TikTok's official embed player. It does not redirect to TikTok.
- The Hub must never send a user off-site to watch a clip. This is a hard rule.
- If TikTok's embed is unavailable, the Hub shows a fallback message and the season ad text. It does not break the page.
- Analytics for views and completion come from TikTok's dashboard. Record these manually or via API into the pilot tracking sheet.
- A fallback hosting option (object storage or another provider) should be identified but not built at pilot. See ADR-015.

## 9. Follow Up Handoff Procedure (MVP)

1. Form submission writes a row to `form_submissions` with `handoff_status = 'pending'`.
2. A scheduled script (cron) picks up pending rows and pushes them to the Follow Up intake — via webhook if available, or as a CSV/email export if not.
3. On success, set `handoff_status = 'sent'` and `handoff_at = now()`.
4. On failure, retry up to 3 times, then set `handoff_status = 'failed'` and alert the technical lead.
5. Deep API integration with Phaneroo's Team Member / Supervisor apps is out of scope for MVP. Validate volume first.

See `05-integration-contract-followup.md` for the precise field-level spec.

## 10. Environment and Setup

**Prerequisites:**
- Node.js LTS
- A Cloudflare account (Workers + D1)
- A Vercel account
- A Supabase project
- A TikTok account for the project
- Git access to the `soul-hub` repository

**Local setup steps:**
1. Clone the repository.
2. Install dependencies.
3. Copy `.env.example` to `.env.local` and fill in credentials.
4. Run database migrations against a local or staging database.
5. Start the Hub dev server.
6. Start the redirect Worker in local mode.

**Environment variables (names only):**
- `D1_DATABASE_URL` or binding config
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `TIKTOK_EMBED_BASE_URL` (if a base is used for constructing embeds)
- `FALLBACK_URL`
- `FOLLOWUP_WEBHOOK_URL`
- `FOLLOWUP_API_KEY`

Never commit `.env` files.

## 11. Build and Deploy Procedure

**Redirect service (Cloudflare Worker):**
- Deploy via Wrangler.
- Bind D1 database to the Worker.
- Test the `/c/:slug` route against staging slugs before promoting.

**Hub (Next.js on Vercel):**
- Deploy from the main branch.
- Preview deployments for every pull request.
- Promote to production only after checklist passes.

**Database migrations:**
- Versioned migration files in the repo.
- Applied to staging first, then production.
- Never edit the schema in production directly.

## 12. Coding Conventions and Constraints

**General:**
- Lowercase, kebab-case file names.
- One responsibility per module.
- No secrets in code.
- Commit messages in imperative mood.

**Hard rules for contributors and agents:**
- Never hardcode a destination URL in the redirect service. All destinations live in the database.
- Never print a third-party domain on any material.
- Never modify the `slugs` or `form_submissions` schema without a migration file.
- Never store raw IP addresses. Hash before persisting.
- Never return a 404 from a slug route. Always redirect to fallback.
- Never autoplay audio on the Hub.
- Never redirect a user off the Hub to TikTok. Clips are embedded, not linked out.
- Never add a fifth field to the form without an explicit decision recorded in the Decision Log.

## 13. Testing and Validation

- **Redirect:** given a known slug, returns 302 with the correct destination. Given an unknown slug, returns 302 to fallback.
- **Scan logging:** every redirect writes exactly one scan event.
- **Hub:** each topic page loads in under 3 seconds on a mobile connection; the correct TikTok clip is embedded for the slug's topic; the page never redirects off-site to TikTok.
- **Form:** submission writes a row; the handoff script picks it up within the scheduled window.
- **Handoff:** a test submission reaches the Follow Up intake end to end.
- **Season ad rotation:** changing the active season ad in the database changes what appears on the Hub without a redeploy.

## 14. Definition of Done (per component)

**Redirect service:**
- `/c/:slug` works in staging and production.
- Scan events are logged.
- Unknown slugs redirect to fallback.
- No 404s.

**Hub:**
- Topic pages serve the correct clip, embedded from TikTok.
- No topic page redirects the user to TikTok.
- Season ad rotates via database, not code.
- Mobile-first layout verified on a real phone.
- Load time under 3 seconds.

**Form and handoff:**
- Four fields maximum.
- Confirmation screen states response promise.
- Submissions reach Follow Up.
- Failures are retried and alerted.

**Tracking:**
- Scan events queryable per slug and per surface source.
- Form submissions queryable per topic and per surface source.

## 15. Rollout Procedure

1. Deploy redirect service to staging. Test with sample slugs.
2. Deploy Hub to staging. Confirm clips, season ad, and form work.
3. Confirm Follow Up intake is ready and can receive test submissions.
4. Print a small batch of pilot surfaces with staging slugs.
5. Place pilot surfaces. Monitor scan events for 48 hours.
6. If scan rate is within expectation, promote to production domains.
7. Print remaining pilot batch with production slugs.
8. Monitor scan rate, clip completion, and next-step rate weekly.
9. Review at end of pilot. Decide: expand, adjust, or stop.

## 16. Pilot Mode Note

The pilot is a demonstration for the ideators, not a permanent deployment. During this phase:

- Use free platform domains: `*.workers.dev` for the redirect service and `*.vercel.app` for the Hub.
- Do not purchase a domain.
- Do not print physical material.
- QR codes point to the Workers URL and redirect to the Vercel URL.
- Test end to end on real phones.

The rules in §4 (Domain Strategy) and ADR-003 apply when, and only when, the pilot is approved and physical material is about to be printed. Until then, free domains are sufficient and correct.