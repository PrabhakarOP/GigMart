# GigMart Frontend: Agent Build Prompt

Prepared 8 Nov 2026 from the frontend docs plus the Spring Boot backend docs. Where they disagree, the backend wins. Paste everything below into your coding agent.

---

## 1. Mission

You are a senior frontend engineer. Build the GigMart frontend from scratch in a new folder `frontend/`. GigMart is an on-demand gig marketplace: PROVIDERS post gigs, WORKERS bid on them, the provider accepts one bid, a booking is created, then paid and reviewed. An ADMIN role also exists.

**Fixed stack:** React 19, Vite, JavaScript/JSX (no TypeScript), Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7 (`react-router-dom`), Axios, Lucide React. No Redux, Zustand, React Query or other UI libraries.

**Done means:** `npm run build` and `npm run lint` pass with zero errors, the walkthrough in section 14 runs with no console errors, and every rule below is followed. Work in the milestone order of section 13 and do not advance until a gate passes. Do not ask questions. Where something is unknown, follow section 4 (probe, then decide) and log the decision in `DECISIONS.md`.

## 2. Rules that override everything

1. Never invent endpoints, fields or enum values. Only the endpoints in section 6 exist.
2. Components never import axios. They call `src/api/services.js`.
3. Service functions return the already-unwrapped payload. Components never write `.data.data`.
4. There is no JWT and no server-side session. Do not send an Authorization header and never read `gigmart_token`. Route guards are UX only.
5. Enums are uppercase strings. Use them as-is.
6. Every data view handles loading, error (with a Retry button) and empty.
7. Every effect that fetches or polls must clean up. React StrictMode runs effects twice in dev.
8. Every interactive element gets a unique, stable `id`.

## 3. Conflicts in the earlier docs and the decision for each

| Topic | Earlier frontend docs | Decision (backend wins) |
| --- | --- | --- |
| Register body | firstName, lastName | `{ fullName, email, phone, password, role }` |
| Auth header and unwrap | Bearer token, mix of `res.data` and `res.data.data` | No header. Interceptor returns the envelope, services return `envelope.data` |
| Application note | `coverLetter` | `coverNote` |
| Gig create owner | `providerId` | `providerProfileId` (profile id, not user id) |
| Roles | WORKER, PROVIDER | Plus ADMIN (seeded). Build a small admin dashboard |
| Gig list filters | city, min and max budget | Server supports only `categoryId`, `status`, `keyword`. Budget filter is client-side |
| Rejecting a bid | Decline button | No endpoint exists. Only Accept (auto-rejects the others) and worker Withdraw. Build no Decline |
| Booking lifecycle | SCHEDULED, IN\_PROGRESS, COMPLETED, CANCELLED in a line | SCHEDULED to IN\_PROGRESS to COMPLETED, and SCHEDULED to CANCELLED. COMPLETED and CANCELLED are terminal |
| Role switcher | In navbar | Removed. A user has one fixed role |
| Signup extras | bio, hourly rate at register | Backend does not accept them. Edit on Profile after login |
| Chat poll interval | 3s and 5s | 5s |
| CSS class names | card-flat, btn-outline vs card-static, btn-ghost | Use only `card`, `card-static`, `btn-primary`, `btn-secondary`, `btn-danger`, `btn-ghost`, always written `btn btn-primary` etc. |
| Message text field | `content` vs DB column `body` | Send both keys until Phase 0 confirms, read `m.body ?? m.content` |
| Currency | Unspecified | INR via one `formatMoney()` helper (`Intl.NumberFormat`) and one `CURRENCY` constant |

## 4. Phase 0: contract discovery (mandatory before any UI)

The backend docs list request bodies but not response DTO shapes, so field names in responses are unverified. Do not guess them.

1. Check the backend is up: `curl http://localhost:8081/api/v1/categories`. If it is not, stop and tell the user to start MySQL (3306) and the Spring Boot app (8081). Do not mock the backend.
2. Write `scripts/probe-api.mjs` (Node 18+, built-in fetch). Using fresh users with unique emails and phones, it runs the full flow: register provider and worker, login both, fetch profiles by user id, create an address, list categories, create a gig, apply, list applications, accept, set status IN\_PROGRESS then COMPLETED, create a payment, post both reviews, send a message, fetch every list. Save each response body to `docs/api-samples/<step>.json` and print status codes.
3. Also probe: worker update, provider update, add worker service, add slot, add document, create category, message send (with `body`, then `content`), whether `GET /payments/booking/{id}` returns an array or an object, whether lists are arrays or paged objects, whether the user JSON uses `verified` or `isVerified`, and whether login returns profile ids.
4. From the samples write `src/api/types.js` (JSDoc typedefs) and `src/api/normalizers.js` with `normalizeUser`, `normalizeGig`, `normalizeApplication`, `normalizeBooking`, `normalizeMessage`, only where key names or nesting vary (for example `gig.providerId` vs `gig.provider.id`). Components consume normalized objects only.
5. Write findings and every choice you made to `DECISIONS.md`. If a probe hits a backend 500, note it and continue.

Seeded accounts (backend `DataInitializer`):

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@gigmart.com | admin123 |
| PROVIDER | provider@gigmart.com | provider123 |
| WORKER | worker@gigmart.com | worker123 |

Seeded categories: AC Technician, Plumber, Electrician, Gardener, Carpenter, House Cleaner, Painter, Appliance Repair.

## 5. Setup (exact)

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm i react-router-dom@7 axios lucide-react tailwindcss @tailwindcss/vite
npm ls react   # must be 19.x, else: npm i react@19 react-dom@19
```

Delete Vite boilerplate (`App.css`, default assets, default `index.css` contents).

`vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const proxy = { '/api': { target: 'http://localhost:8081', changeOrigin: true } };
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000, proxy },
  preview: { port: 3000, proxy },
});
```

**Tailwind v4 rules:** no `tailwind.config.js`, no PostCSS config, no `@tailwind` directives. First line of `src/index.css` is `@import 'tailwindcss';`. Theme tokens go in `@theme { }`. Custom classes go in `@layer components` and may `@apply` core utilities only. Never `@apply` another custom class. Load Inter (300-700) and Outfit (400-800) with `<link>` tags in `index.html`, not a CSS `@import`.

## 6. API layer

`src/api/client.js`:

```js
import axios from 'axios';
const api = axios.create({ baseURL: '/api/v1', headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
api.interceptors.response.use(
  (res) => res.data, // envelope: { success, message, data, timestamp }
  (error) => {
    const body = error.response?.data;
    const msg = body?.message
      || (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running on port 8081?' : error.message)
      || 'Unexpected error';
    const err = new Error(msg);
    err.status = error.response?.status;
    err.fieldErrors = body?.data && typeof body.data === 'object' ? body.data : null; // validation map
    return Promise.reject(err);
  }
);
export default api;
```

`src/api/services.js` (adjust only where Phase 0 proves a difference):

```js
import api from './client';
const u = (p) => p.then((env) => env.data);
const clean = (o = {}) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null && v !== 'ALL' && v !== 'all'));
export const toList = (v) => (Array.isArray(v) ? v : v?.content ?? []);

export const authApi = {
  register: (d) => u(api.post('/auth/register', d)),
  login: (d) => u(api.post('/auth/login', d)),
};
export const userApi = {
  getById: (id) => u(api.get(`/users/${id}`)),
  list: (role) => u(api.get('/users', { params: clean({ role }) })),
  verify: (id) => u(api.put(`/users/${id}/verify`)),
};
export const categoryApi = {
  list: (activeOnly = true) => u(api.get('/categories', { params: { activeOnly } })),
  getById: (id) => u(api.get(`/categories/${id}`)),
  create: (d) => u(api.post('/categories', d)),
  update: (id, d) => u(api.put(`/categories/${id}`, d)),
  remove: (id) => u(api.delete(`/categories/${id}`)),
};
export const workerApi = {
  getById: (id) => u(api.get(`/workers/${id}`)),
  getByUserId: (uid) => u(api.get(`/workers/user/${uid}`)),
  list: (status) => u(api.get('/workers', { params: clean({ status }) })),
  update: (id, d) => u(api.put(`/workers/${id}`, d)),
  addService: (d) => u(api.post('/workers/services', d)),
  getServices: (id) => u(api.get(`/workers/${id}/services`)),
  removeService: (id) => u(api.delete(`/workers/services/${id}`)),
  addDocument: (d) => u(api.post('/workers/documents', d)),
  getDocuments: (id) => u(api.get(`/workers/${id}/documents`)),
  updateDocumentStatus: (docId, status) => u(api.put(`/workers/documents/${docId}/status`, null, { params: { status } })),
  addSlot: (d) => u(api.post('/workers/slots', d)),
  getSlots: (id) => u(api.get(`/workers/${id}/slots`)),
  removeSlot: (slotId) => u(api.delete(`/workers/slots/${slotId}`)),
};
export const providerApi = {
  getById: (id) => u(api.get(`/providers/${id}`)),
  getByUserId: (uid) => u(api.get(`/providers/user/${uid}`)),
  list: () => u(api.get('/providers')),
  update: (id, d) => u(api.put(`/providers/${id}`, d)),
};
export const addressApi = {
  create: (d) => u(api.post('/addresses', d)),
  getById: (id) => u(api.get(`/addresses/${id}`)),
  getByUserId: (uid) => u(api.get(`/addresses/user/${uid}`)),
  remove: (id) => u(api.delete(`/addresses/${id}`)),
};
export const gigApi = {
  list: (p) => u(api.get('/gigs', { params: clean(p) })), // only categoryId, status, keyword
  getById: (id) => u(api.get(`/gigs/${id}`)),
  getByProvider: (pid) => u(api.get(`/gigs/provider/${pid}`)),
  create: (d) => u(api.post('/gigs', d)),
  update: (id, d) => u(api.put(`/gigs/${id}`, d)),
  cancel: (id) => u(api.post(`/gigs/${id}/cancel`)),
};
export const applicationApi = {
  create: (d) => u(api.post('/applications', d)),
  getById: (id) => u(api.get(`/applications/${id}`)),
  getByGig: (gigId) => u(api.get(`/applications/gig/${gigId}`)),
  getByWorker: (wid) => u(api.get(`/applications/worker/${wid}`)),
  withdraw: (id) => u(api.post(`/applications/${id}/withdraw`)),
};
export const bookingApi = {
  accept: (appId) => u(api.post(`/bookings/accept/${appId}`)),
  getById: (id) => u(api.get(`/bookings/${id}`)),
  getByProvider: (pid) => u(api.get(`/bookings/provider/${pid}`)),
  getByWorker: (wid) => u(api.get(`/bookings/worker/${wid}`)),
  updateStatus: (id, status) => u(api.put(`/bookings/${id}/status`, { status })),
};
export const paymentApi = {
  create: (d) => u(api.post('/payments', d)),
  getById: (id) => u(api.get(`/payments/${id}`)),
  getByBooking: (bid) => u(api.get(`/payments/booking/${bid}`)),
};
export const reviewApi = {
  create: (d) => u(api.post('/reviews', d)),
  getByBooking: (bid) => u(api.get(`/reviews/booking/${bid}`)),
  getByUser: (uid) => u(api.get(`/reviews/user/${uid}`)),
};
export const messageApi = {
  // sends both keys until Phase 0 confirms which one the backend reads, then remove the other
  send: ({ gigId, senderId, receiverId, text }) =>
    u(api.post('/messages', { gigId, senderId, receiverId, content: text, body: text })),
  getByGig: (gigId) => u(api.get(`/messages/gig/${gigId}`)),
};
```

Wrap every list result in `toList()` before use.

**Request bodies (from backend docs):**

| Call | Body |
| --- | --- |
| register | `{ fullName, email, phone, password, role }`, role is WORKER or PROVIDER only (never ADMIN) |
| gig create | `{ providerProfileId, categoryId, addressId, title, description, budget: Number, scheduledAt: 'YYYY-MM-DDTHH:mm:ss' }` |
| application create | `{ gigId, workerProfileId, quotedPrice: Number, coverNote }` |
| booking status | `{ status }` where status is IN\_PROGRESS, COMPLETED or CANCELLED |
| payment create | `{ bookingId, amount: Number, method }`, method is CARD, UPI, BANK\_TRANSFER, CASH or WALLET. Backend computes the 10% platform fee |
| review create | `{ bookingId, reviewerId, rating: 1-5 integer, comment }` |
| address create | `{ userId, line1, city, pincode, latitude?, longitude? }` (omit coordinates if empty, never send NaN) |
| worker update | `{ bio, experienceYears, serviceRadiusKm }` (`verificationStatus` is admin-only) |
| provider update | `{ providerType: INDIVIDUAL or BUSINESS, businessName }` |
| category create or update | `{ name, icon, isActive }` |

Unverified bodies, confirm in Phase 0 before building the UI: add worker service (expected `workerId, categoryId, baseRate, rateType` HOURLY or FIXED), add slot (expected `workerId, dayOfWeek 1-7, startTime, endTime` as HH:mm:ss), add document (expected `workerId, docType, fileUrl`; no file upload, URL text input only).

**Which id goes where (the most common source of bugs):**

| Use | Id type |
| --- | --- |
| `providerProfileId`, `gigApi.getByProvider`, `bookingApi.getByProvider` | provider profile id (`profile.id`) |
| `workerProfileId`, `applicationApi.getByWorker`, `bookingApi.getByWorker`, worker sub-resources | worker profile id (`profile.id`) |
| `workerApi.getByUserId`, `providerApi.getByUserId`, `addressApi.getByUserId`, address `userId` | user id (`user.id`) |
| review `reviewerId`, `reviewApi.getByUser`, message `senderId` and `receiverId` | user id (`user.id`) |

## 7. State

**`AuthContext`** exposes `{ user, profile, initializing, profileError, login(email, password), register(payload), logout(), refreshProfile() }`.

- `user` is read synchronously from `localStorage['gigmart_user']` on first render. Store only the user object, never the password.
- On boot, validate with `userApi.getById(user.id)`. On 404, clear storage and log out (database may have been reset). On network failure, keep the cached user and show a toast.
- After user is known, fetch the profile: WORKER uses `workerApi.getByUserId`, PROVIDER uses `providerApi.getByUserId`, ADMIN has none. `initializing` stays true until validation and profile fetch settle, so guards never flash a redirect. If the profile fetch fails, set `profileError`; dashboards show a banner with Retry.
- `register` calls `authApi.register`, then `authApi.login` with the same credentials so the stored user shape is always the login shape.
- `logout` clears storage and state, then navigates to `/login`.

**`ToastContext`** exposes `useToast()` returning `{ success, error, info }`. Top-right stack, auto-dismiss at 4000 ms, manual close, `role='status'`. Clear timers on unmount.

## 8. Routing and guards

Providers order: `BrowserRouter > AuthProvider > ToastProvider > Routes`. All routes render inside `Layout` (Navbar, `<main className='flex-1 pb-16'><Outlet /></main>`, Footer).

| Path | Page | Guard |
| --- | --- | --- |
| `/` | HomePage | public |
| `/gigs` | GigListPage | public |
| `/gigs/create` | CreateGigPage | ProviderRoute |
| `/gigs/:id` | GigDetailPage | public |
| `/login`, `/register` | Login, Register | GuestRoute |
| `/dashboard/provider` | ProviderDashboard | ProviderRoute |
| `/dashboard/worker` | WorkerDashboard | WorkerRoute |
| `/dashboard/admin` | AdminDashboard | AdminRoute |
| `/bookings/:id` | BookingDetailPage | ProtectedRoute |
| `/messages` | MessagesPage | ProtectedRoute |
| `/profile` | ProfilePage | ProtectedRoute |
| `*` | redirect to `/` | none |

Build one generic `RoleRoute({ allow })` and export `ProviderRoute`, `WorkerRoute`, `AdminRoute` as thin wrappers. Behavior: while `initializing` show `LoadingScreen`; no user redirects to `/login` with `state={{ from: location }}` and `replace`; wrong role redirects to that user's own dashboard. `GuestRoute` sends logged-in users to their dashboard. After login, go to `state.from` if present, else the role dashboard (`dashboardPathFor(role)` helper).

## 9. Design system

Monochrome minimalist. Near-black `#0a0a0a`, neutrals, white surfaces. Floating cards (rounded-2xl, border, soft shadow, hover lift). Fixed full-viewport SVG fractal-noise overlay at 2.5% opacity on `body::before` with `pointer-events: none`; `#root` is `position: relative; z-index: 1`. Fonts: Inter body, Outfit headings (`font-heading`).

`@theme` tokens: `--font-sans`, `--font-heading`, `--color-surface`, `--color-accent`, `--color-text-primary`, `--color-text-secondary`, `--color-border`.

| Class | Utilities it applies |
| --- | --- |
| `.card` | rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md |
| `.card-static` | same without the hover lift |
| `.btn` | inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-\[0.98\] disabled:opacity-50 disabled:cursor-not-allowed |
| `.btn-primary` | bg-neutral-950 text-white hover:bg-neutral-800 |
| `.btn-secondary` | bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50 |
| `.btn-danger` | bg-red-600 text-white hover:bg-red-700 |
| `.btn-ghost` | bg-transparent text-neutral-700 hover:bg-neutral-100 |
| `.btn-sm`, `.btn-lg` | smaller or larger padding and text |
| `.input`, `.textarea`, `.select` | w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 |
| `.label` | mb-1.5 block text-sm font-medium text-neutral-700 |
| `.badge` plus `.badge-success`, `-warning`, `-danger`, `-info`, `-default` | pill, text-xs, pastel background with dark text and a border |
| `.animate-fade-in`, `.animate-slide-up`, `.stagger` | keyframe animations; `.stagger > *` uses `nth-child` animation delays of 50 ms steps |

Respect `prefers-reduced-motion` by disabling the animations. Mobile first; verify at 375 px width.

## 10. Shared components

All accept `className`. Props in parentheses.

- `ui/Spinner` (`size` sm, md or lg).
- `ui/LoadingScreen` (`message`, default Loading...).
- `ui/EmptyState` (`icon`, `title`, `description`, `actionText`, `onAction`, `actionLink` which renders a `Link`).
- `ui/Modal` (`isOpen`, `onClose`, `title`, `children`, `maxWidth`). Closes on Escape, backdrop click and the X button. Locks body scroll while open. Moves focus into the dialog, `role='dialog'` and `aria-modal`.
- `ui/ConfirmDialog` (`isOpen`, `title`, `message`, `confirmText`, `onConfirm`, `onCancel`, `loading`). Use for accept bid, cancel gig, cancel booking, delete address.
- `ui/StatusBadge` (`status`, `size`). Mapping: OPEN and ACCEPTED and PAID and VERIFIED and APPROVED success; ASSIGNED and SCHEDULED info; IN\_PROGRESS and PENDING warning; COMPLETED default; REJECTED and CANCELLED and FAILED danger; WITHDRAWN and REFUNDED default. Unknown status renders a default badge with the raw text and never throws.
- `ui/StarRating` (`value`, `onChange`, `readOnly`). Keyboard accessible.
- `ui/ErrorState` (`message`, `onRetry`).
- `gig/GigCard` (`gig`): category, date, title, truncated description, city, formatted budget, status badge. Show an applicant count only if the normalized gig carries one. Whole card links to `/gigs/:id`.
- `layout/Navbar`: sticky, backdrop blur, logo to `/`. Everyone sees Explore Gigs. Guests see Login and Register. PROVIDER sees Post Gig, Dashboard, Messages, Profile. WORKER sees Dashboard, Messages, Profile. ADMIN sees Admin Dashboard and Profile. Logout button. Hamburger drawer under `md`, closes on route change.
- `lib/format.js`: `formatMoney`, `formatDate`, `formatDateTime`, `toBackendDateTime` (turns a `datetime-local` value like `2026-10-15T10:00` into `2026-10-15T10:00:00`), `dashboardPathFor(role)`.

## 11. Pages

**HomePage:** hero, three feature blocks, how-it-works in four steps, CTAs that change by role. No fabricated statistics. If you show a number, it must come from a real call such as the count of OPEN gigs.

**LoginPage:** email and password, inline errors from `err.fieldErrors`, one-click demo buttons for the three seeded accounts that fill and submit.

**RegisterPage:** fullName, email, phone, password, role selector (PROVIDER or WORKER). 409 conflict shows as a toast that email or phone already exists. On success the user lands on their dashboard, and workers get a banner pointing to Profile to add bio, services and availability.

**GigListPage:** keyword (300 ms debounce, sent to the server), category chips from `categoryApi.list(true)`, status select (ALL, OPEN, ASSIGNED, IN\_PROGRESS, COMPLETED, CANCELLED, ALL omits the param), min and max budget inputs applied client-side, Clear Filters, responsive card grid. Ignore stale responses with a request counter.

**GigDetailPage:** shows gig, category, address, budget, schedule, status. Viewer cases:

- Guest: Login to apply.
- Worker: load `applicationApi.getByWorker(profile.id)` and filter by gig. If none and gig is OPEN, show Submit Quote opening a modal (`quotedPrice` greater than 0, `coverNote`). If an application exists, show its status and a Withdraw button only while PENDING. A 409 on duplicate is shown as a toast.
- Provider who owns the gig (compare normalized gig provider id with `profile.id`): list applications from `applicationApi.getByGig`, each with worker name, rating, quote, note, status. For PENDING applications on an OPEN gig show Accept, which opens a ConfirmDialog, calls `bookingApi.accept(app.id)` and navigates to `/bookings/:newBookingId`. Also a Message link to `/messages?gig=<gigId>&with=<workerUserId>` and a Cancel Gig button (OPEN or ASSIGNED only, with confirm).
- Provider who does not own it, and admin: read-only.

**CreateGigPage:** category select (active only), address select from `addressApi.getByUserId(user.id)` plus a quick-add address modal that selects the new address on success, title, description, budget (greater than 0), `datetime-local` schedule that must be in the future. If the provider has no addresses, show an inline prompt to add one before the form is usable. On success go to `/gigs/:id`.

**ProviderDashboard:** metrics derived client-side: active gigs (OPEN), active bookings (SCHEDULED or IN\_PROGRESS), completed jobs value (sum of `agreedPrice` of COMPLETED, labelled as such since payments are separate). Tabs for My Gigs (`gigApi.getByProvider(profile.id)`) and Bookings (`bookingApi.getByProvider(profile.id)`).

**WorkerDashboard:** metrics: quotes submitted, pending quotes, accepted jobs, completed bookings. Tabs for My Applications (`applicationApi.getByWorker`) and Bookings (`bookingApi.getByWorker`). Each application row links to its gig.

**BookingDetailPage:** load the booking. If the current user is neither its provider nor its worker, show a no-access state. Timeline with created, started, completed. Actions follow the state machine:

- SCHEDULED: worker can Start Work (IN\_PROGRESS). Provider or worker can Cancel (with confirm).
- IN\_PROGRESS: worker can Mark Completed.
- Terminal states: no status actions. Payment: load `toList(paymentApi.getByBooking(id))` (handle a single object too). When COMPLETED and no PAID payment exists, the provider sees Record Payment with amount defaulted to `agreedPrice` and a method select. Show a live fee preview (`Math.round(amount * 0.10 * 100) / 100`, labelled estimate; the server value is final) and then show the stored payment. Review: when COMPLETED, each participant can review once. Load `reviewApi.getByBooking`, hide the form if one by `user.id` exists, handle 409 gracefully. Form is StarRating plus comment, `reviewerId` is `user.id`. After every mutation re-fetch the booking, payments and reviews.

**MessagesPage:** a gig thread can contain several workers, so filter fetched messages to those where sender and receiver are exactly the current user and the chosen counterpart. Sidebar conversations are (gig, counterpart) pairs. Worker: from `bookingApi.getByWorker` and `applicationApi.getByWorker`, counterpart is the provider user id (resolve with `providerApi.getById(gig providerId)`, cache results). Provider: from `bookingApi.getByProvider`, counterpart is the worker user id, plus any pair opened via the `?gig=&with=` deep link. Selecting a pair fetches `messageApi.getByGig`. Poll every 5000 ms only while the tab is visible, never start a request while one is in flight, clear the interval on unmount or when the selection changes. Auto-scroll to the newest message with a ref only if the user is already near the bottom. Enter sends, Shift+Enter adds a newline, empty messages are blocked, optimistic append with rollback on error.

**ProfilePage:** account card (name, email, phone, role, verified, average rating). Worker: edit bio, experienceYears, serviceRadiusKm; manage services (category, baseRate, rateType), weekly availability slots, and document records by URL. Provider: edit providerType and businessName. All roles: address list with add and delete (confirm), and reviews received via `reviewApi.getByUser(user.id)`. Call `refreshProfile()` after profile edits.

**AdminDashboard:** tabs for Users (filter by role, Verify button), Workers (filter by verification status, change status through `workerApi.update`), Categories (list with `activeOnly=false`, create, edit, deactivate).

## 12. Cross-cutting rules

**Fetch pattern (use everywhere):**

```jsx
useEffect(() => {
  let ignore = false;
  setLoading(true); setError(null);
  gigApi.list(params)
    .then((d) => { if (!ignore) setGigs(toList(d)); })
    .catch((e) => { if (!ignore) setError(e.message); })
    .finally(() => { if (!ignore) setLoading(false); });
  return () => { ignore = true; };
}, [params]);
```

**Submit pattern:** disable the button and show `Spinner` while submitting, `try/catch/finally`, success toast, error toast with `err.message`, and map `err.fieldErrors` onto fields. Never leave a button stuck disabled after an error.

**Other rules:**

- Dates: backend `LocalDateTime` strings have no timezone. Display with `Intl.DateTimeFormat`. Send with `toBackendDateTime`.
- Money: store numbers, send `Number`, format only for display. Reject NaN and values of 0 or less.
- Never render a raw object or `undefined`. Use optional chaining and fallbacks like a dash.
- Lists always use stable `key={item.id}`.
- No `dangerouslySetInnerHTML`. Escape nothing manually, rely on React.
- Do not store anything sensitive in `localStorage`.
- A global `ErrorBoundary` wraps `Routes` and shows a friendly fallback.
- No `console.log` left in the final code.

## 13. Milestones and gates

1. **M0 Probe:** section 4 complete. Gate: `docs/api-samples/` populated and `DECISIONS.md` written.
2. **M1 Scaffold and design system:** setup, `index.css`, primitives, `format.js`. Gate: `npm run build` passes and a temporary showcase of every primitive renders correctly (remove it afterward).
3. **M2 API, state, routing, layout, auth pages:** Gate: all three seeded accounts log in and land on the right dashboards, refresh keeps the session, a deleted user in storage logs out cleanly, wrong-role URLs redirect, no redirect flash on reload.
4. **M3 Gigs:** list, detail, create. Gate: provider creates a gig with a new address and sees it in the list.
5. **M4 Bidding and booking:** apply, withdraw, accept. Gate: worker applies, provider accepts, other bids show REJECTED, gig shows ASSIGNED, redirect lands on the booking.
6. **M5 Booking detail:** status transitions, payment, review. Gate: full SCHEDULED to COMPLETED, payment recorded, both reviews posted, ratings visible on Profile.
7. **M6 Messages:** Gate: two browser sessions chat within 5 seconds, no duplicate pollers (check the Network tab), no requests after leaving the page.
8. **M7 Profile and admin:** Gate: every form saves and re-renders from server data.
9. **M8 Polish:** 375 px layout, keyboard navigation, focus rings, empty and error states, `npm run lint` clean, `npm run build` clean.

## 14. Acceptance walkthrough

Run in a real browser against the live backend. Zero console errors or warnings.

1. Log in as admin, verify the worker user, create a test category, deactivate it.
2. Register a new provider and a new worker in two separate browser profiles.
3. Provider adds an address and posts a gig. It appears in the public list and passes the keyword, category and budget filters.
4. Worker finds the gig, applies, sees PENDING, withdraws, tries to reapply (expect a clear duplicate message or a re-open path that matches the backend), then applies again with the seeded worker as a second bidder if needed.
5. Provider sees both quotes, messages one worker, accepts one. Booking opens, the gig is ASSIGNED, the other quote is REJECTED.
6. Worker starts work and completes it. Provider records payment and the fee preview matches the stored fee.
7. Both sides post a review. A second review attempt is blocked. Average rating appears on each Profile.
8. Cancel path: create another gig, accept a bid, cancel the booking while SCHEDULED, and confirm no further status actions appear.
9. Stop the backend and confirm friendly error states with Retry, then restart it and confirm recovery.
10. `npm run build && npm run preview` and repeat steps 1 to 3 against the production bundle.

## 15. Out of scope

File uploads, push or email notifications, disputes and refunds, direct hire, portfolio photos, coupons, gig edit UI, TypeScript, automated test framework (optional extra), WebSockets. Do not add them. If you finish early, spend the time on section 13 M8 polish, not on new features.

## 16. Final report format

When finished, output: what was built per milestone, the contents of `DECISIONS.md`, every place where the backend behaved differently from the docs, the exact commands to run the app, and anything you could not verify.
