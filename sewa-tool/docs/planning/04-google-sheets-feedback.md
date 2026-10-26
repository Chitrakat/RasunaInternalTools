# 4. Google Sheets / Excel Feedback (Upcoming Meeting)

Status: 🟡 Workbook reviewed; spreadsheet copies/sync and remaining workflows need confirmation (updated 2026-10-26)

## Context

The client-provided `template/RASUNA Master Operations.xlsx` is now available and has been reviewed. A staff walkthrough is still needed to validate how the tabs are used, reconcile unclear status/ownership rules, and decide the transition approach. This doc is prep notes — fill in during/after the meeting. Do not copy personal records into planning docs.

## Why This Matters for Other Docs
- Doc 1 (matching system) needs to map the actual tabs/columns and determine whether rows across workflow tabs represent the same people.
- Doc 3 (form intake) needs confirmation of the live form fields, submission process, and whether the workbook or app will receive new submissions.

## Questions to Ask in the Meeting
- ✅ Workbook received: `DASHBOARD`, `DAILY FOLLOW-UP`, `CLIENT PIPELINE`, `ACTIVE EMPLOYEES`, `READY TO WORK HCA`, `HCA APPLICANTS`, `Archive`.
- ✅ HCA lifecycle: `HCA APPLICANTS` → `READY TO WORK HCA` (ready/waiting) → `ACTIVE EMPLOYEES` (matched with a client).
- ✅ `CLIENT PIPELINE` currently contains clients waiting for CCU.
- ✅ `DAILY FOLLOW-UP` rows are notes/events; action and result notes accumulate in each row.
- ✅ There is no structured assignment history today; assignments are only reflected in old working notes. The new tool should record assignment history.
- 🔴 Who edits these sheets, and how often (daily/weekly)?
- 🔴 Are there existing formulas, conditional formatting, or manual processes built into the sheet we need to preserve or replace?
- 🔴 Any data quality issues today (duplicates, inconsistent zip formats, stale/inactive entries not marked as such)?
- 🔴 Where is caregiver-client assignment history kept? There is no dedicated assignments tab in this workbook.
- 🔴 What stable identifier links the same HCA across workflow tabs? Do rows move or remain in more than one tab?
- 🔴 What happens to clients after they leave the CCU-waiting stage, and what does moving a row to `Archive` mean?
- 🔴 The `DASHBOARD` has two formulas containing `#REF!`. What are the intended approved/active client and missing-case-manager counts?
- ✅ Keep using the spreadsheet for now; automate website applications into it as the interim workflow.
- ✅ WordPress-to-spreadsheet automation is assigned to an external team; defer the integration-contract discussion until later.
- 🔴 After the app is ready, will the client approve making it authoritative and archiving the workbook, or must the spreadsheet remain the source of truth?
- ✅ The live form is hosted on WordPress. 🔴 Identify its form plugin and confirm the production form/submission route.
- ✅ A copy is on Google Drive and copies also exist on computers/servers. 🔴 The automatic upload/sync mechanism and authoritative editing copy are unknown; identify these before changing the shared spreadsheet or wiring automation.
- 🔴 Client ID needs a unique stable value; determine how it will be generated and carried across client workflow/archive tabs. Preserve `SN` separately until staff confirm its meaning.
- 🔴 HCA applicants do not need an Employee ID. Ready-to-work HCAs have one; active employees have an ID based on their document-folder number. Confirm whether these identifiers are the same and how to link applicants when promoted.

## Feedback to Prepare (general Sheets/Excel pain points to raise)
- Spreadsheets don't scale well for search/filter across hundreds of rows — this is exactly why matching is slow today (doc 1).
- No enforced structure — free text fields drift (e.g. inconsistent region names, zip typos) which breaks any future automated matching.
- No built-in geocoding/distance calculation — that's a DB + backend job, not a spreadsheet formula (technically possible with add-ons, but fragile).
- No access control at the row/column level — anyone with the link/sheet access sees everything.
- No audit trail of who changed what/when (Sheets version history helps a little, but isn't structured).

## Outcome / Notes
- ✅ Decisions captured from the client:
  - HCA path: applicant → ready/waiting → active after client match.
  - `CLIENT PIPELINE` currently tracks clients waiting for CCU.
  - `DAILY FOLLOW-UP` records events/notes, with actions and results accumulating in each row.
  - Start structured assignment history in the new tool; historical assignments are only in old working notes.
  - Continue using the spreadsheet for now and automate WordPress form entry into it once the authoritative copy/sync path is known.
  - Staff need individual accounts, with admin/manager and regular-staff roles.
- ✅ Workbook received at `template/RASUNA Master Operations.xlsx` (contains personal data; keep it local and do not attach it to tickets or commit it).
- 🔴 Follow-ups: identify stable IDs and remaining stage/status meanings, later client stages/archive behavior, spreadsheet authority/sync, and permissions within each role. Later, discuss the integration contract with the external WordPress automation team.
