# Runbook / Operations Guide — Soul Hub

## 1. Purpose

This document describes how to operate Soul Hub after launch. It covers routine tasks, common failures, and who to contact. It is written for whoever is on duty — technical lead, Follow Up lead, or project owner.

If a procedure here is wrong or missing, update this document. An operation that is not written down is an operation that will fail the first time it is needed.

## 2. Roles and Contacts

| Role | Responsibility | Contact |
|:---|:---|:---|
| Project owner | Overall direction, decisions | *(to be filled)* |
| Technical lead | Redirect, Hub, database, handoff | *(to be filled)* |
| Content lead | Surface lines, clips, season ads | *(to be filled)* |
| Follow Up lead | Intake, response flow, capacity | *(to be filled)* |
| Design lead | Surface layout, Hub UI | *(to be filled)* |

Escalation: technical issues → technical lead. Follow Up issues → Follow Up lead. Content issues → content lead. Anything unresolved → project owner.

## 3. Daily Checks

| Check | Where | Frequency | Action if abnormal |
|:---|:---|:---|:---|
| Redirect service is up | Cloudflare dashboard | Daily | See §6 |
| Scan events are being logged | Database query | Daily | See §7 |
| Pending submissions are being picked up | `form_submissions` query | Daily | See §8 |
| Failed handoffs | `form_submissions` where `handoff_status = 'failed'` | Daily | See §8 |
| Embedded TikTok video plays | Open a topic page on a phone | Weekly | See §9 |
| Season ad is current | `season_ads` where `active = true` | Weekly | See §10 |

## 4. Routine Tasks

### 4.1 Add a new surface code

1. Decide the slug (e.g. `peace-02`). Slug must be lowercase, kebab-case, and never change once printed.
2. Insert a row into `slugs`:
   - `slug` = the new code
   - `destination` = the current Hub topic URL
   - `surface_source` = the batch name
   - `topic` = one of the four controlled tags
   - `active` = `true`
3. Verify the slug redirects correctly in staging before printing.
4. Print the material with the slug. Do not print the destination URL.

### 4.2 Change a redirect destination

1. Find the slug row in `slugs`.
2. Update `destination` and `updated_at`.
3. Do not change the `slug` value.
4. Verify the redirect in staging, then production.
5. No reprint is needed.

### 4.3 Deactivate a slug

1. Set `active = false` on the slug row.
2. The slug will now redirect to the fallback page instead of its destination.
3. Never delete a slug row while its surface may still be in circulation.

### 4.4 Rotate the season ad

1. Deactivate the current `season_ads` row (`active = false`).
2. Insert a new row with:
   - `title`, `video_url`, `invitation_copy`
   - `active_from` and `active_until`
   - `active = true`
3. Verify only one row is active.
4. Open a topic page on a phone and confirm the new ad appears.
5. No redeploy is needed.

### 4.5 Add a new topic tag

1. Requires a Decision Log entry first.
2. Produce a clip for the topic and upload it to TikTok.
3. Add the tag to the form dropdown and to the content style guide.
4. Insert the clip row with `active = true`.
5. Assign at least one slug to the new tag.

### 4.6 Review scan data

1. Query `scan_events` grouped by `slug` and `surface_source`.
2. Compare against placement period to compute scan rate.
3. Record results in the pilot tracking sheet.
4. Flag any slug with zero scans after 7 days of placement.

## 5. Metrics and Where to Find Them

| Metric | Source | Query basis |
|:---|:---|:---|
| Scan rate | `scan_events` + placement log | Count per slug ÷ surfaces printed |
| Clip completion | TikTok dashboard | Per video |
| Next-step rate | `form_submissions` | Count ÷ scan events |
| Handoff success rate | `form_submissions.handoff_status` | `sent` ÷ total |
| Follow Up response time | Follow Up records | Time from handoff to first contact |

Review weekly during the pilot. A written summary is due at the end of the pilot.

## 6. Failure: Redirect Service Down

**Symptoms:** Scans do not redirect. Scan events stop appearing.

**Steps:**
1. Check the Cloudflare Workers dashboard for errors.
2. Check the D1 database binding is intact.
3. Check recent deployments for a broken release.
4. If a bad release, roll back to the last known good deployment.
5. If the issue persists, publish a static fallback page on the same domain pointing to the Hub, and notify the technical lead.

**Prevention:** Monitor Worker error rate. Keep the redirect logic minimal — no dependencies that can fail.

## 7. Failure: Scan Events Not Logging

**Symptoms:** Redirects work but `scan_events` is empty or lagging.

**Steps:**
1. Confirm the logging write is not blocking the redirect (it should fire-and-forget).
2. Check the D1 write quota.
3. Check for schema drift — has the `scan_events` table changed without a migration?
4. If the write path is broken, fix and redeploy. Accept that scans during the outage are lost.

**Prevention:** Add an alert when no scan events are recorded for a defined interval during active placement.

## 8. Failure: Handoff Not Delivering

**Symptoms:** `form_submissions` rows stuck at `handoff_status = 'pending'`, or set to `failed`.

**Steps:**
1. Check the handoff worker is running (scheduled job).
2. Check the Follow Up endpoint is reachable.
3. Check authentication — has the API key rotated?
4. Check the payload — has a field changed without a contract update?
5. Retry manually for `failed` rows once the cause is fixed.
6. Notify the Follow Up lead of any submissions that were delayed.

**Prevention:** Daily check of `pending` and `failed` counts. Alert on any `failed` row.

## 9. Failure: Video Not Playing

**Symptoms:** Topic page loads but the embedded TikTok clip or season ad does not play.

**Steps:**
1. Confirm the TikTok video still exists and is public.
2. Confirm the URL stored in the `clips` or `season_ads` row matches the live TikTok video.
3. Confirm the Hub is embedding, not redirecting. If a recent change introduced a redirect, revert it. This is a hard rule.
4. If TikTok's embed is unavailable, confirm the fallback message and season ad text render on the Hub.
5. If the TikTok account is restricted or a video is removed, re-upload to TikTok and update the stored URL.

**Prevention:** Weekly check of embedded playback on a real phone. Confirm TikTok videos remain public and reachable.

## 10. Failure: No Active Season Ad

**Symptoms:** Topic page shows no season ad, or shows an outdated one.

**Steps:**
1. Query `season_ads` for rows where `active = true` and `now()` is within the active window.
2. If none, activate the correct row or insert a new one.
3. If more than one is active, deactivate all but the intended one.
4. Confirm on a phone.

**Prevention:** Calendar reminder before each ad window ends.

## 11. Failure: Form Not Submitting

**Symptoms:** Users report the form does not submit, or submissions are missing.

**Steps:**
1. Check the Supabase project status.
2. Check the form's network requests in a browser.
3. Check for a schema drift in `form_submissions`.
4. Check for rate limiting or abuse protection triggering falsely.
5. If the form is broken, publish a temporary contact method on the Hub (email or phone) and notify the technical lead.

**Prevention:** Test the form end to end before each campaign push.

## 12. Failure: External Scrutiny Spike

**Symptoms:** A sudden increase in traffic to the Hub from search or social, possibly critical.

**Steps:**
1. Confirm the Hub is loading normally under load.
2. Confirm the season ad and contact form work.
3. Notify the project owner.
4. Do not engage in debate on the Hub itself. The Hub's job is to welcome, not to argue.

**Prevention:** The Hub's content is warm, clear, and self-contained, so first impressions are strong before any external search happens.

## 13. Cost Monitoring

| Cost | Source | Threshold | Action at threshold |
|:---|:---|:---|:---|
| TikTok | Not applicable at pilot | None | Video hosting is free at pilot scale |
| Database usage | Supabase dashboard | Set near free-tier limit | Review queries, archive old rows |
| Worker requests | Cloudflare dashboard | Free tier ceiling | Confirm pilot scale, upgrade if justified |
| Domain renewal | Registrar | 30 days before expiry | Renew |

Review costs monthly during the pilot.

## 14. Backup and Restore

| Asset | Backup method | Frequency |
|:---|:---|:---|
| `slugs` table | D1 export | Weekly |
| `scan_events` | D1 export | Weekly |
| `form_submissions` | Supabase backup | Daily |
| `clips`, `season_ads` | Supabase backup | Weekly |
| Source video files | Local or cloud storage, not in repo | On upload |
| Surface designs | Repo or shared drive | On change |

Restore procedure: restore the most recent backup to a staging environment, verify, then promote. Never restore directly to production without verification.

## 15. End-of-Pilot Procedure

1. Stop placement of new surfaces.
2. Let existing scans run for the agreed period.
3. Export all data: scans, submissions, handoff statuses.
4. Compute metrics per §5.
5. Write the end-of-pilot summary.
6. Record the decision (expand, adjust, or stop) in the Decision Log.
7. Archive or deactivate slugs no longer in circulation.

## 16. Escalation Matrix

| Situation | First contact | Response expectation |
|:---|:---|:---|
| Redirect down | Technical lead | Immediate |
| Scan logging broken | Technical lead | Same day |
| Handoff failing | Technical lead + Follow Up lead | Same day |
| Video not playing | Technical lead | Same day |
| Form broken | Technical lead | Immediate |
| Season ad missing | Content lead | Same day |
| External scrutiny | Project owner | Immediate |
| Cost threshold hit | Technical lead | Same day |

## 17. Change Log

Track operational changes here, newest first.

| Date | Change | Author |
|:---|:---|:---|
| | Initial runbook | |