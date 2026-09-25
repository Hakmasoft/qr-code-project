# Decision Log (ADR) — Soul Hub

## 1. Purpose

This document records decisions made about Soul Hub, when they were made, why, and what alternatives were rejected. It exists so that future contributors — human or agent — understand *why* things are the way they are before changing them.

Agents: do not "improve" a decision recorded here without an explicit instruction. If a decision needs revisiting, add a new entry; do not edit the old one.

## 2. Format

Each entry includes:

- **ID** — stable identifier (`ADR-001`, `ADR-002`, …)
- **Date** — when the decision was made
- **Status** — `Accepted`, `Superseded`, `Reversed`, `Proposed`
- **Decision** — what was decided, in one or two sentences
- **Context** — what prompted the decision
- **Rationale** — why this option was chosen
- **Alternatives rejected** — what else was considered and why it lost
- **Consequences** — what this locks in, and what it costs

Entries are newest-last. Superseded decisions keep their entry and reference the superseding ID.

## 3. Entries

---

### ADR-001 — Use a physical surface + QR code + Hub model

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The project places relatable text and a QR code on physical surfaces, linking to a digital Hub that serves a matched video clip and a next step.
- **Context:** Traditional materials (brochures, flyers) end the moment they are distributed. There is no way to know who engaged, and no mechanism to capture interest.
- **Rationale:** The two-layer design separates the moment of curiosity (surface) from the moment of depth (clip). It also produces measurable scan data, which brochures cannot.
- **Alternatives rejected:**
  - Brochures alone — no feedback loop, no next step
  - Static QR to a generic homepage — no context matching, weak conversion
  - App-based engagement — too much friction for a cold encounter
- **Consequences:** Requires a redirect service, a Hub, and a content pipeline. Locks in the "print the identifier, not the destination" principle.

---

### ADR-002 — Surfaces carry no explicitly religious vocabulary

- **Date:** 2026-09-22
- **Status:** Superseded by ADR-016
- **Decision:** Surface lines must be human, relatable, and free of religious vocabulary. The clip does the spiritual work.
- **Context:** Religious language triggers filtering before curiosity can work. A large share of scanners categorize the message as "religious material" and stop reading.
- **Rationale:** Recognition opens the door; persuasion can come later. A relatable line keeps attention for the two seconds needed to scan. The clip then makes the connection.
- **Alternatives rejected:**
  - Leading with scripture or doctrine on surfaces — filters out the audience before curiosity works
  - Leading with "church" or a denominational name — same filtering effect, weaker trust
  - Leading with a Bible verse — the person has no reason to care yet
- **Consequences:** The clip and season ad carry the entire spiritual payload. Surface and clip must be written as a pair. Superseded by ADR-016.

---

### ADR-003 — Use dynamic short links on a domain we control

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** Printed QR codes encode a short link on a domain we control. They never encode the final Hub URL or a third-party shortener.
- **Context:** Hub structure will change over time. Printed material cannot be reprinted every time a page moves. Third-party services can disappear or change terms.
- **Rationale:** A short link we own can be redirected anywhere by editing a database row. Printed material stays valid indefinitely. No dependency on an external service.
- **Alternatives rejected:**
  - Static QR encoding the final URL — breaks the moment the Hub changes
  - Third-party dynamic QR services — free tiers have scan limits; redirects can stop; dependency risk
  - Direct to `phaneroo.org` at pilot — we want to avoid coupling pilot material to the main domain
- **Consequences:** Requires operating a redirect service. Introduces a technical dependency we own. In return, printed material is future-proof.

---

### ADR-004 — Do not launch on public poles

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** Public poles are excluded from the pilot surface list.
- **Context:** Poles are public, anonymous, offer no dwell time, and in many municipalities are illegal to post on. Anonymous QR codes read as scams rather than invitations.
- **Rationale:** Scan rate is the make-or-break variable. Poles sit in the weakest category for trust and dwell time. Fines and removal create reputational risk.
- **Alternatives rejected:**
  - Poles as a cheap, high-volume surface — volume does not matter if scan rate is near zero
  - Poles with municipality permission — still weak on trust and dwell
- **Consequences:** The pilot focuses on hotel rooms or cups. Poles may be revisited later, with permission and a different design.

---

### ADR-005 — Pilot one surface, not many

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The pilot launches on a single surface type, with a small set of surface line variants.
- **Context:** Different surfaces perform very differently. Testing many at once produces data that cannot be attributed to any single variable.
- **Rationale:** One surface, several line variants, gives a clean read on what works. Expansion follows evidence.
- **Alternatives rejected:**
  - Launching on cups, hotel rooms, and cards simultaneously — confounds results, spreads effort thin
- **Consequences:** Slower visible spread at launch. Faster learning. A decision point at the end of the pilot.

---

### ADR-006 — Leave the response to the person

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The Hub offers clear next steps, but the project does not chase or pressure. If the person opts in, Follow Up engages.
- **Context:** Aggressive follow-up is both a staffing burden and a missiological mismatch with a sower-model approach.
- **Rationale:** Respects the person, scales infinitely, and removes a staffing bottleneck. Phaneroo's Follow Up department already exists to handle those who opt in.
- **Alternatives rejected:**
  - Mandatory contact capture before viewing — kills the moment, increases drop-off
  - Automated outreach to every scanner — no consent, high risk
  - No follow-up at all — wastes the Follow Up department's capacity
- **Consequences:** Success metrics focus on scan rate, clip completion, and opt-in rate, not on "contacts captured."

---

### ADR-007 — Use Cloudflare Workers + D1 for the redirect service

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The redirect service runs on Cloudflare Workers with D1 as its database.
- **Context:** The redirect must be instant. Scanners have near-zero patience. Free tiers must be adequate for a pilot.
- **Rationale:** Workers have no cold start, run at the edge, and offer 100k requests/day on the free tier. D1 binds directly to the Worker, avoiding a separate database service.
- **Alternatives rejected:**
  - Render free web service — spins down after 15 min idle; cold start kills redirect UX
  - Vercel Functions — no built-in database on free tier; requires an external DB
  - Traditional VPS — more operational overhead than the pilot needs
- **Consequences:** Locked into Cloudflare for this layer. Migration later is possible but non-trivial.

---

### ADR-008 — Use Next.js for the Hub

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The Hub is built with Next.js (App Router).
- **Context:** The Hub must load fast on mobile, be easy to iterate on, and support a headless CMS.
- **Rationale:** SSR/SSG out of the box, strong mobile performance, large ecosystem, and Vercel free tier is adequate to start.
- **Alternatives rejected:**
  - Plain static HTML — fast but hard to maintain as topics grow
  - WordPress — heavier, not mobile-first by default
  - Astro — good fit but smaller ecosystem for the form and CMS integrations needed
- **Consequences:** Hub deploys on Vercel. Content model decoupled via a headless CMS.

---

### ADR-009 — Use Mux for video hosting

- **Date:** 2026-09-22
- **Status:** Superseded by ADR-015
- **Decision:** Video clips and season ads are hosted on Mux.
- **Context:** Self-hosting video introduces bandwidth cost and operational complexity. Video is the core content of the Hub.
- **Rationale:** Mux handles encoding, delivery, and playback. Playback IDs are simple to store and embed. Cost scales with viewing minutes, which is manageable at pilot scale.
- **Alternatives rejected:**
  - Self-hosted video on object storage — higher bandwidth cost, worse experience, more maintenance
  - YouTube embeds — ads, branding, and analytics outside our control
  - Cloudflare Stream — viable alternative; Mux chosen for playback analytics and developer experience
- **Consequences:** Viewing-minute cost is the primary variable cost. Cost alerts are required. Fallback to object storage exists if costs spike. Superseded by ADR-015.

---

### ADR-010 — Use a temporary domain at pilot, not `phaneroo.org`

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The pilot uses a temporary domain we control. Migration to a `phaneroo.org` subdomain happens later.
- **Context:** The pilot may be adjusted or stopped. Coupling pilot material to the main domain creates cleanup work if the project changes direction.
- **Rationale:** A temporary domain keeps the pilot independent, lets us test without brand-side dependencies, and still gives us full control of the redirect chain.
- **Alternatives rejected:**
  - `phaneroo.org` from day one — harder to unwind, involves more stakeholders early
  - A third-party shortener — no control, terms may change
- **Consequences:** A domain purchase and DNS setup at pilot. Printed material at pilot uses the temporary domain; later material can use the permanent one.

---

### ADR-011 — Four fields maximum on the next-step form

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The next-step form collects Name, Contact (phone or email), Topic (optional), and Consent. No other visible fields.
- **Context:** Every additional field reduces completion. The purpose of the form is to open a conversation, not to collect a profile.
- **Rationale:** Four fields is the minimum needed for Follow Up to open a specific, personal conversation. Additional information can be gathered by the human.
- **Alternatives rejected:**
  - Longer intake form (age, location, how did you hear) — increases friction, reduces completion
  - Email-only form — cuts off the phone/WhatsApp channel, which is preferred in context
  - No form, contact info only — Follow Up cannot open with anything specific
- **Consequences:** Follow Up opens conversations with limited data. The topic tag is the key signal that makes the first contact feel personal.

---

### ADR-012 — Handoff to Follow Up via webhook, with CSV fallback

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** Form submissions are pushed to Follow Up via webhook if an endpoint exists; otherwise via scheduled CSV export with manual import.
- **Context:** Deep API integration with Phaneroo's Team Member / Supervisor apps is out of scope for MVP. Volume is unknown until the pilot runs.
- **Rationale:** A webhook is simple, testable, and sufficient. The CSV fallback ensures the pilot is not blocked on API availability.
- **Alternatives rejected:**
  - Deep API integration at MVP — premature; validates nothing the pilot needs
  - Manual-only handoff — does not scale even modestly, and creates lag
  - No handoff — wastes the Follow Up department's capacity
- **Consequences:** A scheduled worker and retry/alerting are required. The contract in `05-integration-contract-followup.md` governs the payload.

---

### ADR-013 — Clips are evergreen; season ads rotate

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** Topic clips are produced once and reused. The season ad rotates independently, via the database, without reshooting clips.
- **Context:** Reshooting clips every season is expensive. The clip's job is to answer the surface's promise; the ad's job is to make a current invitation.
- **Rationale:** Separating the two content streams means one shoot serves many seasons. The Hub stays current without heavy production.
- **Alternatives rejected:**
  - One combined clip including the current invitation — forces reshoots each season
  - No season ad — loses the concrete, timely next step
- **Consequences:** Two content streams must be managed. The Hub queries for the active season ad at render time.

---

### ADR-014 — Topic tags are a controlled list of four

- **Date:** 2026-09-22
- **Status:** Accepted
- **Decision:** The `topic` field draws from a controlled list of four tags: `peace`, `purpose`, `identity`, `hope`.
- **Context:** Topic tags appear in `slugs`, `clips`, and `form_submissions`. Uncontrolled tags break matching and reporting.
- **Rationale:** Four tags cover the pilot's content and keep matching simple. Adding a tag is a deliberate decision, not an accident.
- **Alternatives rejected:**
  - Free-text topics — breaks matching and reporting
  - Ten+ tags — too many for a pilot, fragments content production
  - One tag — no useful segmentation
- **Consequences:** Adding a tag requires a Decision Log entry and a new clip. Every slug must map to exactly one tag.

---

### ADR-015 — Use TikTok for clip hosting, embedded on the Hub

- **Date:** 2026-09-23
- **Status:** Superseded by ADR-018
- **Decision:** Clips and season ads are hosted on TikTok and embedded on the Hub via TikTok's embed player. The Hub remains the conversion point. Users are not redirected away from the Hub to TikTok.
- **Context:** Mux bills per viewing minute, which is the single largest variable cost in the project. TikTok hosts short-form video for free, matches the content format natively, and can distribute clips through its algorithm as a secondary channel. The original Mux decision was made before the pilot's cost sensitivity was fully understood.
- **Rationale:**
  - Removes the largest variable cost (video viewing minutes)
  - TikTok's format matches the content style (60–90 second vertical clips)
  - The algorithm can extend reach beyond people who scan a QR code
  - Embedding keeps the user on the Hub, preserving the form and Follow Up handoff
- **Alternatives rejected:**
  - Mux — cost scales with viewing minutes; no distribution benefit
  - Self-hosted video — bandwidth cost, operational complexity, no distribution benefit
  - Direct redirect to TikTok — loses the form, loses contact capture, loses Follow Up handoff
  - YouTube — ads, branding, weaker fit for short-form vertical
- **Consequences:**
  - Video hosting cost drops to zero at pilot scale
  - The project depends on TikTok's embed availability and terms; a fallback may be needed later
  - `clips.video_url` and `season_ads.video_url` store TikTok video IDs or URLs, not Mux playback IDs
  - Clip analytics come from TikTok, not from a Mux dashboard
  - The Hub must embed, not redirect. This is a hard rule. Superseded by ADR-018.

---

### ADR-016 — Surfaces may carry scripture, chosen deliberately

- **Date:** 2026-09-23
- **Status:** Accepted
- **Decision:** Surfaces may carry scripture or religious reference. It is not banned. The choice is deliberate — fitted to the surface, the moment, and the person it is meant to reach.
- **Context:** ADR-002 originally banned religious vocabulary on surfaces to avoid triggering filtering before curiosity could work. After review, the team decided this was too restrictive. A scriptural line, placed with intention, can minister to the person it is meant to reach in a way a purely human line may not. The filtering concern is real, but prohibition is not the right response to it.
- **Rationale:**
  - The filtering concern remains valid, but it argues for deliberation, not prohibition
  - A specific, chosen scriptural line lands harder than a generic religious phrase
  - A human line still opens the door wider for some surfaces and moments
  - The team trusts that a line chosen with care will reach the person it is meant for
- **Alternatives rejected:**
  - Keeping the full ban (ADR-002) — too restrictive; removes a legitimate tool
  - Allowing scripture by default — loses the discipline that made the earlier rule work
  - Allowing only "soft" religious language — arbitrary and hard to enforce
- **Consequences:**
  - The rule shifts from "banned" to "deliberate"
  - Surface lines may be human, scriptural, or a blend
  - The content style guide now provides guidance rather than prohibition
  - The clip still does the deeper spiritual work, regardless of the surface line's nature
  - Surface and clip remain paired; the clip must honor whatever promise the surface makes

---

### ADR-017 — Use `ctx.waitUntil()` for fire-and-forget writes in Cloudflare Workers

- **Date:** 2026-09-23
- **Status:** Accepted
- **Decision:** Any async write that must complete but should not block the response — such as logging a scan event — must be wrapped in `ctx.waitUntil()`. Bare `.run()` calls without `waitUntil` are not permitted.
- **Context:** During pilot development, the redirect worked correctly but scan events were not being written to D1. The insert used a fire-and-forget pattern (`.run().catch(...)`) with no `waitUntil`. The Worker returned its 302 response, and the Cloudflare runtime terminated the execution context before the D1 write completed. The error was silently swallowed by the `.catch()`, making the bug invisible in logs.
- **Rationale:**
  - Cloudflare Workers terminate pending async work when the response is returned, unless the work is registered with `ctx.waitUntil()`
  - Fire-and-forget without `waitUntil` is unreliable by design, not by accident
  - The silent catch hid the failure; making failures visible is not enough if the promise itself is cancelled
- **Alternatives rejected:**
  - Awaiting the write before returning the response — adds latency to every redirect, which is unacceptable for a QR scan
  - Fire-and-forget without `waitUntil` — proven unreliable; the original bug
  - Logging via an external queue — overkill at pilot scale
- **Consequences:**
  - The Worker signature must include `ctx` as the third argument to `fetch`: `async fetch(request, env, ctx)`
  - All non-blocking writes must be wrapped: `ctx.waitUntil(promise)`
  - The same pattern applies to the Hub's form submission and to the handoff worker
  - This becomes a coding convention for the project, not just a fix for one bug
  - Error handling inside the wrapped promise should log visibly, not swallow silently

---

### ADR-018 — Use YouTube for clip hosting, embedded on the Hub

- **Date:** 2026-09-25
- **Status:** Accepted
- **Decision:** Clips are hosted on YouTube and embedded on the Hub using the YouTube IFrame API. The Hub remains the conversion point. Users are not redirected away from the Hub to YouTube.
- **Context:** ADR-015 chose TikTok for free hosting and algorithmic reach. In practice, TikTok's embed imposed too much of its own branding and UI — "For You" prompts, app-directed CTAs, and a visual style that fought the calm, warm design of the Hub. TikTok's embed also does not expose a reliable "video ended" event, which the season-ad overlay depends on. YouTube provides a cleaner player, a proper `onStateChange` event with `ENDED`, and Phaneroo's clips are already hosted there.
- **Rationale:**
  - YouTube's IFrame API exposes `onStateChange`, which fires `ENDED` when the clip finishes — this is what makes the automatic season-ad overlay possible
  - The player is far more controllable (`controls=0`, `modestbranding=1`, `rel=0`, `playsinline=1`)
  - Phaneroo already has an existing library of clips on YouTube
  - Cost remains zero at pilot scale
- **Alternatives rejected:**
  - TikTok — visual chrome fights the design, no `ENDED` event, weaker player control
  - Mux — cost scales with viewing minutes; no distribution benefit
  - Self-hosted video on GitHub — GitHub is not a CDN; repo bloat; terms-of-service risk
  - Vimeo Free — 1 GB lifetime cap; works but adds a platform without advantage over YouTube
  - Cloudflare Stream — viable paid option; deferred until the pilot proves the concept
- **Consequences:**
  - Video hosting cost remains zero at pilot scale
  - The Hub depends on YouTube's embed availability and terms
  - `clips.video_url` and `season_ads.video_url` store YouTube video IDs or URLs
  - The Hub uses the YouTube IFrame API and loads `https://www.youtube.com/iframe_api`
  - Clip analytics come from YouTube Studio
  - The Hub must embed, not redirect. This is a hard rule.
  - Migration to Cloudflare Stream or another host later is a one-line change per video

---

## 4. Superseded and Reversed Decisions

| ID | Status | Superseded by |
|:---|:---|:---|
| ADR-009 | Superseded | ADR-015 |
| ADR-002 | Superseded | ADR-016 |
| ADR-015 | Superseded | ADR-018 |

## 5. Proposed Decisions

Decisions under discussion but not yet accepted. Move to §3 when accepted.

| ID | Topic | Status | Owner |
|:---|:---|:---|:---|
| | | | |