# Byepo - Feature Flag Management System

Multi-tenant feature flag SaaS with 3 separate frontends + Node.js backend.

## Project Structure
```
byepo/
├── server/              # Express + SQLite backend
│   ├── dao/             # Data access layer
│   ├── routes/          # API routes (auth, org, flag)
│   ├── middleware/      # auth + error handling
│   └── tests/           # Integration tests
├── byepo-admin/         # Super Admin frontend (create orgs)
├── byepo-org/           # Org Admin frontend (manage flags)
├── byepo-check/         # End User frontend (check flag status)
└── package.json         # Root scripts
```

## How to Run

```bash
# 1. Install dependencies
npm install
cd server && npm install
cd ../byepo-admin && npm install
cd ../byepo-org && npm install
cd ../byepo-check && npm install
cd ..

# 2. Start everything (recommended)
npm run dev
```
