# 2. Authentication Plan for the Matching App

Status: 🔴 Needs decision

## Problem

Once the caregiver-matching tool (doc 1) is deployed as a web app on Vercel, it's publicly reachable by URL unless access is locked down. Client wants only their staff (username/password) to be able to use it — not the general public.

## Options (ranked by fit for a small internal tool)

### Option A — Managed auth provider (recommended)
Use a hosted auth service instead of hand-rolling login/password storage:
- **Clerk** or **Auth.js (NextAuth)** with a credentials or email/password provider — both have first-class Next.js support.
- **Supabase Auth** — good fit if the DB (doc 1) also ends up on Supabase, since users + data live together.
- Pros: handles password hashing, session cookies, password reset, rate limiting, brute-force protection for you. Much lower security risk than DIY.
- Cons: small learning curve, possible cost at scale (irrelevant here — handful of staff users).

### Option B — Simple credentials + NextAuth "Credentials" provider, self-managed user table
- Store a small `users` table (email + bcrypt/argon2 password hash) in the same Postgres DB.
- Use NextAuth (Auth.js) purely for session/cookie handling, with your own credentials check against that table.
- Good middle ground: full control over the user list (client can just add staff manually), still get secure session handling from the library.

### Option C — Zero-code gate (fastest, least flexible)
- Vercel supports simple **password protection** on deployments (paid plans) or you can put the whole app behind a middleware check with one shared password.
- Fine as a stopgap, but doesn't give per-user accounts, audit trail, or easy revocation — not recommended as the long-term answer since client explicitly wants username/password per user.

## Recommendation
Option B: Auth.js (NextAuth) Credentials provider + a `users` table in the same database used for caregivers/clients, with hashed passwords (bcrypt) and secure httpOnly session cookies. This keeps everything in one DB, gives real per-staff accounts, and doesn't require handing user data to a third party. If the client would rather not maintain a user table at all, fall back to Option A (Clerk/Supabase Auth).

## Security Requirements (non-negotiable regardless of option chosen)
- Passwords hashed with bcrypt/argon2 — never stored plain text.
- Session cookies must be `httpOnly`, `secure`, `sameSite=lax` (or `strict`).
- Rate-limit / lock out after repeated failed logins.
- All matching-tool routes/pages must check session server-side (middleware or per-route guard) — do not rely on client-side redirects alone.
- HTTPS only (Vercel gives this by default).
- No self-service signup page — accounts created/managed by an admin only.

## Open Questions for Client
- 🔴 How many staff need accounts, and who administers adding/removing users?
- 🔴 Any requirement for role differences (e.g. admin vs. regular staff), or is everyone the same access level?
- 🔴 Any existing company SSO (Google Workspace, Microsoft 365) staff already use? If yes, "Sign in with Google/Microsoft" via NextAuth could replace password management entirely — often simpler and more secure than passwords.

## Suggested Next Steps
1. Confirm with client whether they already use Google Workspace / Microsoft 365 — if so, prefer SSO over passwords (removes password-security burden entirely).
2. If no SSO available, implement Option B with Auth.js Credentials provider.
3. Wire auth into the same DB/hosting decision made in doc 1.
