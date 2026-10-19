# 2. Authentication Plan for the Matching App

Status: 🟡 Supabase Auth recommended to align with the database proposal; client confirmation pending (updated 2026-10-19)

Doc 1 recommends Supabase for the database. Prefer Supabase Auth so identity and database access policies are designed together. The client confirms each staff member needs an individual account and wants admin/manager and regular-staff roles. The exact permission matrix, account administrator, and any existing company SSO still need to be determined. Staff: 3 now, growing, mid-low technical comfort.

## Problem

Once the caregiver-matching tool (doc 1) is deployed as a web app on Vercel, it's publicly reachable by URL unless access is locked down. Client wants only their staff (username/password) to be able to use it — not the general public.

## Options (ranked by fit for a small internal tool)

### Option A — Supabase Auth (recommended)
Use Supabase Auth with the Supabase database proposed in doc 1. Confirm whether staff should sign in with managed email/password accounts or an existing SSO provider before implementation.

### Option B — Auth.js with a separate identity strategy
Consider only if Supabase is rejected or there is a concrete requirement it cannot meet. Avoid building a custom password table unless the client accepts the added security and account-maintenance burden.

### Option C — Zero-code gate (fastest, least flexible)
- Vercel supports simple **password protection** on deployments (paid plans) or you can put the whole app behind a middleware check with one shared password.
- Fine as a stopgap, but doesn't give per-user accounts, audit trail, or easy revocation — not recommended as the long-term answer since client explicitly wants username/password per user.

## Recommendation
Use Supabase Auth if the client approves the Supabase platform recommendation. Choose managed SSO if staff already use a supported company identity provider and the client prefers it. Revisit Auth.js only if the database/provider decision changes.

## Security Requirements (non-negotiable regardless of option chosen)
- Never implement or store plaintext passwords; rely on the selected provider's supported authentication flow.
- Protect every data read and write on the server and enforce least privilege at the database layer; client-side redirects are not authorization.
- Use HTTPS and secure session handling supported by the provider.
- Disable public self-service signup; accounts must be provisioned by an authorized admin.

## Open Questions for Client
- ✅ Each staff member should have an individual account (no shared login).
- 🔴 How many accounts are needed initially, and who administers adding/removing users?
- ✅ Two role classes are needed: admin/manager and regular staff.
- 🔴 Define permissions for each role (especially user management, status changes, assignments, exports, and access to records).
- 🔴 Any existing company SSO (Google Workspace, Microsoft 365) staff already use? If so, confirm whether it should be the sign-in method.
- 🔴 Who owns the Supabase project, billing, recovery, and administrator access? The client should own and control the production account.

## Suggested Next Steps
1. Confirm SSO, initial user count, roles/permissions, and account administration with the client.
2. Get approval for Supabase and client ownership of the production project.
3. Implement Supabase Auth and server/database authorization together with the first protected data feature.
