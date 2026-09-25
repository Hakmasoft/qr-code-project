# Soul Hub

Soul Hub places relatable messages on everyday physical surfaces — cups, hotel rooms, cards — each paired with a QR code. Scanning the code opens a short video clip matched to the surface text, followed by a warm invitation to a current Phaneroo event, followed by a simple next-step form. Form submissions are handed off to Phaneroo's Follow Up department.

The core design principle: **the surface determines the response.** Everything downstream depends on whether one printed line makes someone stop and scan.

## How It Works

```
Physical Surface (text + QR)
        |
        v
Short Link  ->  scan.<domain>/c/[slug]
        |
        v
Redirect Service (looks up slug, logs scan event)
        |
        v
Hub  ->  matched clip (embedded from TikTok)  ->  season ad  ->  next-step form
        |
        v
Follow Up (handoff via webhook or manual import)
```

The QR code never encodes the final Hub URL. It encodes a short link on a domain we control, so printed material stays valid when the Hub changes.

## Repository Layout

```
soul-hub/
├── docs/                      # All project documentation
├── redirect/                  # Cloudflare Worker (short link + scan logging)
├── hub/                       # Next.js Hub application
├── migrations/                # Database migration files
├── scripts/                   # Handoff worker, exports, maintenance
├── AGENTS.md                  # Agent instructions / context file
└── README.md                  # This file
```

## Stack

| Layer | Technology |
|:---|:---|
| Redirect service | Cloudflare Workers |
| Redirect database | Cloudflare D1 |
| Hub | Next.js (App Router) |
| Hub CMS | Sanity or Strapi 5 |
| Hub database | Supabase (Postgres) |
| Video hosting | YouTube (embedded on Hub) |
| Hub deployment | Vercel |
| Redirect deployment | Wrangler |

## Documentation

Read these in order. `06-agent-instructions.md` is the entry point for any contributor or agent starting work.

| Document | Purpose |
|:---|:---|
| `docs/01-project-brief.md` | What the project is, why it exists, goals, scope |
| `docs/02-content-style-guide.md` | Rules for surface lines, clips, season ads, Hub copy |
| `docs/03-dev-stack-and-procedure.md` | Stack, architecture, data model, build steps |
| `docs/04-data-dictionary.md` | Every table and field defined |
| `docs/05-integration-contract-followup.md` | What is sent to Follow Up, and how |
| `docs/06-agent-instructions.md` | Context and rules for contributors and agents |
| `docs/07-task-breakdown.md` | Discrete work items for the pilot |
| `docs/08-decision-log.md` | Why decisions were made, and what was rejected |
| `docs/09-runbook.md` | Post-launch operations and failure handling |

## Getting Started

See `docs/03-dev-stack-and-procedure.md` §10 for full setup. Short version:

```
# Redirect service
cd redirect
npm install
npm run dev

# Hub
cd hub
npm install
npm run dev
```

Environment variables are documented in `docs/03-dev-stack-and-procedure.md` §10. Never commit `.env` files.

## Hard Rules

These are non-negotiable. Violating any of them will break printed material, lose submissions, or violate privacy.

1. Never hardcode a destination URL in the redirect service. All destinations live in the `slugs` table.
2. Never print or encode a third-party domain. Only domains we control.
3. Never modify the `slugs` or `form_submissions` schema without a migration file.
4. Never store raw IP addresses. Hash before persisting.
5. Never return a 404 from a slug route. Always redirect to the fallback.
6. Never autoplay audio on the Hub.
7. Never add a fifth field to the form without a Decision Log entry.
8. Never delete a `slug` row while its surface may still be in circulation. Deactivate instead.
9. Never change the handoff payload without updating the integration contract.
10. Never commit `.env` files or secrets.
11. Never redirect a user off the Hub to YouTube. Clips are embedded, not linked out.

## Content Rules (Summary)

- Surface lines are human, relatable, specific, and unresolved. One to two lines, readable in two seconds.
- Surfaces may carry scripture or religious reference. It is not banned. The choice is deliberate — fitted to the surface, the moment, and the person it is meant to reach.
- Choose on purpose, not by default. A specific, chosen line lands harder than a generic one, whether human or scriptural.
- The clip does the deeper spiritual work, and must honor the surface's promise within the first 15 seconds.
- The season ad is warm, specific, and current. 10 to 20 seconds.
- Surface and clip are written as a pair. Never one without the other.

Full detail in `docs/02-content-style-guide.md`.

## Status

Pilot stage. Not yet launched.

Before the pilot can begin, three open items must be resolved:

- Follow Up webhook endpoint and API key exchange
- Response-time promise shown on the confirmation screen
- Pilot surface choice (hotel rooms or cups)

See `docs/07-task-breakdown.md` §11 for the full list of open items.

## Contributing

1. Read `docs/06-agent-instructions.md`.
2. Read the relevant document for the task.
3. Check `docs/07-task-breakdown.md` for scope.
4. Check `docs/08-decision-log.md` for decisions affecting the task.
5. If a decision is not recorded and the task requires one, stop and ask.

## License

*(to be decided)*
