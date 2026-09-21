# 1. Caregiver ↔ Client (Senior) Matching System

Status: 🔴 Requirements gathering

## Problem

Client currently matches caregivers to seniors manually:
- Search is by zip code, then manually check "nearby" zip codes.
- No consideration of other match criteria in the tool itself (language, availability, care needs, etc. — currently done ad hoc in someone's head).
- Slow and error-prone; doesn't scale as the caregiver/client lists grow.

## Goal

A small internal web tool that lets staff search/filter for the best caregiver-client matches based on structured criteria instead of manual zip-code scanning.

## Proposed Approach

- Store caregivers and clients in a real database (not spreadsheets) — SQL (e.g. Postgres) is the right call here, client's instinct is correct.
  - Recommend a managed Postgres (e.g. Supabase, Neon, or Vercel Postgres) since the app will likely live on Vercel — avoids running/hosting your own DB server.
- Data model (draft — needs client validation):
  - `caregivers`: id, name, contact info, zip code, lat/lng (geocoded from zip), languages[], availability (days/hours), max travel distance, willing to drive (bool), skills/certifications, notes, active/inactive.
  - `clients` (seniors): id, name, contact info, zip code, lat/lng, languages needed, care needs/schedule, notes, active/inactive.
  - `matches` / `assignments` (optional): history of who was matched to whom, for tracking outcomes.
- Matching logic:
  - Geocode zip codes to lat/lng once (on save), then query by distance (`ST_DWithin` in PostGIS, or a simple haversine formula in plain SQL/JS) instead of string-matching nearby zips.
  - Combine distance filter with hard filters (language match, availability overlap) and produce a ranked list (closest + best-matching first).
- UI: a search/filter page — pick a client (or enter ad hoc criteria), see ranked list of eligible caregivers with distance, language, availability shown; maybe a manual "assign" action that records the match.

## Open Questions for Client
- 🔴 What are ALL the fields that should drive a match? (language, distance, availability, gender preference, specific medical/care skills, etc.) Need a full list.
- 🔴 Where does caregiver/client data live today — is it entirely in the Google Sheet(s) discussed in doc 4? If so, that sheet becomes the initial data source to migrate/import.
- 🔴 Who are the intended users of this tool (how many staff, technical comfort level)?
- 🔴 Should this integrate with the caregiver form (doc 3) so new applicants flow directly into the `caregivers` table instead of a spreadsheet?
- 🔴 Any existing "match" or "assignment" history that needs to be preserved/imported?

## Suggested Next Steps
1. Get a full field list + a sample export of the current spreadsheet(s) from the client.
2. Decide on hosting for DB (Supabase/Neon/Vercel Postgres) — likely same decision as auth provider in doc 2.
3. Design schema, build import script from the existing sheet.
4. Build search/filter UI as a new page/route in this Next.js app.
5. Only after the above is stable, revisit whether the caregiver form (doc 3) should write directly into this DB instead of / in addition to Google Sheets.
