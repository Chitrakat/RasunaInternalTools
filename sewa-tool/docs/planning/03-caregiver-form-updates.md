# 3. Caregiver Application Form Updates

Status: 🟡 Approach proposed

## Current State (from `template/oldForm/caregiverForm.txt`)

Fields today: Full Name, Email, Phone, Zip Code, Preferred Locations (broad regions: West Side Chicago, Southside Chicago, North & Northwestern Chicago, etc.), Preferred Working Hours (Morning/Afternoon/Evening), Availability (Full-time/Part-time), prior caregiver experience (Y/N), Additional Message, work-eligibility documents checkbox.

Current workflow: applicant fills out form on the client's website → an email is sent to the admin → admin manually copies the submission into a Google Sheet.

## 2.1 — Automate Google Sheets Filling

Problem: admin currently retypes/copies each emailed submission into Google Sheets by hand.

Proposed approaches (in order of preference):
1. **Direct API write on submit** — when the form is submitted, call the Google Sheets API (via a service account) and append a row directly. No email-parsing needed; most reliable. Requires knowing what platform hosts the form today (native website form builder? Typeform/Google Forms/Jotform? custom code?).
2. **Google Forms → Sheets (if the form itself moves to Google Forms)** — Google Forms already auto-populates a linked Sheet with zero code. Only viable if the client is open to moving the form itself onto Google Forms.
3. **Email parsing fallback** — if we can't touch the form's submit handler, a script (Google Apps Script "on email received" trigger, or a Zapier/Make automation) parses the admin's inbox and appends a row. More fragile (breaks if email format changes), but works without form access.

🔴 Open question: What actually hosts/renders the current caregiver form (Squarespace/Wix/WordPress plugin/custom code)? This determines which option above is possible. Need this before picking an approach.

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
5. Willing to travel up to: ⟶ dropdown (5/10/15/25/50 miles) or numeric input *(replaces "Preferred Locations")*
6. Willing to drive? (Yes/No)
7. Own a vehicle? (Yes/No) — optional add, useful if "willing to drive" alone isn't enough
8. Preferred Working Hours — Morning/Afternoon/Evening (unchanged)
9. Availability — Full-time/Part-time (unchanged)
10. Worked as caregiver before? Yes/No (unchanged)
11. Languages spoken (🔴 NEW — not currently on the form at all, but doc 1's matching needs this; recommend adding a multi-select)
12. Additional Message (unchanged)
13. Work-eligibility documents checkbox (unchanged)

🔴 Open question: confirm "Languages spoken" should be added — it's referenced as a key match criterion in doc 1 but isn't on the current form.

## Suggested Next Steps
1. Confirm where/how the current form is hosted (needed for 2.1).
2. Get client sign-off on the proposed field list above (especially the new language field and drive/vehicle fields).
3. Implement chosen Sheets-automation approach.
4. Update form fields once locations/hosting question is answered.
