# 4. Google Sheets / Excel Feedback (Upcoming Meeting)

Status: 🔴 Meeting pending

## Context

Client wants feedback on how they currently store their caregiver/client lists in Google Sheets/Excel. A meeting about this is scheduled soon. This doc is prep notes — fill in during/after the meeting.

## Why This Matters for Other Docs
- Doc 1 (matching system) needs this data as its initial import source and needs to know the real current schema/columns.
- Doc 3 (form automation) needs to know the exact sheet structure it should be appending rows into.

## Questions to Ask in the Meeting
- 🔴 Can we get a sample export (with fake/anonymized data if needed) of the current caregiver sheet and client sheet?
- 🔴 How many sheets/tabs are there, and what does each one track (caregivers, clients, matches/history, something else)?
- 🔴 Who edits these sheets, and how often (daily/weekly)?
- 🔴 Are there existing formulas, conditional formatting, or manual processes built into the sheet we need to preserve or replace?
- 🔴 Any data quality issues today (duplicates, inconsistent zip formats, stale/inactive entries not marked as such)?
- 🔴 Is there a "matched" / "history" record kept anywhere, or does a match just overwrite/get noted informally?
- 🔴 Would the client be OK moving primary data ownership to a real database (doc 1) with the Sheet becoming read-only export/reporting, or do they want to keep Sheets as the source of truth?

## Feedback to Prepare (general Sheets/Excel pain points to raise)
- Spreadsheets don't scale well for search/filter across hundreds of rows — this is exactly why matching is slow today (doc 1).
- No enforced structure — free text fields drift (e.g. inconsistent region names, zip typos) which breaks any future automated matching.
- No built-in geocoding/distance calculation — that's a DB + backend job, not a spreadsheet formula (technically possible with add-ons, but fragile).
- No access control at the row/column level — anyone with the link/sheet access sees everything.
- No audit trail of who changed what/when (Sheets version history helps a little, but isn't structured).

## Outcome / Notes
(fill in after the meeting)
- 🔴 Decisions made:
- 🔴 Sample data received (Y/N, location if yes):
- 🔴 Follow-ups:
