# GigMart Frontend: AI Agent Instructions & Guidelines

This document provides definitive instructions, rules, and best practices for future AI agents and software engineers extending or maintaining the GigMart frontend application.

---

## 1. Golden Rules (Non-Negotiable)

1. **No JWT or Auth Headers:** The backend session uses user identity mapping without bearer tokens. **Never send an `Authorization` header** and **never read `gigmart_token`**. Authentication and authorization guards are UX-only.
2. **Never Import Axios in Components:** All API interactions MUST go through `src/api/services.js`.
3. **Never Expect Nested `.data.data`:** `src/api/services.js` returns already-unwrapped payloads. Components must consume data directly or pass it through `src/api/normalizers.js`.
4. **All Lists Use `toList()`:** Endpoints might return an array or empty value. Wrap all list responses using `toList(v)` (e.g. `const items = toList(res).map(normalizeGig);`).
5. **No Invented Endpoints or Fields:** Only use the endpoints defined in `src/api/services.js` and confirmed by Phase 0 contract tests.
6. **Every Interactive Element Requires a Stable ID:** Every button, input, select, link, and modal trigger must have a unique, stable `id` attribute (e.g. `id="gig-submit-btn"`, `id="login-email"`).
7. **Every Data View Must Handle 3 States:**
   * Loading (using `<Spinner />` or `<LoadingScreen />`)
   * Error (using `<ErrorState message={error} onRetry={loadFn} />`)
   * Empty (using `<EmptyState title="..." description="..." />`)
8. **Always Clean Up Effects:** React StrictMode executes effects twice in development. Every `useEffect` that fetches or polls MUST implement cleanup via `ignore = true` or `clearInterval`.
9. **Enums are Uppercase Strings:** Use exact strings: `'OPEN'`, `'ASSIGNED'`, `'IN_PROGRESS'`, `'COMPLETED'`, `'CANCELLED'`, `'PENDING'`, `'ACCEPTED'`, `'REJECTED'`, `'WITHDRAWN'`.

---

## 2. ID Mapping Reference Table (Critical)

Passing the wrong ID type is the most common bug in this codebase. Consult this table before writing any API call:

| Parameter / Field Name | Expected ID Type | Example Source |
| :--- | :--- | :--- |
| `providerProfileId` | Provider Profile ID (`UUID`) | `profile.id` (when `user.role === 'PROVIDER'`) |
| `workerProfileId` | Worker Profile ID (`UUID`) | `profile.id` (when `user.role === 'WORKER'`) |
| `gigApi.getByProvider(pid)` | Provider Profile ID (`UUID`) | `profile.id` |
| `bookingApi.getByProvider(pid)` | Provider Profile ID (`UUID`) | `profile.id` |
| `applicationApi.getByWorker(wid)` | Worker Profile ID (`UUID`) | `profile.id` |
| `bookingApi.getByWorker(wid)` | Worker Profile ID (`UUID`) | `profile.id` |
| `workerApi.addService`, `addSlot`, `addDocument` | Worker Profile ID (`UUID`) | `profile.id` |
| `workerApi.getByUserId(uid)` | User Account ID (`UUID`) | `user.id` |
| `providerApi.getByUserId(uid)` | User Account ID (`UUID`) | `user.id` |
| `addressApi.getByUserId(uid)` | User Account ID (`UUID`) | `user.id` |
| `addressApi.create({ userId })` | User Account ID (`UUID`) | `user.id` |
| `reviewApi.create({ reviewerId })` | User Account ID (`UUID`) | `user.id` |
| `reviewApi.getByUser(uid)` | User Account ID (`UUID`) | `user.id` |
| `messageApi.send({ senderId, receiverId })` | User Account IDs (`UUID`) | `user.id` and counterpart `user.id` |

---

## 3. Standard Code Patterns

### Pattern A: Data Fetching with Cleanup

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const raw = await gigApi.list({ status: 'OPEN' });
    setData(toList(raw).map(normalizeGig));
  } catch (err) {
    setError(err.message || 'Failed to load gigs');
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  let ignore = false;
  fetchData();
  return () => {
    ignore = true;
  };
}, [fetchData]);
```

### Pattern B: Form Submission with Validation and Toasts

```jsx
const [submitting, setSubmitting] = useState(false);
const [fieldErrors, setFieldErrors] = useState({});
const { success, error: toastError } = useToast();

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setFieldErrors({});

  try {
    await gigApi.create(payload);
    success('Gig posted successfully!');
    navigate('/gigs');
  } catch (err) {
    if (err.fieldErrors) {
      setFieldErrors(err.fieldErrors);
    }
    toastError(err.message || 'Operation failed');
  } finally {
    setSubmitting(false); // Never leave button stuck disabled!
  }
};
```

### Pattern C: Confirmation Dialogs

For destructive or terminal lifecycle actions (e.g. accepting a bid, cancelling a gig, cancelling a booking, deleting an address):
```jsx
const [confirmOpen, setConfirmOpen] = useState(false);
const [loading, setLoading] = useState(false);

<ConfirmDialog
  isOpen={confirmOpen}
  title="Cancel Gig Listing?"
  message="Are you sure you want to cancel this gig? It will no longer accept quotes."
  confirmText="Yes, Cancel Gig"
  danger
  loading={loading}
  onConfirm={handleCancel}
  onCancel={() => setConfirmOpen(false)}
  id="cancel-gig-confirm"
/>
```

---

## 4. How to Add a New Page / Route

1. **Create the Page Component:** Inside `src/pages/<domain>/<PageName>.jsx`.
2. **Implement Error & Empty States:** Ensure all loading, error, and empty views are handled.
3. **Register Route in `src/App.jsx`:**
   * Public: Direct `<Route path="..." element={<Page />} />` inside `<Layout />`.
   * Protected: Wrap with `<ProtectedRoute>`, `<ProviderRoute>`, `<WorkerRoute>`, or `<AdminRoute>`.
4. **Update Navigation:** If accessible from the header, add navigation links to `src/components/layout/Navbar.jsx`.
5. **Verify:** Run `npm run lint` and `npm run build`.

---

## 5. Verification Commands

Before concluding any code modifications, always run:

```bash
# 1. Verify ESLint rules (must output 0 errors, 0 warnings)
npm run lint

# 2. Verify static production build (must compile without Vite errors)
npm run build

# 3. (Optional) Run full lifecycle integration test
node scripts/acceptance-walkthrough.mjs
```

