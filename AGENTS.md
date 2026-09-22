# Agent Instructions / Context File — Soul Hub

## 1. What This File Is

This is the entry point for any AI agent working on Soul Hub. Read this file at the start of every session before doing any work. It contains the minimum context needed to act correctly.

For deeper detail, this file points to the other documents in `docs/`. Do not assume — read them.

## 2. Project Summary

Soul Hub places relatable, non-religious messages on physical surfaces (cups, hotel rooms) with a QR code. Scanning the code opens a short video clip matched to the surface text, followed by a warm invitation to a current Phaneroo event, followed by a simple next-step form. Form submissions are handed off to Phaneroo's Follow Up department.

The core design principle: **the surface determines the response.** Everything downstream depends on whether one printed line makes someone stop and scan.

See `docs/01-project-brief.md` for the full picture.

## 3. Repository Layout

```
soul-hub/
├── docs/                      # All project documentation
├── redirect/                  # Cloudflare Worker (short link + scan logging)
├── hub/                       # Next.js Hub application
├── migrations/                # Database migration files
├── scripts/                   # Handoff worker, exports, maintenance
└── AGENTS.md                  # This file
```

## 4. Stack Summary

| Layer | Technology |
|:---|:---|
| Redirect service | Cloudflare Workers |
| Redirect database | Cloudflare D1 |
| Hub | Next.js (App Router) |
| Hub CMS | Sanity or Strapi 5 |
| Hub database | Supabase (Postgres) |
| Video hosting | Mux |
| Hub deployment | Vercel |
| Redirect deployment | Wrangler |

Full detail in `docs/03-dev-stack-and-procedure.md`.

## 5. Commands

### Redirect service
```
cd redirect
npm install
npm run dev          # local Worker
npm run deploy       # deploy to Cloudflare
```

### Hub
```
cd hub
npm install
npm run dev          # local dev server
npm run build        # production build
npm run lint         # lint
npm test             # tests
```

### Migrations
```
npm run migrate:local
npm run migrate:staging
npm run migrate:production
```

### Handoff worker
```
cd scripts
npm run handoff:once     # process pending submissions once
npm run handoff:watch    # run on schedule
```

## 6. Hard Rules

These rules are non-negotiable. Violating any of them will break printed material, lose submissions, or violate privacy.

1. **Never hardcode a destination URL in the redirect service.** All destinations live in the `slugs` table.
2. **Never print or encode a third-party domain** (bit.ly, qrco.de, etc.). Only domains we control.
3. **Never modify the `slugs` or `form_submissions` schema without a migration file.**
4. **Never store raw IP addresses.** Hash before persisting.
5. **Never return a 404 from a slug route.** Always redirect to the fallback.
6. **Never autoplay audio on the Hub.**
7. **Never add a fifth field to the form** without a Decision Log entry.
8. **Never delete a `slug` row** while its surface may be in circulation. Deactivate instead.
9. **Never change the handoff payload** without updating `docs/05-integration-contract-followup.md` and getting agreement from the Follow Up lead.
10. **Never commit `.env` files or secrets.**

## 7. Content Rules (Summary)

Applies to any agent generating surface lines, clip scripts, or Hub copy.

- **Surfaces carry no religious vocabulary.** Banned: God, Jesus, Christ, Lord, Savior, salvation, sin, repent, church, gospel, Bible, verse, faith, holy, worship, prayer, preach.
- **Surface lines are human, relatable, specific, unresolved.** One to two lines. Readable in two seconds.
- **The clip does the spiritual work.** It must honor the surface's promise within the first 15 seconds.
- **The season ad is warm, specific, and current.** 10–20 seconds.
- **Surface and clip are written as a pair.** Never one without the other.

Full detail in `docs/02-content-style-guide.md`.

## 8. Where to Find Things

| Need | Read |
|:---|:---|
| What the project is and why | `docs/01-project-brief.md` |
| How to write surface/clip/ad content | `docs/02-content-style-guide.md` |
| Stack, architecture, build steps | `docs/03-dev-stack-and-procedure.md` |
| Table and field definitions | `docs/04-data-dictionary.md` |
| What to send to Follow Up | `docs/05-integration-contract-followup.md` |
| Work to be done | `docs/07-task-breakdown.md` |
| Why decisions were made | `docs/08-decision-log.md` |
| Post-launch operations | `docs/09-runbook.md` |

## 9. Conventions

- File names: lowercase, kebab-case
- Commits: imperative mood ("Add slug lookup", not "Added")
- One responsibility per module
- No secrets in code
- Migrations are versioned and applied to staging before production

## 10. Before You Start Work

1. Read this file.
2. Read the relevant doc for the task.
3. Check `docs/07-task-breakdown.md` for the scope of the task.
4. Check `docs/08-decision-log.md` for decisions that affect the task.
5. If a decision is not recorded and the task requires one, stop and ask. Do not invent.

## 11. What Not to Do

- Do not add features outside the task's scope.
- Do not "improve" decisions recorded in the Decision Log without an explicit instruction.
- Do not rename tables, fields, or files without a migration and a Decision Log entry.
- Do not add dependencies without noting them.
- Do not assume context from a previous session. Everything needed is in `docs/`.

## 12. Keeping This File Current

Update this file when:

- The stack changes
- Commands change
- Hard rules change
- New documents are added to `docs/`
- The repository layout changes

Keep it short. If a detail belongs in another doc, point to that doc instead of duplicating it here.