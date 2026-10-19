# Planning Docs Index

This folder tracks feature requests, open problems, and design decisions raised by the client, separate from the actual app code. Each file below is a standalone plan for one workstream. Update the relevant file as decisions are made, questions are answered, or scope changes — don't let this drift out of sync with reality.

## Files

1. [01-caregiver-matching-system.md](01-caregiver-matching-system.md) — Core caregiver ↔ client (senior) matching search tool (replaces manual zip-code lookup).
2. [02-authentication-plan.md](02-authentication-plan.md) — Login/auth approach for the matching app once it's hosted publicly on Vercel.
3. [03-caregiver-form-updates.md](03-caregiver-form-updates.md) — Caregiver application form changes + Google Sheets automation.
4. [04-google-sheets-feedback.md](04-google-sheets-feedback.md) — Prep notes/questions for the upcoming Google Sheets/Excel feedback meeting.
5. [05-dashboard-and-tasks.md](05-dashboard-and-tasks.md) — Dashboard redesign and daily tasks/reminders moved out of Excel.

## Status Legend
- 🔴 Open question — needs client/decision input
- 🟡 Decided, not started
- 🟢 In progress / partially built
- ✅ Done

## Current Snapshot (2026-10-19)

| Item | Status |
|---|---|
| Caregiver matching search tool | 🟡 Direction decided (Supabase proposed); HCA lifecycle and CCU-waiting pipeline clarified; data/availability details pending |
| Auth for matching app | 🟡 Individual accounts and admin/manager + regular-staff roles confirmed; permission details, SSO, and account administration pending |
| Dashboard + daily tasks | 🟡 Daily-follow-up rows are event notes; task rules and dashboard priorities need confirmation |
| Caregiver form intake and field changes | 🟡 WordPress form; keep spreadsheet as interim target; spreadsheet platform and WordPress plugin need discovery |
| Spreadsheet-to-app migration | 🟡 Workbook mapped; assignment history must be created going forward; historical notes require review |

## Execution Order

1. **Close implementation blockers** — identify the live spreadsheet platform and WordPress form plugin; confirm stable IDs, remaining status meanings, role permissions, and availability rules.
2. **Automate the current intake workflow** — connect WordPress submissions to `HCA APPLICANTS` in a test destination, with validation and a manual-review fallback.
3. **Specify and validate the import** — map all tabs, resolve identity/deduplication rules, produce a cleanup report, and build a safe repeatable import.
4. **Build the protected operations core** — auth, client/caregiver records, status transitions, structured assignment history, and activity history.
5. **Build follow-ups and the agreed dashboard.**
6. **Build matching** — after availability, distance, language, and assignment rules are agreed and data is normalized.
7. **Validate with staff and agree on cutover** — make the app authoritative only with client approval; retain tested Excel/CSV export.

The first step is underway: the supplied workbook has been inspected and the planning docs are being aligned to its real tabs and known gaps. Implementation that would encode unresolved business rules remains gated on staff confirmation.
