# Data Dictionary / Schema Reference — Soul Hub

## 1. Purpose

This document defines every field in every table used by Soul Hub. It is the authoritative reference for anyone writing code, forms, queries, or integrations. Keep it in sync with the actual schema; if they diverge, this document is wrong and must be corrected.

## 2. Naming Conventions

- Table names: lowercase, plural, snake_case (e.g. `scan_events`)
- Column names: lowercase, snake_case (e.g. `created_at`)
- Primary keys: `id`, type `uuid` unless noted
- Timestamps: `timestamp` type, stored in UTC
- Booleans: prefixed with `is_` or named as an adjective (e.g. `active`)

## 3. Table: `slugs`

Stores the mapping between printed short codes and their current destinations.

| Field | Type | Required | Constraints | Purpose |
|:---|:---|:---|:---|:---|
| `slug` | text | Yes | Primary key; lowercase, kebab-case | The short code printed on the surface, e.g. `peace-01` |
| `destination` | text | Yes | Full URL | Current redirect target |
| `surface_source` | text | Yes | Lowercase, kebab-case | Identifies the surface batch, e.g. `cup-pilot`, `hotel-pilot` |
| `topic` | text | Yes | Matches a topic tag | Determines which clip the Hub serves |
| `active` | boolean | Yes | Default `true` | Inactive slugs redirect to fallback |
| `created_at` | timestamp | Yes | Default `now()` | Record creation |
| `updated_at` | timestamp | Yes | Auto-updated | Last modification |

**Notes:**
- The `slug` value never changes once printed. Only `destination`, `topic`, `active`, and `updated_at` may change.
- Changing `destination` does not require reprinting.
- A slug may be deactivated but must not be deleted while its surface may still be in circulation.

**Example row:**

| slug | destination | surface_source | topic | active |
|:---|:---|:---|:---|:---|
| `peace-01` | `https://hub.example/peace` | `hotel-pilot` | `peace` | true |

## 4. Table: `scan_events`

One row per scan. Append-only. Never updated, never deleted except for retention policy.

| Field | Type | Required | Constraints | Purpose |
|:---|:---|:---|:---|:---|
| `id` | uuid | Yes | Primary key | |
| `slug` | text | Yes | Foreign key → `slugs.slug` | Which short code was scanned |
| `timestamp` | timestamp | Yes | Default `now()` | When the scan occurred |
| `device_type` | text | No | `mobile`, `tablet`, `desktop`, `unknown` | Parsed from user agent |
| `ip_hash` | text | No | Hashed, never raw | For deduplication and abuse detection |
| `user_agent` | text | No | Raw string | Debugging only |

**Notes:**
- Never store raw IP addresses. Hash before persisting.
- Logging must not block the redirect. Fire-and-forget or queue.
- Retention: define a policy (e.g. 12 months) before launch.

**Example row:**

| id | slug | timestamp | device_type | ip_hash |
|:---|:---|:---|:---|:---|
| `…` | `peace-01` | `2026-09-22T14:03:11Z` | `mobile` | `a3f…` |

## 5. Table: `form_submissions`

One row per next-step form submission. This is the handoff payload to Follow Up.

| Field | Type | Required | Constraints | Purpose |
|:---|:---|:---|:---|:---|
| `id` | uuid | Yes | Primary key | |
| `name` | text | Yes | Max 100 chars | First name is enough |
| `contact_method` | text | Yes | `phone` or `email` | Preferred channel |
| `contact_value` | text | Yes | Valid phone or email | The actual contact |
| `topic` | text | No | Matches a topic tag | What caught their attention |
| `surface_source` | text | Yes | From slug lookup | Which surface batch |
| `slug` | text | Yes | Foreign key → `slugs.slug` | Exact code scanned |
| `created_at` | timestamp | Yes | Default `now()` | Submission time |
| `handoff_status` | text | Yes | `pending`, `sent`, `failed` | Handoff lifecycle |
| `handoff_at` | timestamp | No | Nullable | When handoff succeeded |
| `handoff_attempts` | integer | Yes | Default `0` | Retry count |

**Notes:**
- Four visible fields max: Name, Contact, Topic, Consent. `surface_source` and `slug` are captured silently.
- `handoff_status` transitions: `pending` → `sent` on success; `pending` → `failed` after 3 failed attempts.
- Never delete a submission. Retain per policy.

**Example row:**

| id | name | contact_method | contact_value | topic | slug | handoff_status |
|:---|:---|:---|:---|:---|:---|:---|
| `…` | `Daniel` | `phone` | `+256…` | `peace` | `peace-01` | `sent` |

## 6. Table: `clips`

Evergreen topic clips. One per topic. Do not change when the season changes.

| Field | Type | Required | Constraints | Purpose |
|:---|:---|:---|:---|:---|
| `id` | uuid | Yes | Primary key | |
| `topic` | text | Yes | Unique | Matches slug and form topic |
| `title` | text | Yes | Internal label | For the CMS, not shown publicly |
| `video_url` | text | Yes | TikTok video URL or ID | Embed source |
| `duration_seconds` | integer | No | Target ≤ 90 | For validation |
| `surface_codes` | text[] | No | Array of slugs | Which slugs serve this clip |
| `active` | boolean | Yes | Default `true` | |
| `created_at` | timestamp | Yes | Default `now()` | |

**Notes:**
- One active clip per topic at a time. Versioning, if needed, is handled by adding a new row and deactivating the old one.
- `surface_codes` is informational; the authoritative mapping is `slugs.topic`.
- `video_url` stores a TikTok video URL or ID. The Hub embeds it using TikTok's official embed player. The Hub must never redirect the user to TikTok. See ADR-015.

## 7. Table: `season_ads`

Rotating invitations. One active at a time.

| Field | Type | Required | Constraints | Purpose |
|:---|:---|:---|:---|:---|
| `id` | uuid | Yes | Primary key | |
| `title` | text | Yes | Internal label | |
| `video_url` | text | Yes | TikTok video URL or ID | Embed source |
| `invitation_copy` | text | Yes | Warm, specific | Text shown with or near the ad |
| `active_from` | timestamp | Yes | | Start of active window |
| `active_until` | timestamp | Yes | Must be > `active_from` | End of active window |
| `active` | boolean | Yes | Default `true` | Manual override |
| `created_at` | timestamp | Yes | Default `now()` | |

**Notes:**
- The Hub queries for the row where `active = true` and `now()` is between `active_from` and `active_until`.
- If no row matches, the Hub shows a fallback invitation (see Runbook).
- Only one row should be active at any time. Enforce in application logic.
- `video_url` stores a TikTok video URL or ID. The Hub embeds it using TikTok's official embed player. The Hub must never redirect the user to TikTok. See ADR-015.

## 8. Topic Tags

The `topic` field appears in `slugs`, `form_submissions`, and `clips`. It must be drawn from a controlled list.

| Tag | Meaning |
|:---|:---|
| `peace` | Anxiety, rest, calm |
| `purpose` | Direction, meaning, vocation |
| `identity` | Self-worth, shame, belonging |
| `hope` | Despair, endurance, future |

**Rules:**
- The list starts with 3–4 tags for the pilot. Adding a tag requires a Decision Log entry.
- Every slug must map to exactly one tag.
- Every tag must have exactly one active clip.
- The form dropdown uses the same tags.

## 9. Relationships

```
slugs.topic           → clips.topic          (many slugs to one clip)
slugs.slug            → scan_events.slug     (one slug to many scans)
slugs.slug            → form_submissions.slug (one slug to many submissions)
form_submissions.topic → clips.topic          (informational)
```

## 10. Indexes

Recommended for query performance:

- `scan_events(slug, timestamp)` — for per-slug scan counts over time
- `scan_events(timestamp)` — for overall time-series queries
- `form_submissions(handoff_status)` — for the handoff worker
- `form_submissions(created_at)` — for reporting
- `slugs(active)` — for redirect lookup
- `season_ads(active, active_from, active_until)` — for ad rotation query

## 11. Retention Policy

To be decided before launch. Suggested defaults:

| Table | Retention |
|:---|:---|
| `scan_events` | 12 months, then aggregate and purge |
| `form_submissions` | 24 months, then archive |
| `slugs` | Indefinite |
| `clips` | Indefinite |
| `season_ads` | Indefinite |

## 12. Migration Rules

- Every schema change is a versioned migration file in the repo.
- Migrations run on staging first, then production.
- Never edit production schema directly.
- Never drop a column or table without a Decision Log entry.
- Adding a required column requires a backfill plan.

## 13. Change Log

Track schema changes here, newest first.

| Date | Change | Author | Migration file |
|:---|:---|:---|:---|
| | Initial schema | | |
