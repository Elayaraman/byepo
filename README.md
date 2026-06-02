# Byepo — Feature Flag Management System

A multi-tenant feature flag platform with role-based access. Super admins manage organizations, org admins manage flags, and end users check flag status — all through three dedicated frontend applications backed by a single Express API.

---

## Architecture Decisions & Engineering Trade-Offs

This project is structured as a light, clean monorepo designed for rapid local setup and clear separation of concerns.

### 1. Simple Monorepo Structure (No Complex Tooling)
* **Decision:** We used standard Node/npm scripts without Lerna, Nx, or Turborepo.
* **Trade-Off:** Keeps the learning curve and dependencies extremely low for evaluators. Everything runs with a single `npm start` command from the root.

### 2. SQLite Database (File-Based)
* **Decision:** SQLite is used as the relational database engine.
* **Trade-Off:** Zero installation or external service dependency (no Docker, Postgres, or MySQL to configure). The DB is initialized and run completely in-memory or in a local file, making evaluation seamless.

### 3. Shared Folder Code Abstraction
* **Decision:** Abstracted common validation logic (`validators.js`) and UI components (`FormField.jsx`, `OrgSelector.jsx`, etc.) into a top-level `/shared` folder.
* **Trade-Off:** Increases code reuse across all three applications. In Tailwind CSS v4, this required specifying custom `@source "../../shared"` directives so that utility classes are scanned and compiled correctly from external sibling directories.

### 4. Namespaced Localhost Cookies
* **Decision:** Scoped cookies specifically (`super_admin_token` and `org_admin_token`) instead of generic `token` names.
* **Trade-Off:** Since Vite apps run on different localhost ports (e.g. 5173, 5174, 5175), cookies share the same `localhost` domain scope. Namespacing them prevents active sessions in one app from overwriting and logging out active sessions in another.

---

## Architecture

```
byepo/
├── server/               Express + SQLite backend
│   ├── routes/            auth, org, flag routers
│   ├── dao/               Database access layer
│   ├── middleware/         JWT auth, error handler
│   ├── services/          auth, db, logger
│   └── test/              49 unit tests
├── byepo-admin/           Super Admin UI (React + Vite)
├── byepo-org/             Org Admin UI (React + Vite)
├── byepo-check/           Public Flag Checker (React + Vite)
└── shared/                Shared validators & components
    ├── validators.js       isValidOrgName, isValidFlagName, cookie utils
    └── components/         ErrorBanner, FormField, OrgSelector, etc.
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5, SQLite3 |
| Auth | Custom JWT + bcrypt (no third-party providers) |
| Frontend | React 18, Vite, Tailwind CSS |
| Testing | Node.js built-in test runner (49 tests) |
| API Docs | Swagger UI at `/_api/docs` |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**

### Install Dependencies

```bash
# Root (concurrently)
npm install

# Server
cd server && npm install && cd ..

# Frontends
cd byepo-admin && npm install && cd ..
cd byepo-org && npm install && cd ..
cd byepo-check && npm install && cd ..
```

### Run Everything

From the project root:

```bash
npm start
```

This starts all four processes concurrently:

| Service | URL |
|---|---|
| API Server | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/_api/docs |
| byepo-admin | http://localhost:5173 |
| byepo-org | http://localhost:5174 |
| byepo-check | http://localhost:5175 |

> **Note:** Vite proxies `/_api/*` requests to the backend, so frontends use relative paths — no CORS issues in dev.

You can also run individual pieces:

```bash
npm run start:server    # Backend only
npm run start:admin     # byepo-admin only
npm run start:org       # byepo-org only
npm run start:check     # byepo-check only
```

### Run Tests

```bash
npm test
```

Runs 49 backend tests covering auth, org CRUD, flag CRUD, cascade deletes, validators, and error handling.

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@byepo.com` | `admin123` |

These can be overridden by creating `server/.env.admin`:

```env
ADMIN_EMAIL=custom@email.com
ADMIN_PASSWORD=custom_password
```

---

## Walkthrough — Full Feature Flow

### Flow 1: Super Admin creates an Organization

1. Open **byepo-admin** at `http://localhost:5173`
2. Login with `admin@byepo.com` / `admin123`
3. Type an org name (single word, e.g. `acme`) in the input and click **Create Org**
4. The org appears in the list with a generated **Invite Code**
5. Use the **search bar** to filter organizations by name
6. Click **Rotate Code** to invalidate the old invite code and generate a new one
7. Click **Delete** to permanently remove an org (cascades to its users and flags)

### Flow 2: Org Admin signs up and manages flags

1. Open **byepo-org** at `http://localhost:5174`
2. Enter the org name (e.g. `acme`) → click **Continue**
3. Switch to the **Sign Up** tab
4. Enter email, password, and the **invite code** from the admin dashboard
5. After signup, you're logged in as an org admin
6. Type a flag key (e.g. `dark-mode`) → click **Add Flag** — flags default to **enabled**
7. Click the **Enabled**/**Disabled** toggle to flip a flag's state
8. Click **Delete** to remove a flag

> **Note:** After an org admin signs up, the invite code **auto-rotates** — the next admin needs a new code from the super admin.

### Flow 3: End user checks a flag

1. Open **byepo-check** at `http://localhost:5175`
2. Enter the Organization Name (e.g. `acme`) and the Feature Key (e.g. `dark-mode`).
   * *Alternatively*, open `http://localhost:5175/?org=acme&name=dark-mode` to prefill the fields automatically.
3. Check the terms agreement checkbox.
4. Click **Check Status**.
5. The result shows **Feature is enabled** or **Feature is disabled**.

> No authentication required — this is a public endpoint.

### Flow 4: Cascade delete & session eviction

1. In **byepo-admin**, delete an org that has logged-in admins
2. The org's users and feature flags are automatically deleted (SQL `ON DELETE CASCADE`)
3. Any org admin currently logged in with a JWT for that org gets a **401** on their next request
4. The frontend automatically logs them out and redirects to the org selection screen

### Flow 5: Validation

| Input | Rule |
|---|---|
| Org name | Single word, no spaces (`^\S+$`) |
| Flag name | Lowercase letters, numbers, hyphens, underscores only (`^[a-z0-9_-]+$`) |
| Email | Standard email format (HTML5 + backend check) |

Validation runs on **both** client (HTML5 pattern + JS) and server (shared `validators.js`).

---

## API Reference

All routes are prefixed with `/_api`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Login (super admin or org admin) |
| `POST` | `/auth/signup` | — | Sign up as org admin (requires invite code) |

### Organizations

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/org/public/:name` | — | Public org lookup by name |
| `POST` | `/org` | Super Admin | Create organization |
| `GET` | `/org` | Super Admin | List all organizations |
| `GET` | `/org/:id` | Super Admin | Get organization by ID |
| `PUT` | `/org/:id` | Super Admin | Update organization name |
| `DELETE` | `/org/:id` | Super Admin | Delete organization (cascades) |
| `POST` | `/org/:id/rotate-code` | Super Admin | Rotate invite code |

### Feature Flags

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/flag/check` | — | Public: check if a flag is enabled |
| `POST` | `/flag` | Org Admin | Create feature flag |
| `GET` | `/flag` | Org Admin | List flags for the admin's org |
| `PUT` | `/flag/:id` | Org Admin | Update flag (toggle, rename) |
| `DELETE` | `/flag/:id` | Org Admin | Delete feature flag |

Full interactive docs available at **http://localhost:3000/_api/docs** (Swagger UI).

---

## Project Structure — Frontend Components

### Shared (`shared/components/`)

| Component | Purpose |
|---|---|
| `ErrorBanner` | Red error message box |
| `FormField` | Labeled input field (label + input) |
| `LoadingSpinner` | Loading state display |
| `OrgSelector` | Org name entry form |
| `InvalidOrg` | "Org not found" screen |

### byepo-admin (`byepo-admin/src/`)

```
App.jsx              → Auth state, routes to LoginPage or Dashboard
components/
  LoginPage.jsx      → Super admin login form
  Dashboard.jsx      → Create org, search, org list
  OrgList.jsx        → Maps over OrgCard
  OrgCard.jsx        → Single org row (name, code, rotate, delete)
```

### byepo-org (`byepo-org/src/`)

```
App.jsx              → Org lookup, auth state, routes screens
components/
  AuthPanel.jsx      → Tabbed login/signup form
  FlagDashboard.jsx  → Create flag form + flag list
  FlagList.jsx       → Maps over FlagRow
  FlagRow.jsx        → Single flag (name, toggle, delete)
```

### byepo-check (`byepo-check/src/`)

```
App.jsx              → Org lookup, routes screens
components/
  FlagChecker.jsx    → Flag key input + result display
```

---

## Cookie Strategy

Each frontend uses a **namespaced cookie** to avoid `localhost` domain collisions:

| App | Cookie Name |
|---|---|
| byepo-admin | `super_admin_token` |
| byepo-org | `org_admin_token` |

Auth tokens are sent via the `Authorization: Bearer` header in all API calls. Cookies are only used for local session persistence.

---

## Database Schema

```sql
-- Organizations
CREATE TABLE org (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  inviteCode TEXT NOT NULL
);

-- Users (org admins)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES org(id) ON DELETE CASCADE,
  UNIQUE(org_id, email)
);

-- Feature flags
CREATE TABLE feature_flags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (org_id) REFERENCES org(id) ON DELETE CASCADE,
  UNIQUE(org_id, name)
);
```

`ON DELETE CASCADE` ensures that deleting an org automatically removes all its users and flags.
