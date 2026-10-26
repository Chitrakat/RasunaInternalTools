# 1. Caregiver ↔ Client (Senior) Matching System

Status: 🟡 Direction decided; workbook profiled; spreadsheet identity and remaining workflow decisions pending (updated 2026-10-26)

Related: dashboard/tasks are in [05-dashboard-and-tasks.md](05-dashboard-and-tasks.md).

## Confirmed Facts (from client)
- Match criteria so far: distance, language, availability, previous caregiver experience.
- Experience is a plain yes/no, used as a filter only (no ranking).
- Language is a preference only (not a hard requirement); a person can speak multiple languages, and more matches is better.
- Distance: client zip to caregiver zip, honoring each caregiver's own travel radius.
- Availability is days and shifts (to be confirmed).
- HCA lifecycle: applicants start in `HCA APPLICANTS`, move to `READY TO WORK HCA` while ready and waiting for a client, then appear in `ACTIVE EMPLOYEES` when matched with a client.
- HCA applicants do not need an Employee ID. Ready-to-work HCAs have an Employee ID; active employees have an ID based on their document-folder number. Confirm whether the ready-stage Employee ID and active folder number are the same identifier before using them as a cross-tab key.
- `CLIENT PIPELINE` tracks clients waiting for CCU.
- Clients need a unique, stable ID. The current `SN` field is not yet confirmed as that identifier.
- `DAILY FOLLOW-UP` is a log of notes/events. Actions and follow-up notes accumulate in the row; assignment history is currently only buried in old working notes, with no dedicated history.
- Staff want a structured caregiver-client assignment history in the new tool.
- No privacy/HIPAA obligations; no health info or SSNs in the data (still avoid storing anything sensitive we don't need).
- Client will own and pay for the hosting accounts.
- The workbook is `template/RASUNA Master Operations.xlsx`. Its tabs are `DASHBOARD`, `DAILY FOLLOW-UP`, `CLIENT PIPELINE`, `ACTIVE EMPLOYEES`, `READY TO WORK HCA`, `HCA APPLICANTS`, and `Archive`.
- The workbook has separate tabs for stages of the HCA process, a client pipeline and archive, and follow-ups; it does not have a dedicated assignments tab or a separate approved-clients tab.
- 3 staff now, growth planned; mid-low technical comfort.

## Problem

Client currently matches caregivers to seniors manually:
- Search is by zip code, then manually check "nearby" zip codes.
- No consideration of other match criteria in the tool itself (language, availability, care needs, etc. — currently done ad hoc in someone's head).
- Slow and error-prone; doesn't scale as the caregiver/client lists grow.

## Goal

A small internal web tool that lets staff search/filter for the best caregiver-client matches based on structured criteria instead of manual zip-code scanning.

## Proposed Approach

- Store data in managed Postgres. Staff never see SQL; they use the app. Pitch it as "your spreadsheet, but searchable, with a real dashboard", not a new system.
- **Hosting decision: Supabase** (Postgres + Auth + spreadsheet-like Table Editor + PostGIS + row-level security, one vendor, resolves doc 2). Neon/Vercel Postgres (now Neon) are DB-only and would need a separate auth vendor.
  - Caveats: free tier pauses after inactivity and has no real backups, so use a paid plan in production. HIPAA is not a concern per the client, so the standard paid plan is enough.
  - Fallback if Supabase is rejected: choose a database and compatible managed auth provider together; do not select Neon + Auth.js by default.
- **Migration rule:** Excel is a one-time import source and temporary parallel-check only. Avoid two-way sync; two live sources of truth will drift.
- **Proposed rollout:** confirm workflows and map data first; build a safe, repeatable import; then deliver core records/statuses/tasks, matching, and dashboard; cut over only after staff validation. See the ordered execution plan below.
- **Proposed entities (validate before schema work):**
  - `caregivers`: one person record across applicant → ready/waiting → active/matched stages; identity/contact, ZIP, availability, experience, language, travel preferences, source, and notes. Applicants have no Employee ID; decide how to link their applicant record when they move to ready-to-work. Confirm whether the ready-stage Employee ID is the active folder number.
  - `clients`: assign a unique, immutable client ID and retain it through pipeline/archive transitions; preserve the current `SN` as a legacy field until verified. Also store identity/contact, ZIP/city, referral and insurance details, case-manager details, lifecycle status, owner, and notes.
  - `assignments`: create a structured record whenever a caregiver is matched to a client, with dates/status and audit history. Historical assignments may be reconstructed from old working notes only when staff can verify the relationship and dates; preserve unparsed notes as notes.
  - `activity`: append-only dated notes/events linked to a client/caregiver where staff can identify the subject. `DAILY FOLLOW-UP` is primarily event history, not a set of tasks; see doc 5.
  - `tasks`: separate actionable follow-ups with an owner and due date; do not automatically convert every activity note into a task.
- Matching logic:
  - Geocode zip codes to lat/lng once (on save), then query by distance (`ST_DWithin` in PostGIS, or a simple haversine formula in plain SQL/JS) instead of string-matching nearby zips.
  - Apply confirmed hard eligibility filters (distance within the caregiver's own travel limit and availability overlap, once defined); treat language as a preference, not a hard filter. Experience is a yes/no filter, not a ranking factor. Explain match reasons in the results.
- UI: a search/filter page — pick a client (or enter ad hoc criteria), see ranked list of eligible caregivers with distance, language, availability shown; maybe a manual "assign" action that records the match.

## Workbook Inventory (first-pass, no personal records)

| Workbook tab | Header-level contents | Initial interpretation / migration note |
|---|---|---|
| `CLIENT PIPELINE` | Client identity/contact, city/ZIP, insurance/MCO, CCU, client status/date, case managers, referral source, owner, next follow-up, note | Clients waiting for CCU; confirm later stages, status meanings, and identity keys. |
| `Archive` | Same client/referral fields as `CLIENT PIPELINE` | Likely closed/archived client records, but confirm whether rows move, copy, or represent history. |
| `HCA APPLICANTS` | Name, phone, email, ZIP/Area, experience, employment status/date, paperwork/ID, note | First HCA stage: new applicants. |
| `READY TO WORK HCA` | Employee ID, name, phone, ZIP/Area, availability, experience, employment status, owner, note | HCA is ready and waiting to be matched with a client; has an Employee ID. |
| `ACTIVE EMPLOYEES` | Employee ID, name, availability, employment status, TTP, owner, note | HCA has been matched with a client; the ID is based on their document-folder number. Confirm it matches the ready-stage Employee ID. |
| `DAILY FOLLOW-UP` | Date, type, name, action/note, owner, due/follow-up, status, result/follow-up note | Event/note log where notes accumulate; only explicitly actionable follow-ups should become tasks. |
| `DASHBOARD` | Counts for client/HCA pipeline, readiness, follow-ups, missing setup data, and ownership notes | Rebuild as app queries after definitions are confirmed; two client metrics contain broken `#REF!` references. |

This is a column inventory, not a finalized schema. It intentionally excludes workbook row values and personal information.

## Anonymized Data Profile (2026-10-19)

Counts below use non-empty name/record keys and status categories only; no names, contact details, or notes were output.

- `CLIENT PIPELINE`: 36 named rows; 34 have status `Referral Sent to CCU`, 1 `Interested`, and 1 has no status.
- `Archive`: 54 named rows, but only 29 have an SN value; all 29 IDs also occur in `CLIENT PIPELINE`. The other 25 rows need identity review before import or deduplication.
- HCA rows: 116 applicants; 24 `READY TO WORK HCA` records (23 have an Employee ID); 57 active-employee records (all have an Employee ID). Only 1 Employee ID overlaps between the ready and active tabs, so do not assume IDs currently link the same person across stages.
- HCA status values also need reconciliation with the stage descriptions: applicant statuses are `Applied`/`Interested`; 19 of the 24 ready-tab rows have no employment status (the other values include `Ready to Work`, `Onboarding / Training`, and `Paperwork In Progress`); active-tab values include `Active`, `On Hold`, and `Vacation`.
- `DAILY FOLLOW-UP`: 42 named rows, with 22 `Done`, 11 `In Progress`, and 9 `Open`.

These are workbook snapshot counts, not import totals. Re-run a privacy-safe preflight after the source spreadsheet is confirmed and before migrating data.

## ID and Assignment Prototype

A standalone, fictional-data [spreadsheet prototype](../../template/RASUNA%20Assignment%20History%20Prototype.xlsx) has been created to demonstrate the proposed `ASSIGNMENT HISTORY` log and ID conventions without editing the supplied workbook snapshot. It is a design example, not the live workbook or an approved production schema.

- Client ID proposal: create an immutable ID such as `CL-000001` when the client first enters the workflow; retain it across tabs and keep `SN` separately as a legacy value until reviewed.
- HCA ID: applicants remain without Employee IDs; before assignments are recorded, the ready-stage Employee ID must be established as a stable identifier. Confirm whether it is the same as the active employee's folder number; otherwise keep a separate stable HCA ID and folder number.
- Assignment log: one row per HCA-client match; end/cancel the prior row and create a new row on reassignment. Do not overwrite old assignments. Proposed fields and statuses are shown in the prototype and need staff approval.

## Open Questions for Client
- 🟡 Anything else that should drive a match (gender preference, care skills, pets/smoking, etc.)? Confirmed so far: distance, language, availability, experience.
- ✅ Workbook received and inspected. Header-level inventory is above; the import must still profile values, duplicates, missing fields, and cross-tab identities without exposing client data in source control.
- ✅ Main HCA lifecycle confirmed: `HCA APPLICANTS` → `READY TO WORK HCA` (ready/waiting) → `ACTIVE EMPLOYEES` (matched with a client). 🔴 The workbook's row statuses are not fully consistent with the stage description; agree how to interpret blanks, onboarding, paperwork, hold, and vacation.
- ✅ `CLIENT PIPELINE` is for clients waiting for CCU. 🔴 Confirm later client stages and what `Archive` means; its IDs overlap with the pipeline and many archived rows have no ID.
- 🔴 Confirm availability format (days/shifts versus free-form values) and how to normalize existing values.
- 🔴 Confirm whether the ready-stage Employee ID is the same ID as the active employee's document-folder number. The current overlap is insufficient for reliable cross-tab merging; applicants have no ID, so define how their record receives/links to an ID at promotion.
- 🔴 Approve a client-ID convention. Assign a unique immutable ID to clients; do not assume the current `SN` field is unique or stable.
- 🔴 There is no dedicated assignment history today; old working notes are the only known source. Agree on manual review/reconstruction rules; start structured history for new assignments.
- ✅ `DAILY FOLLOW-UP` rows are notes/events whose action/result text accumulates. 🔴 Confirm how actionable due follow-ups should become separate tasks.
- 🔴 The workbook dashboard has broken `#REF!` formulas for approved/active client counts and clients missing case-manager details. Confirm the intended definitions; calculate these from database fields in the app rather than copying broken formulas.
- 🔴 Confirm whether staff approve an imported-data cleanup report before the import is committed.
- ✅ Keep the spreadsheet as the caregiver-intake destination for now and automate the current website-to-spreadsheet workflow. 🔴 Revisit direct app intake only after cutover and client approval (doc 3).

### Resolved
- Experience: yes/no filter only, no ranking.
- Language: preference only; multiple languages OK.
- Distance: client zip to caregiver zip, honoring caregiver's travel radius.
- HIPAA/privacy: not applicable; no health info or SSNs.
- Account ownership/payment: client.

### Form intake decision
For now, preserve the spreadsheet workflow and automate the current website submission into `HCA APPLICANTS`. Confirm the live form host and spreadsheet platform/location before implementing the connector. Direct app intake is a later option after cutover, not the interim target (doc 3).

## Ordered Execution Plan
1. Confirm the remaining details: HCA/folder ID relationship, client-ID convention, later client stages/archive behavior, availability format, task rules, dashboard definitions, auth permissions, WordPress plugin, and which Drive/PC/server spreadsheet copy is authoritative.
2. Support the delegated near-term automation: identify the authoritative Google Drive spreadsheet and sync/ownership model, then provide the agreed `HCA APPLICANTS` field map to the external WordPress team. Discuss the integration contract later.
3. Create a field map for all seven tabs; profile missing values, inconsistent statuses, IDs, and free-text fields without copying personal data into docs or source control.
4. Agree on canonical entities and a cleanup report. Implement a non-destructive, repeatable import with dry-run validation; do not infer identities or assignments from unstructured notes.
5. Build the protected operations core: sign-in, client/caregiver records, lifecycle transitions, ownership, structured assignment history, and append-only activity history.
6. Add follow-up tasks and the agreed dashboard; then implement matching with confirmed availability and distance rules, language preference, and experience filter.
7. Validate workflows and imported data with staff. Decide with the client when/if the app becomes authoritative; provide Excel/CSV export and archive the workbook only after explicit cutover approval.

**Execution status:** Initial workbook mapping and privacy-preserving profile are complete. Staff clarified the HCA lifecycle, CCU-waiting pipeline, event-log use, and assignment-history need. A showable, fictional-data assignment/ID prototype is the first deliverable; do not modify the shared workbook until its authoritative copy and synchronization behavior are understood.
