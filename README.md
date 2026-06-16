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

## Live Deployments

- **Backend API & Swagger:** [https://byepo.onrender.com/_api/docs/#/](https://byepo.onrender.com/_api/docs/#/)
- **Super Admin Portal:** [https://byepo-admin.netlify.app/](https://byepo-admin.netlify.app/)
- **Organization Admin Portal:** [https://bypepo-org.netlify.app/](https://bypepo-org.netlify.app/)
- **End User Portal:** [https://byepo-check.netlify.app/](https://byepo-check.netlify.app/)

### Super Admin Credentials
- **Email:** `admin@byepo.com`
- **Password:** `admin123`
