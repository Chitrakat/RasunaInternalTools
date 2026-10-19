# 5. Dashboard and Daily Tasks

Status: 🔴 Workflow and dashboard priorities need staff confirmation (updated 2026-10-19)

Depends on: [01-caregiver-matching-system.md](01-caregiver-matching-system.md) (database, statuses, assignments).

## Context

The received workbook contains a `DASHBOARD` with pipeline/readiness/follow-up counts, a `DAILY FOLLOW-UP` tab, and a `CLIENT PIPELINE` `Next Follow-Up` field. Staff clarified that each daily-follow-up row is a note/event and action/result notes accumulate in its row. Treat these primarily as activity history, not independent tasks; create a separate task only for a confirmed actionable follow-up. Two dashboard formulas have broken `#REF!` references.

## Proposed Dashboard

- Pipeline counts by status; each count clicks through to the filtered list.
- Today's and overdue tasks assigned to the logged-in staff member (confirm whether everyone can see all tasks).
- Unmatched clients, longest-waiting first.
- New caregiver applicants awaiting review (fed by the caregiver form, doc 3).
- Top suggested caregivers for each unmatched client (uses doc 1 matching).
- Recent activity feed (matches made, status changes).
- Coverage view: caregiver counts per area/zip vs client demand.

## Proposed Tasks Model

Proposed `activity`: id, occurred_at, event type, content, actor/owner, optional related client/caregiver, source row. Preserve each source row and its accumulated notes; split old notes into multiple events only when dates and boundaries are unambiguous, otherwise retain the raw note for staff review.

Proposed `tasks`: id, title, due_at, assigned_to, optional related client/caregiver, status, created_by, created_at, completed_at. Create a task only when a follow-up is explicitly actionable; do not treat every activity event as an open task. Add recurrence or notifications only if staff confirm the need.

## Open Questions

- ✅ Each `DAILY FOLLOW-UP` row is a note/event; action/result notes accumulate in that row.
- 🔴 Which due/status combinations represent a live actionable task, and should existing rows be split into events/tasks or retained as historical notes?
- 🔴 Are events/tasks shared, individually owned, recurring, or tied to a person?
- 🔴 Is there an "updates" log (notes on a client over time) that should become a per-record activity timeline?
- 🔴 Do they want email reminders/notifications, or is in-app enough?
- 🔴 Which of the dashboard ideas above matter most? What decisions do staff make each morning?
- 🔴 Do staff need to see only their own tasks, or everyone's (affects roles in doc 2)?

## Next Steps

1. Walk through the `DAILY FOLLOW-UP` columns and examples with staff; define task status, visibility, ownership, completion, and treatment of legacy notes.
2. Confirm the dashboard counts, especially the two broken `#REF!` formulas, and rank widgets by decisions staff make daily.
3. Map follow-ups to the task/activity model and migrate only values that staff confirm are actionable or meaningful history.
4. Build tasks and agreed dashboard widgets after auth and the core client/caregiver schema are in place.
