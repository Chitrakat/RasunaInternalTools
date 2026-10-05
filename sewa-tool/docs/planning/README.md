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

## Current Snapshot (2026-09-21)

| Item | Status |
|---|---|
| Caregiver matching search tool | 🟡 Direction decided (Supabase + phased Excel migration); details pending |
| Auth for matching app | 🟡 Leaning Supabase Auth (see doc 2) |
| Dashboard + daily tasks | 🔴 Requirements gathering |
| Google Sheets auto-fill from form | 🟡 Approach proposed |
| Caregiver form field changes (zip + travel radius, willing-to-drive) | 🟡 Approach proposed |
| Google Sheets/Excel data storage feedback | 🔴 Meeting pending |
