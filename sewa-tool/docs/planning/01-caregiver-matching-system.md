# 1. Caregiver ↔ Client (Senior) Matching System

Status: 🟡 Core direction decided, details pending (updated 2026-10-05)

Related: dashboard/tasks are in [05-dashboard-and-tasks.md](05-dashboard-and-tasks.md).

## Confirmed Facts (from client)
- Match criteria so far: distance, language, availability, previous caregiver experience.
- Experience is a plain yes/no, used as a filter only (no ranking).
- Language is a preference only (not a hard requirement); a person can speak multiple languages, and more matches is better.
- Distance: client zip to caregiver zip, honoring each caregiver's own travel radius.
- Availability is days and shifts (to be confirmed).
- Assignment history is currently one line in a tab, which is messy; the new `assignments` table replaces this.
- No privacy/HIPAA obligations; no health info or SSNs in the data (still avoid storing anything sensitive we don't need).
- Client will own and pay for the hosting accounts.
- All data is in one Excel workbook with tabs: caregivers, clients, daily tasks/reminders/updates, and a mostly-empty dashboard.
- 3 staff now, growth planned; mid-low technical comfort.
- Existing match/assignment history must be imported.

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
  - Fallback to minimize lock-in: Neon + Auth.js.
- **Migration phases** (avoid two-way Excel sync; two live sources of truth drift):
  1. Import: one-time, re-runnable import of Excel tabs; clean zips, normalize languages, geocode.
  2. Matching page; Excel kept as a safety net briefly.
  3. Dashboard + tasks (doc 5) — this is what makes staff stop opening Excel.
  4. Cutover: app is source of truth, Excel archived; add Export to Excel/CSV.
- Data model (draft — validate against the real Excel tabs):
  - `caregivers`: id, name, contact info, zip code, lat/lng (geocoded from zip), languages[], availability (days/shifts), max travel distance, willing to drive (bool), prior experience (bool/years), status (pending/processing/active/inactive), source (form/manual/import), notes.
  - `clients` (seniors): id, name, contact info, zip code, lat/lng, languages needed, schedule needed, care needs, status (pending/processing/active/inactive), notes.
  - `assignments`: caregiver_id, client_id, start/end dates, status, notes. Imported history lives here.
  - `tasks`: see doc 5.
- Matching logic:
  - Geocode zip codes to lat/lng once (on save), then query by distance (`ST_DWithin` in PostGIS, or a simple haversine formula in plain SQL/JS) instead of string-matching nearby zips.
  - Combine distance filter with hard filters (language match, availability overlap) and produce a ranked list (closest + best-matching first).
- UI: a search/filter page — pick a client (or enter ad hoc criteria), see ranked list of eligible caregivers with distance, language, availability shown; maybe a manual "assign" action that records the match.

## Open Questions for Client
- 🟡 Anything else that should drive a match (gender preference, care skills, pets/smoking, etc.)? Confirmed so far: distance, language, availability, experience.
- 🔴 Can we get a copy of the Excel workbook (anonymized if needed)? Client says yes, soon. Column names/tabs drive the schema and import script.
- 🟡 Availability is days and shifts; client will confirm the exact format.
- 🔴 **Statuses (pending, processing, ...): what each means and who moves records between them. Client will confirm; this is important because the dashboard and pipeline depend on it.**
- 🔴 Assignment history is one line in a tab. Need the Excel to see how to parse it into structured `assignments` rows (messy import expected).
- 🔴 Should the caregiver form (doc 3) write directly into `caregivers` as a "pending" record? Explained to client; no answer yet (see below).

### Resolved
- Experience: yes/no filter only, no ranking.
- Language: preference only; multiple languages OK.
- Distance: client zip to caregiver zip, honoring caregiver's travel radius.
- HIPAA/privacy: not applicable; no health info or SSNs.
- Account ownership/payment: client.

### Form to database question, explained
Today: applicant submits the form, an email goes to the admin, the admin retypes it into Excel. Option A (recommended): the form submission is saved directly as a new row in `caregivers` with status "pending", and it appears in the app for staff to review, with no retyping. Option B: the form keeps writing to Google Sheets (doc 3) and staff move the data manually or via an import. Option A needs the form to be able to send data to our app; this depends on how the form is hosted (doc 3).

## Suggested Next Steps
1. Get the Excel workbook and map every tab/column to the model above.
2. Get the status definitions (what each means, who changes them).
3. Design schema, build import script from the existing sheet (including parsing the one-line assignment history).
4. Build search/filter UI as a new page/route in this Next.js app.
5. Only after the above is stable, revisit whether the caregiver form (doc 3) should write directly into this DB instead of / in addition to Google Sheets.
