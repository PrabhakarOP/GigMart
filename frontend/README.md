# GigMart — Frontend Application

GigMart is an on-demand local gig marketplace web application built with modern React. The platform connects service clients (**PROVIDERS**) with skilled independent professionals (**WORKERS**), with administrative oversight (**ADMIN**).

Providers post localized gigs, workers submit competitive price bids and cover notes, providers accept quotes into confirmed bookings, and both parties track job execution through completion, payments (with automated 10% platform fee calculation), and verified two-way rating reviews.

---

## 🚀 Tech Stack

* **Core Framework:** [React 19](https://react.dev/) (JavaScript / JSX)
* **Build Tool & Dev Server:** [Vite 6](https://vitejs.dev/) with native ES modules
* **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite` without PostCSS or legacy configuration)
* **Routing:** [React Router v7](https://reactrouter.com/) (`react-router-dom`)
* **HTTP Client:** [Axios](https://axios-http.com/) (encapsulated within a dedicated API service layer)
* **Iconography:** [Lucide React](https://lucide.dev/)
* **Typography:** Inter (body) & Outfit (headings) via Google Fonts
* **Code Quality:** [ESLint 9](https://eslint.org/) Flat Config (`eslint.config.js`)

---

## 📋 Prerequisites & Backend Requirements

The frontend interfaces with the GigMart Spring Boot backend. Ensure the backend environment is active before launching the frontend:

1. **MySQL Server:** Listening on port `3306` with database `gigmart_db`.
2. **Spring Boot Backend:** Running on `http://localhost:8081` with base API path `/api/v1`.
3. **Node.js:** v18.0.0 or higher (v20+ recommended).

To check if the backend is reachable:
```bash
curl -s http://localhost:8081/api/v1/categories
```

---

## 🛠️ Getting Started

### 1. Installation

From the `frontend/` directory, install all required dependencies:

```bash
npm install
```

### 2. Development Server

Start the local Vite dev server with automated proxying for `/api` requests to `http://localhost:8081`:

```bash
npm run dev
```

The application will be available at: **`http://localhost:3000`**

### 3. Linting

Run ESLint to check for syntax, hook rules, and code standard compliance:

```bash
npm run lint
```

### 4. Production Build & Preview

Compile the optimized static bundle into `dist/` and test it with Vite's preview server:

```bash
npm run build
npm run preview
```

---

## 🔑 Default Seeded Accounts

The backend database initializer creates three test accounts for immediate verification:

| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@gigmart.com` | `admin123` | `/dashboard/admin` |
| **PROVIDER** | `provider@gigmart.com` | `provider123` | `/dashboard/provider` |
| **WORKER** | `worker@gigmart.com` | `worker123` | `/dashboard/worker` |

> [!TIP]
> The login page at `/login` provides **One-Click Demo Buttons** that automatically fill and submit credentials for each seeded account.

---

## 📁 Project Directory Structure

```text
frontend/
├── docs/
│   └── api-samples/            # 38 live probed response JSON fixtures
├── scripts/
│   ├── probe-api.mjs           # Phase 0 automated endpoint contract probe
│   ├── verify-flow.mjs         # Seeded account verification script
│   └── acceptance-walkthrough.mjs # Complete 8-step lifecycle walkthrough test
├── src/
│   ├── api/
│   │   ├── client.js           # Axios instance with envelope unwrap & error mapping
│   │   ├── services.js         # Domain-driven API service modules (clean parameters)
│   │   ├── types.js            # JSDoc type definitions
│   │   └── normalizers.js      # Raw DTO to clean UI entity normalizers
│   ├── components/
│   │   ├── auth/
│   │   │   └── Guards.jsx      # RoleRoute, ProtectedRoute, GuestRoute guards
│   │   ├── gig/
│   │   │   └── GigCard.jsx     # Reusable gig card component
│   │   ├── layout/
│   │   │   ├── Navbar.jsx      # Sticky responsive navigation with mobile drawer
│   │   │   ├── Footer.jsx      # Global footer component
│   │   │   └── Layout.jsx      # Main layout wrapper
│   │   └── ui/
│   │       ├── ConfirmDialog.jsx # Accessible confirmation modal dialog
│   │       ├── EmptyState.jsx    # Configurable zero-data state
│   │       ├── ErrorBoundary.jsx # Global React component error boundary
│   │       ├── ErrorState.jsx    # Fetch failure retry card
│   │       ├── LoadingScreen.jsx # Full-view spinner placeholder
│   │       ├── Modal.jsx         # Dialog with focus-trap and scroll lock
│   │       ├── Spinner.jsx       # SVG loading indicator
│   │       ├── StarRating.jsx    # Keyboard-accessible rating component
│   │       └── StatusBadge.jsx   # Monochrome/pastel lifecycle badge
│   ├── context/
│   │   ├── AuthContext.jsx     # Session persistence, user/profile resolution
│   │   └── ToastContext.jsx    # Auto-dismissing notification toasts
│   ├── lib/
│   │   └── format.js           # Currency (INR), date, datetime, and routing helpers
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx   # Sign in with seeded shortcuts
│   │   │   └── RegisterPage.jsx# Registration with role toggle (Worker / Provider)
│   │   ├── bookings/
│   │   │   └── BookingDetailPage.jsx # State transitions, payment, reviews
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx    # User verification, worker status, categories
│   │   │   ├── ProviderDashboard.jsx # Active gigs, bookings, completed metrics
│   │   │   └── WorkerDashboard.jsx   # Applications, bookings, earnings metrics
│   │   ├── gigs/
│   │   │   ├── CreateGigPage.jsx     # Address selector, quick-add modal, schedule
│   │   │   ├── GigDetailPage.jsx     # Public view, worker bidding, provider quotes
│   │   │   └── GigListPage.jsx       # Debounced search, category chips, budget filter
│   │   ├── messages/
│   │   │   └── MessagesPage.jsx      # Chat threads, 5s polling, optimistic append
│   │   ├── profile/
│   │   │   └── ProfilePage.jsx       # Bio, rates, availability slots, addresses, reviews
│   │   └── HomePage.jsx        # Landing hero, real live statistics, how-it-works
│   ├── App.jsx                 # Route table and provider hierarchy
│   ├── index.css               # Tailwind v4 import, theme tokens, animations
│   └── main.jsx                # React 19 root entrypoint
├── DECISIONS.md                # Phase 0 discovered contracts and decisions
├── ARCHITECTURE.md             # In-depth architectural specification
├── AGENTS.md                   # AI agent maintenance and extension instructions
├── API_INTEGRATION.md          # Comprehensive backend REST API contract guide
├── eslint.config.js            # ESLint flat config
├── package.json
└── vite.config.js
```

---

## 🧪 Testing & Verification

Run the automated end-to-end integration walkthrough against the live backend:

```bash
node scripts/acceptance-walkthrough.mjs
```

This script executes all 8 lifecycle steps from Section 14 of the build specification:
1. Admin user verification and category toggling
2. Fresh Provider and Worker user registration
3. Provider address creation and gig posting
4. Worker bidding, quote withdrawal, and reapply handling
5. Multi-quote review, messaging, and bid acceptance
6. Worker status advancement (`IN_PROGRESS` -> `COMPLETED`) and payment with 10% fee confirmation
7. Two-way reviews and duplicate rejection verification
8. Full gig and booking cancellation workflow

