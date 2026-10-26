# 3. Caregiver Application Form Updates

Status: 🟡 WordPress-to-spreadsheet automation delegated; spreadsheet destination/sync details pending (updated 2026-10-26)

## Current State (from `template/oldForm/caregiverForm.txt`)

Fields today: Full Name, Email, Phone, Zip Code, Preferred Locations (broad regions: West Side Chicago, Southside Chicago, North & Northwestern Chicago, etc.), Preferred Working Hours (Morning/Afternoon/Evening), Availability (Full-time/Part-time), prior caregiver experience (Y/N), Additional Message, work-eligibility documents checkbox.

Current workflow (per prior notes): applicant fills out a form on the client's website → an email is sent to the admin → admin manually copies the submission into a spreadsheet.

The received workbook's `HCA APPLICANTS` columns are name, phone, email, ZIP / Area, experience, employment status, status date, paperwork / ID, and a pertinent note. This is not the same as the previously documented form-field list; verify the live form and any intervening manual edits before designing intake. Do not put applicant records or contact details in this plan.

## 2.1 — Automate Spreadsheet Intake

Problem: the WordPress website currently emails each application and staff manually enter it in the spreadsheet. The client wants to keep using the spreadsheet and automate this step. A copy is on Google Drive and copies also exist on computers/servers; the automatic upload/sync mechanism and authoritative editing copy are not yet understood.

Proposed approaches (in order of preference):
1. **Interim: automate website form → existing spreadsheet** — use the form host's supported integration or a secure server-side connector to validate submissions and add them to `HCA APPLICANTS`. Avoid email parsing if the form's submit action can be changed.
2. **Fallback: email automation** — only if the form cannot be changed and the client approves it. Validate the email format and route parsing failures for manual review; do not silently create incomplete applicant records.
3. **After app cutover: direct intake into the app** — optionally replace spreadsheet writes with a server-side endpoint that creates an applicant record in a review state, avoiding a second source of truth.

The WordPress-to-spreadsheet automation has been assigned to another team. Integration-contract discussion is deferred. The team will need the form plugin and submission details; Rasuna still needs to identify which Google Drive/PC/server workbook is authoritative and how edits/uploads synchronize before a write target can be confirmed.

## 2.2 — Form Field Changes

Requested changes:
- Add a "Willing to drive?" field (yes/no, and possibly "own vehicle?" as a related field).
- Replace the broad region dropdown (West Side Chicago / Southside Chicago / etc.) with:
  - Exact zip code (already collected today, so this may just mean *dropping* the broad-region field), plus
  - A "how far are you willing to travel?" field (e.g. dropdown: 5 / 10 / 15 / 25+ miles, or a free-number-of-miles input).

Why this is better: precise zip + travel radius is exactly the input the matching system (doc 1) needs to do real distance-based matching — the current broad regions can't be used for accurate geo-matching.

### Proposed Updated Field List (draft)
1. Full Name
2. Email
3. Phone
4. Zip Code *(kept — now the primary location field)*
5. Willing to travel up to: dropdown or validated numeric miles *(replaces broad preferred regions; value/range needs client agreement)*
6. Willing to drive? (Yes/No) — only if it affects eligibility/operations
7. Own a vehicle? (Yes/No) — include only if staff confirm it is necessary and appropriate to ask
8. Preferred Working Hours — Morning/Afternoon/Evening (unchanged)
9. Availability — Full-time/Part-time (unchanged)
10. Worked as caregiver before? Yes/No (unchanged)
11. Languages spoken (🔴 NEW — not currently on the form at all, but doc 1's matching needs this; recommend adding a multi-select)
12. Additional Message (unchanged)
13. Work-eligibility documents checkbox (unchanged)

🔴 Open question: confirm which languages to offer and whether "other" should be supported. Languages are a matching preference in doc 1, not a hard requirement.

## Suggested Next Steps
1. **Delegated:** the external team identifies the WordPress form plugin and implements website submission automation.
2. **Rasuna follow-up:** identify the authoritative spreadsheet and Drive/PC/server upload/sync workflow, then provide the chosen destination and `HCA APPLICANTS` field mapping to that team. Discuss the integration contract later as requested.
3. Confirm who reviews new applicants.
4. Approve required fields and validation rules, especially ZIP, travel range, language, and availability; decide whether drive/vehicle questions are needed.
5. Review the delegated integration against the agreed spreadsheet destination and field mapping when the team is ready. Keep an explicit manual-review path for malformed submissions; revisit direct app intake after cutover.
