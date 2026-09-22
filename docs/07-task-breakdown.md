# Task / Work Breakdown — Soul Hub

## 1. Purpose

This document lists the discrete work items required to launch and operate the Soul Hub pilot. Each task is scoped to be small enough for a single contributor or agent to complete without further clarification.

Read `docs/06-agent-instructions.md` before starting any task. Read the referenced doc for full context.

## 2. Task Format

Each task includes:

- **ID** — stable identifier for referencing in commits, issues, and logs
- **Title** — one-line description
- **Deliverable** — the concrete output
- **Definition of Done** — how completion is verified
- **Depends on** — prerequisite task IDs
- **Owner role** — the kind of contributor needed
- **Doc reference** — where the detail lives

## 3. Phase 0 — Foundations

### T-001 — Register temporary domain

- **Deliverable:** A domain we control, ready to point at Cloudflare Workers
- **Definition of Done:** Domain resolves; DNS is manageable; no third-party shortener in the chain
- **Depends on:** None
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §4

### T-002 — Create Cloudflare account and D1 database

- **Deliverable:** A D1 database instance bound to a Worker project
- **Definition of Done:** A test Worker can read and write to D1 in staging
- **Depends on:** None
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §3, §5

### T-003 — Set up Supabase project

- **Deliverable:** A Supabase project with the `form_submissions` table
- **Definition of Done:** Table exists per schema; connection string stored in environment
- **Depends on:** None
- **Owner role:** Technical lead
- **Doc reference:** `04-data-dictionary.md` §5

### T-004 — Set up Mux account

- **Deliverable:** A Mux account with API tokens and a test playback ID
- **Definition of Done:** A sample video plays from a test page
- **Depends on:** None
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §8

### T-005 — Set up Vercel project for the Hub

- **Deliverable:** A Vercel project linked to the `hub/` directory
- **Definition of Done:** Preview deployments work on pull requests
- **Depends on:** None
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §11

## 4. Phase 1 — Data Layer

### T-101 — Write initial migration for `slugs` and `scan_events`

- **Deliverable:** A versioned migration file creating both tables
- **Definition of Done:** Migration applies cleanly to local and staging D1
- **Depends on:** T-002
- **Owner role:** Backend contributor
- **Doc reference:** `04-data-dictionary.md` §3, §4

### T-102 — Write initial migration for `form_submissions`, `clips`, `season_ads`

- **Deliverable:** A versioned migration file creating these tables
- **Definition of Done:** Migration applies cleanly to local and staging Supabase
- **Depends on:** T-003
- **Owner role:** Backend contributor
- **Doc reference:** `04-data-dictionary.md` §5, §6, §7

### T-103 — Add indexes

- **Deliverable:** Migration adding the indexes listed in the Data Dictionary
- **Definition of Done:** Indexes exist in staging; query plans use them
- **Depends on:** T-101, T-102
- **Owner role:** Backend contributor
- **Doc reference:** `04-data-dictionary.md` §10

### T-104 — Seed topic tags and test slugs

- **Deliverable:** Seed rows for the four topic tags and three test slugs
- **Definition of Done:** Test slugs resolve in staging
- **Depends on:** T-101
- **Owner role:** Backend contributor
- **Doc reference:** `04-data-dictionary.md` §8

## 5. Phase 2 — Redirect Service

### T-201 — Implement `/c/:slug` route

- **Deliverable:** Worker route that looks up a slug and returns a 302
- **Definition of Done:** Known slug redirects correctly; unknown slug redirects to fallback; no 404s
- **Depends on:** T-101
- **Owner role:** Backend contributor
- **Doc reference:** `03-dev-stack-and-procedure.md` §6

### T-202 — Implement scan event logging

- **Deliverable:** Non-blocking write of one `scan_events` row per redirect
- **Definition of Done:** Every redirect produces exactly one row; redirect latency is unaffected
- **Depends on:** T-201
- **Owner role:** Backend contributor
- **Doc reference:** `04-data-dictionary.md` §4

### T-203 — Implement fallback page

- **Deliverable:** A minimal page shown when a slug is unknown or inactive
- **Definition of Done:** Fallback renders on mobile; links to Hub homepage
- **Depends on:** T-201
- **Owner role:** Frontend contributor
- **Doc reference:** `03-dev-stack-and-procedure.md` §6

### T-204 — Deploy Worker to staging

- **Deliverable:** Worker live on a staging subdomain
- **Definition of Done:** End-to-end redirect and logging verified
- **Depends on:** T-201, T-202, T-203, T-001
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §11

## 6. Phase 3 — Hub

### T-301 — Scaffold Next.js app

- **Deliverable:** A Next.js App Router project in `hub/`
- **Definition of Done:** Dev server runs; lint passes; Vercel preview deploys
- **Depends on:** T-005
- **Owner role:** Frontend contributor
- **Doc reference:** `03-dev-stack-and-procedure.md` §7

### T-302 — Build topic page `/[topic]`

- **Deliverable:** A page that loads the clip for a topic, then the season ad, then the form
- **Definition of Done:** Loads in under 3 seconds on a phone; correct clip served per topic
- **Depends on:** T-301, T-102, T-004
- **Owner role:** Frontend contributor
- **Doc reference:** `03-dev-stack-and-procedure.md` §7

### T-303 — Build Hub home page `/`

- **Deliverable:** A simple index of available topics
- **Definition of Done:** Mobile-first; loads fast; links to topic pages
- **Depends on:** T-301
- **Owner role:** Frontend contributor
- **Doc reference:** `03-dev-stack-and-procedure.md` §7

### T-304 — Build the next-step form

- **Deliverable:** A four-field form that writes to `form_submissions`
- **Definition of Done:** Submissions persist; confirmation screen shows response-time promise; silent fields captured
- **Depends on:** T-302, T-102
- **Owner role:** Frontend contributor
- **Doc reference:** `02-content-style-guide.md` §9, `04-data-dictionary.md` §5

### T-305 — Build season ad rotation

- **Deliverable:** Hub reads the active `season_ads` row and renders it after the clip
- **Definition of Done:** Changing the active row in the database changes the Hub without a redeploy
- **Depends on:** T-302, T-102
- **Owner role:** Frontend contributor
- **Doc reference:** `04-data-dictionary.md` §7

### T-306 — Deploy Hub to staging

- **Deliverable:** Hub live on a staging URL
- **Definition of Done:** End-to-end flow works: redirect → topic page → clip → season ad → form
- **Depends on:** T-302, T-304, T-305
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §11

## 7. Phase 4 — Follow Up Handoff

### T-401 — Implement handoff worker

- **Deliverable:** A scheduled script that picks up `pending` submissions and posts them to the Follow Up endpoint
- **Definition of Done:** Delivery updates `handoff_status`; failures retry per policy
- **Depends on:** T-102
- **Owner role:** Backend contributor
- **Doc reference:** `05-integration-contract-followup.md` §3–§8

### T-402 — Implement retry and alerting

- **Deliverable:** Retries on failure; alert on final failure
- **Definition of Done:** Simulated failure triggers retries and an alert
- **Depends on:** T-401
- **Owner role:** Backend contributor
- **Doc reference:** `05-integration-contract-followup.md` §8

### T-403 — Run end-to-end handoff test

- **Deliverable:** A test submission reaches Follow Up and is confirmed received
- **Definition of Done:** All steps in the contract's testing procedure pass
- **Depends on:** T-401, T-402, T-306
- **Owner role:** Technical lead + Follow Up lead
- **Doc reference:** `05-integration-contract-followup.md` §12

## 8. Phase 5 — Content

### T-501 — Write 6–8 surface lines across hook styles

- **Deliverable:** A set of candidate surface lines with matching clip briefs
- **Definition of Done:** Each line passes the content style guide checklist
- **Depends on:** None
- **Owner role:** Content lead
- **Doc reference:** `02-content-style-guide.md` §5

### T-502 — Produce 3–4 topic clips

- **Deliverable:** Finished videos, 60–90 seconds each, uploaded to Mux
- **Definition of Done:** Playback IDs stored in `clips`; each honors its surface's promise
- **Depends on:** T-501, T-004
- **Owner role:** Content lead
- **Doc reference:** `02-content-style-guide.md` §7

### T-503 — Produce the first season ad

- **Deliverable:** A 10–20 second warm invitation, uploaded to Mux
- **Definition of Done:** Row exists in `season_ads` with a valid active window
- **Depends on:** T-004, T-102
- **Owner role:** Content lead
- **Doc reference:** `02-content-style-guide.md` §8

### T-504 — Design the surface layout

- **Deliverable:** A print-ready design with text, QR, and Phaneroo name
- **Definition of Done:** Follows QR placement rules; passes content checklist
- **Depends on:** T-501, T-001
- **Owner role:** Design lead
- **Doc reference:** `02-content-style-guide.md` §6

## 9. Phase 6 — Pilot Launch

### T-601 — Print small pilot batch

- **Deliverable:** A small batch of surfaces using staging slugs
- **Definition of Done:** Codes scan correctly; text and QR are legible
- **Depends on:** T-504, T-204
- **Owner role:** Project owner
- **Doc reference:** `03-dev-stack-and-procedure.md` §15

### T-602 — Place pilot surfaces and monitor

- **Deliverable:** Surfaces placed; scan events monitored for 48 hours
- **Definition of Done:** Scan events appear in the database
- **Depends on:** T-601
- **Owner role:** Project owner
- **Doc reference:** `03-dev-stack-and-procedure.md` §15

### T-603 — Promote to production domains

- **Deliverable:** Redirect service and Hub live on production domains
- **Definition of Done:** End-to-end flow works with production slugs
- **Depends on:** T-602
- **Owner role:** Technical lead
- **Doc reference:** `03-dev-stack-and-procedure.md` §15

### T-604 — Print remaining pilot batch

- **Deliverable:** Remaining surfaces printed with production slugs
- **Definition of Done:** Placed and confirmed scanning
- **Depends on:** T-603
- **Owner role:** Project owner
- **Doc reference:** `03-dev-stack-and-procedure.md` §15

### T-605 — End-of-pilot review

- **Deliverable:** A written summary of scan rate, clip completion, next-step rate, and a decision
- **Definition of Done:** Decision recorded (expand, adjust, or stop) with rationale
- **Depends on:** T-604
- **Owner role:** Project owner + all leads
- **Doc reference:** `01-project-brief.md` §12

## 10. Dependency Overview

```
T-001 ─┐
T-002 ─┼─► T-101 ─► T-103 ─► T-201 ─► T-202 ─► T-204 ─┐
T-003 ─┼─► T-102 ─► T-103                            │
T-004 ─┼─► T-502, T-503                              │
T-005 ─┴─► T-301 ─► T-302 ─► T-304 ─► T-306 ────────┤
                    │      └─► T-305                 │
                    └─► T-303                         │
T-102 ─► T-401 ─► T-402 ─► T-403 ────────────────────┤
T-501 ─► T-502, T-504                                │
T-504 ─► T-601 ─► T-602 ─► T-603 ─► T-604 ─► T-605 ◄─┘
```

## 11. Open Items Requiring Decisions

Before certain tasks can begin, these must be resolved:

| Item | Blocks | Owner |
|:---|:---|:---|
| Confirm webhook endpoint URL | T-401 | Follow Up lead |
| Confirm API key exchange | T-401 | Technical lead |
| Confirm response-time promise | T-304 | Follow Up lead |
| Confirm alert channel | T-402 | Technical lead |
| Choose pilot surface (hotel or cups) | T-504, T-601 | Project owner |
| Choose temporary domain name | T-001 | Project owner |
| Confirm topic tags (final list) | T-104, T-501 | Content lead |
