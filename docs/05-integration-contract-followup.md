# Integration Contract — Follow Up Handoff — Soul Hub

## 1. Purpose

This document defines the precise contract between Soul Hub and Phaneroo's Follow Up department. It specifies what data is sent, in what format, to what endpoint, with what authentication, and what happens when things fail.

If this contract is not followed exactly, submissions may be lost silently. Any change to this contract requires a Decision Log entry and written agreement from both the technical lead and the Follow Up lead.

## 2. Scope

**In scope (MVP):**
- One-directional handoff: Hub → Follow Up intake
- Form submissions only
- Webhook delivery if an endpoint exists; CSV/email export if not
- Retry on failure, with alerting

**Out of scope (MVP):**
- Bidirectional sync
- Deep API integration with Phaneroo's Team Member / Supervisor apps
- Automated assignment of submissions to individual follow-up agents
- Status updates from Follow Up back to the Hub

## 3. Trigger

A handoff is triggered when a row is written to `form_submissions` with `handoff_status = 'pending'`.

A scheduled worker picks up pending rows, attempts delivery, and updates `handoff_status` accordingly.

## 4. Payload

The handoff payload contains exactly these fields, in this order:

| Field | Type | Required | Source | Notes |
|:---|:---|:---|:---|:---|
| `submission_id` | string (uuid) | Yes | `form_submissions.id` | Unique identifier; use for deduplication |
| `name` | string | Yes | `form_submissions.name` | First name |
| `contact_method` | string | Yes | `form_submissions.contact_method` | `phone` or `email` |
| `contact_value` | string | Yes | `form_submissions.contact_value` | The actual phone number or email |
| `topic` | string | No | `form_submissions.topic` | One of the controlled topic tags |
| `surface_source` | string | Yes | `form_submissions.surface_source` | e.g. `cup-pilot`, `hotel-pilot` |
| `slug` | string | Yes | `form_submissions.slug` | The exact short code scanned |
| `submitted_at` | string (ISO 8601, UTC) | Yes | `form_submissions.created_at` | e.g. `2026-09-22T14:03:11Z` |

**Rules:**
- Do not send additional fields. If a field is not listed here, it is not part of the contract.
- Do not omit required fields. If a required value is missing, do not send the payload; log an error and alert.
- Do not change field names or types without a contract revision.

## 5. Endpoint

**Method:** `POST`

**URL:** `FOLLOWUP_WEBHOOK_URL` (environment variable; not hardcoded)

**Content-Type:** `application/json`

**Example payload:**

```json
{
  "submission_id": "b1e2c3d4-...",
  "name": "Daniel",
  "contact_method": "phone",
  "contact_value": "+256...",
  "topic": "peace",
  "surface_source": "hotel-pilot",
  "slug": "peace-01",
  "submitted_at": "2026-09-22T14:03:11Z"
}
```

## 6. Authentication

**MVP:** a shared secret sent as an HTTP header.

| Header | Value |
|:---|:---|
| `Authorization` | `Bearer <FOLLOWUP_API_KEY>` |
| `Content-Type` | `application/json` |
| `X-Source` | `soul-hub` |

**Rules:**
- The API key is stored in environment variables. Never committed.
- The key is rotated on a schedule agreed with the Follow Up lead.
- If authentication fails, the delivery is treated as a failed attempt.

## 7. Success Response

Follow Up must return:

- **HTTP status:** `200` or `202`
- **Body:** any valid JSON (contents ignored by the Hub)

Any other status is treated as a failure.

## 8. Failure Handling

| Failure type | Action |
|:---|:---|
| Network error / timeout | Retry |
| Non-2xx response | Retry |
| Auth failure (401/403) | Retry once, then alert technical lead |
| Malformed response | Retry |
| Missing required field in payload | Do not send; alert |

**Retry policy:**
- Up to 3 attempts
- Backoff: 1 min, 5 min, 15 min
- After 3 failed attempts: set `handoff_status = 'failed'`, alert the technical lead

**Alerting:**
- Alerts go to a defined channel (to be specified before launch)
- Alert includes `submission_id`, failure reason, and attempt count

## 9. Delivery Semantics

- **At-least-once:** the same `submission_id` may be delivered more than once if a response is not received.
- Follow Up must deduplicate on `submission_id`.
- The Hub does not guarantee ordering.

## 10. Timing

| Metric | Target |
|:---|:---|
| Pickup frequency | Every 5 minutes |
| Delivery attempt latency | Under 10 minutes from submission |
| Follow Up first response to the person | Within the promise on the confirmation screen (e.g. 24 hours) |

If the pickup worker is down, pending rows accumulate. On recovery, it processes the backlog in order.

## 11. Response-Time Promise

The confirmation screen shown to the person states a response window. Follow Up must meet it.

**Current promise:** *(to be confirmed by the Follow Up lead)*

| Contact method | Promise |
|:---|:---|
| Phone | Within 24 hours |
| Email | Within 48 hours |

Any change to the promise requires updating the Hub's confirmation copy and a Decision Log entry.

## 12. Testing Procedure

Before launch, and after any contract change:

1. Submit a test row to `form_submissions` with `handoff_status = 'pending'`.
2. Confirm the worker picks it up within the pickup interval.
3. Confirm Follow Up receives the payload with all required fields intact.
4. Confirm `handoff_status` updates to `sent` and `handoff_at` is set.
5. Confirm a duplicate payload is deduplicated by Follow Up.
6. Simulate a failure (e.g. invalid endpoint) and confirm retries and alerting occur.

## 13. CSV / Email Fallback (if no webhook exists)

If Follow Up cannot receive a webhook at MVP:

- The worker exports pending rows to a CSV on a fixed schedule.
- The CSV is delivered by email or placed in a shared location.
- A named person at Follow Up imports it manually.
- The worker still updates `handoff_status` to `sent` on confirmed receipt, or leaves it `pending` until confirmed.

The CSV must use the same field names and order as the JSON payload.

## 14. Change Procedure

Any change to this contract requires:

1. A written proposal describing the change and its reason.
2. Agreement from both the technical lead and the Follow Up lead.
3. A Decision Log entry.
4. A test against the full flow before promotion to production.
5. An update to this document.

Do not change the payload, endpoint, or auth silently. Silent changes are the primary cause of lost submissions.

## 15. Open Items

| Item | Owner | Needed by |
|:---|:---|:---|
| Confirm webhook endpoint URL | Follow Up lead | Before pilot |
| Confirm API key exchange method | Technical lead | Before pilot |
| Confirm response-time promise | Follow Up lead | Before launch |
| Confirm alert channel | Technical lead | Before launch |
| Confirm pickup frequency is acceptable | Both | Before launch |
| Decide whether CSV fallback is needed | Both | Before launch |