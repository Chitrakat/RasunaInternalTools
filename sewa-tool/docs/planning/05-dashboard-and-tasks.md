# 5. Dashboard and Daily Tasks

Status: 🔴 Requirements gathering (added 2026-10-05)

Depends on: [01-caregiver-matching-system.md](01-caregiver-matching-system.md) (database, statuses, assignments).

## Context

The client's Excel workbook has a dashboard tab showing only four counts: clients, pending/processing clients, total caregivers, pending/processing caregivers. It is mostly empty and unused. A separate tab holds daily tasks, reminders, and updates. Moving tasks into the app is the main reason staff would stop opening Excel, so this is a core adoption feature, not a nice-to-have.

## Proposed Dashboard

- Pipeline counts by status; each count clicks through to the filtered list.
- Today's and overdue tasks/reminders for the logged-in staff member.
- Unmatched clients, longest-waiting first.
- New caregiver applicants awaiting review (fed by the caregiver form, doc 3).
- Top suggested caregivers for each unmatched client (uses doc 1 matching).
- Recent activity feed (matches made, status changes).
- Coverage view: caregiver counts per area/zip vs client demand.

## Proposed Tasks Model

`tasks`: id, title, notes, due_date, assigned_to (staff user), related caregiver_id / client_id (optional), status (open/done), recurring rule (optional), created_by, created_at.

## Open Questions

- 🔴 How are the tasks/reminders tab used today: per staff member, shared, recurring, tied to a client or caregiver?
- 🔴 Is there an "updates" log (notes on a client over time) that should become a per-record activity timeline?
- 🔴 Do they want email reminders/notifications, or is in-app enough?
- 🔴 Which of the dashboard ideas above matter most? What decisions do staff make each morning?
- 🔴 Do staff need to see only their own tasks, or everyone's (affects roles in doc 2)?

## Next Steps

1. Get the tasks tab from the Excel workbook and review how it is used.
2. Rank dashboard widgets with the client; build the top few first.
3. Build after the schema and import in doc 1 are in place.
