# DHA Estate Pro — Real Estate Management System (DHA Karachi)

A full-stack real estate platform: property listings, role-based dashboards,
inquiries (leads), viewing appointments, admin listing verification, and a
**sandbox** payment workflow. Frontend: Vite + React 18 + React Router +
Tailwind CSS. Backend: Node.js + Express + MongoDB (Mongoose).

> **Stack note:** this project was migrated from Next.js to Vite + React on
> 2026-10-24 at the user's request. The migration was mechanical and
> behavior-preserving: file-based routing → React Router, `next/link` →
> `Link`, navigation hooks → `useNavigate`/`useParams`/`useSearchParams`.
> The backend API is completely unchanged, and all pages, design, and local
> images work as before. The conversion script is
> `scripts/migrate_to_react.py`. The previous Next.js build is preserved in
> `DHA-Estate-Pro-Complete.zip`.

## Quick start

```bash
# 1. Backend
cd backend
cp .env.example .env   # fill in your own values (see below)
npm install
npm run seed           # optional demo data (admin, agents, buyer, listings)
npm run dev            # API on http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev            # site on http://localhost:5173
```

The frontend calls the API at `http://localhost:5000/api` (hardcoded, as
before). The backend serves uploaded images at `http://localhost:5000/uploads/*`.

## Environment variables (backend/.env)

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB Atlas or local connection string |
| `DB_NAME` | Database name (default `dhaestatepro`) |
| `JWT_SECRET` | Access-token secret (1 day expiry) |
| `JWT_REFRESH_SECRET` | Refresh-token secret (7 day expiry) |
| `NODE_ENV` | `development` / `production` |

⚠️ **Security:** never commit a filled `.env`. If a real `.env` was ever
shared or uploaded, rotate the MongoDB password and both JWT secrets
immediately — old tokens/credentials must be treated as compromised.
Default seed accounts (demo only, change in production): the seed script
creates an admin, agents, and a buyer with simple demo passwords.

## Roles & permissions (enforced on the backend)

| Role | Can do |
| --- | --- |
| `USER` (Buyer/Tenant) | Browse/search, view details, save favorites, send inquiries, request viewings, view own payments |
| `OWNER` (Seller) | Everything a buyer can, plus create/manage **own** listings |
| `AGENT` | Manage own listings, handle assigned inquiries, manage assigned viewings, view own analytics |
| `ADMIN` | Everything, plus verify/reject listings, manage users & roles, view all data & analytics |

Public registration **always** creates a `USER`. Nobody can self-assign
`OWNER`, `AGENT`, or `ADMIN` — only an admin can change roles
(`PUT /api/auth/users/:id/role`). Auth endpoints are rate-limited
(50 attempts / IP / 15 min).

## Listing verification workflow

1. Owner/agent submits a listing → status `Pending`.
2. Public pages (home, listings, search) show **only `Approved`** listings.
3. Admin approves or rejects from the dashboard (reject with an optional reason).
4. Owners/agents see their own listings (any status) via `scope=mine`;
   admins see everything via `scope=all`.
5. Listings created before this workflow existed were grandfathered as
   `Approved` (they were already public).

## Images

- All website images live in `frontend/public/images/` and render from
  there — no property/hero/avatar image is hotlinked anymore. (User avatars
  from Dicebear and the Mapbox map background are third-party services and
  intentionally stay remote.)
- **Every localized image is under 20 KB** (compressed with the
  `scripts/localize_images.py` script) so pages render fast. Re-run that
  script if you add new Unsplash images.
- Agent uploads: dashboard property form → "Or Upload Main Image".
  **Image should be less than 100 KB** — enforced in the browser *and* on
  the server (`POST /api/uploads/image` rejects ≥ 100 KB). Uploaded files
  are stored locally under `backend/src/uploads/` and served at `/uploads/*`.

## API endpoints

Base: `http://localhost:5000/api`

### Auth
| Method & path | Auth | Notes |
| --- | --- | --- |
| `POST /auth/register` | — (rate-limited) | Always creates `USER` |
| `POST /auth/login` | — (rate-limited) | Returns access + refresh tokens |
| `POST /auth/refresh` | — | Rotates token pair |
| `GET /auth/me` | Bearer | Current user |
| `PUT /auth/profile` | Bearer | Edit name/phone/avatar |
| `POST /auth/favorites/:propertyId` | Bearer | Toggle favorite |
| `GET /auth/agents` | — | Agent directory |
| `GET /auth/users` | ADMIN | User directory |
| `PUT /auth/users/:id/role` | ADMIN | Change role (`USER/OWNER/AGENT/ADMIN`) |
| `DELETE /auth/users/:id` | ADMIN | Delete user (default admin protected) |

### Properties
| Method & path | Auth | Notes |
| --- | --- | --- |
| `GET /properties` | optional | Filters: status, type, phase, priceMin/Max, beds, baths, possessionStatus, furnished, query (text), isFeatured, page, limit. `scope=mine` (own), `scope=all` (ADMIN) |
| `GET /properties/:id` | optional | Hidden unless Approved or owner/admin |
| `POST /properties` | OWNER/AGENT/ADMIN | Non-admin submissions start `Pending` |
| `PUT /properties/:id` | owner or ADMIN | Verification fields admin-only |
| `PUT /properties/:id/verify` | ADMIN | `{ verificationStatus: Approved\|Rejected, rejectionReason? }` |
| `DELETE /properties/:id` | owner or ADMIN | |
| `GET /properties/analytics` | OWNER/AGENT | Own listings stats |
| `GET /properties/admin-analytics` | ADMIN | Platform stats |

### Inquiries (leads)
Workflow: `Pending → Contacted → Closed`.
| Method & path | Auth |
| --- | --- |
| `POST /leads` | — (public inquiry form) |
| `GET /leads/me` | Bearer (own inquiries) |
| `GET /leads/agent` | AGENT (assigned) |
| `GET /leads/admin` | ADMIN (all) |
| `PUT /leads/:id` | AGENT/ADMIN (status update) |

### Viewings
Statuses: `Requested → Confirmed → Completed`, plus `Rescheduled`, `Cancelled`.
Server blocks overlapping bookings: same property or same agent within the
same hour for active (`Requested`/`Confirmed`) viewings → `409 Conflict`.
| Method & path | Auth |
| --- | --- |
| `POST /viewings` | Bearer (buyer; body: propertyId, dateTime, notes) |
| `GET /viewings/me` | Bearer (own) |
| `GET /viewings/agent` | AGENT (assigned) |
| `GET /viewings/admin` | ADMIN (all) |
| `PUT /viewings/:id` | owner/agent/admin (buyers may only cancel/reschedule own) |

### Payments (SANDBOX ONLY)
No real gateway is integrated. Payments start `Pending`; only the explicit
sandbox confirm marks them `Confirmed` and issues a receipt number.
| Method & path | Auth |
| --- | --- |
| `POST /payments` | Bearer (body: amount > 0, method, optional propertyId) |
| `GET /payments/me` | Bearer (own) |
| `GET /payments/admin` | ADMIN (all) |
| `PUT /payments/:id/confirm` | owner or ADMIN (Pending → Confirmed + receipt) |
| `PUT /payments/:id/status` | owner/ADMIN (`Failed` from Pending; ADMIN-only `Refunded` from Confirmed) |

### Uploads
| Method & path | Auth | Notes |
| --- | --- | --- |
| `POST /uploads/image` | OWNER/AGENT/ADMIN | JSON `{ filename, data }` (base64 data URL). Rejects non-images and files ≥ 100 KB. Returns `{ url }` |

### Blogs & Projects
Standard CRUD: public reads; `ADMIN`-only create/update/delete
(`GET /blogs`, `GET /blogs/:slug`, `GET /projects`, `GET /projects/:id`).

## Pages (frontend)

Home, Listings + details (with inquiry form + viewing request form),
Agents, Projects, Blogs, Contact, Dashboard (profile, favorites, inquiries,
my-properties, add-property, leads, admin users/projects, verification
actions), **Viewings**, **Payments**, 404 page.

## What was implemented in this pass

1. **Security fixes:** public registration can no longer self-assign roles;
   forbidden responses corrected to `403`; rate limiting on auth endpoints;
   `.gitignore` + `.env.example` added.
2. **Verification workflow:** `verificationStatus` + admin approve/reject,
   public visibility rules, migration for pre-existing listings.
3. **OWNER role:** new role with own-listing rights; dashboard tabs, analytics,
   and admin role dropdown updated.
4. **Viewings system:** model, conflict-checked API, buyer/agent/admin pages.
5. **Payments sandbox:** model, API, history page, receipts only on confirm.
6. **Local images:** 18 Unsplash images downloaded to
   `frontend/public/images/`, all under 20 KB, all 44 references rewritten;
   project/property default images localized too.
7. **Agent image upload:** file input with "Image should be less than 100 KB"
   note, client + server size enforcement, local storage under
   `backend/src/uploads/`.
8. **Docs:** this README + API reference.

## Known limitations & next steps

- **No local MongoDB in this environment**, so live DB testing was not run
  here — run `npm run seed` + `npm run dev` with your own MongoDB and verify
  the workflows (register → create listing → admin approves → buyer viewing
  → sandbox payment).
- **No real payment gateway** (by design — credentials were never provided).
  Integrate one behind the payment service module when credentials exist.
- **No email provider** — password reset and email verification are not
  implemented; they need an email service (see master prompt §5).
- **No automated tests** were added; add API tests for the new
  viewing/payment/verification endpoints when time allows.
- The Mapbox map background on the listings page and Dicebear avatars are
  still remote third-party services (not local image assets).
- Frontend still calls `http://localhost:5000/api` directly; for production,
  move the API base URL into an environment variable.
