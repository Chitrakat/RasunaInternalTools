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

## Current Snapshot (2026-10-26)

| Item | Status |
|---|---|
| Caregiver matching search tool | 🟡 Direction decided (Supabase proposed); lifecycle clarified; unique IDs and availability details pending |
| Auth for matching app | 🟡 Individual accounts and admin/manager + regular-staff roles confirmed; permission details, SSO, and account administration pending |
| Dashboard + daily tasks | 🟡 Daily-follow-up rows are event notes; task rules and dashboard priorities need confirmation |
| Caregiver form intake and field changes | 🟡 WordPress automation delegated; spreadsheet is interim target; Drive/PC/server sync path needs discovery |
| Spreadsheet-to-app migration | 🟡 Workbook profiled; [fictional assignment/ID prototype](../../template/RASUNA%20Assignment%20History%20Prototype.xlsx) created; historical notes require review |

## Execution Order

1. **Review the assignment/ID prototype** — agree the assignment fields and proposed client/HCA ID rules before adapting them to the shared workbook.
2. **Stabilize spreadsheet identity/data** — identify the authoritative Google Drive/PC/server copy and sync mechanism; agree how client IDs, ready-stage Employee IDs, and active folder numbers are carried across tabs.
3. **Complete the delegated intake automation** — the external team owns WordPress-to-spreadsheet implementation; discuss the field-mapping/integration contract later and verify it against the agreed spreadsheet target.
4. **Specify and validate the import** — map all tabs, resolve identity/deduplication rules, produce a cleanup report, and build a safe repeatable import.
5. **Build the protected operations core** — auth, client/caregiver records, status transitions, structured assignment history, and activity history.
6. **Build follow-ups and the agreed dashboard.**
7. **Build matching** — after availability, distance, language, and assignment rules are agreed and data is normalized.
8. **Validate with staff and agree on cutover** — make the app authoritative only with client approval; retain tested Excel/CSV export.

The workbook snapshot has been inspected and staff have clarified key workflows. A fictional-data assignment/ID prototype is available for review. Do not change the shared spreadsheet until its authoritative copy and synchronization behavior are understood.
