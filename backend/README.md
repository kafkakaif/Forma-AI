
## Step 0: Prerequisites

- **Node.js 18 or newer.** Check with `node -v`.
- **MongoDB**, either:
  - **MongoDB Atlas** (free cloud database, easiest): create a cluster, add a database user, allow your IP, and copy the connection string.
  - **Local MongoDB**: install MongoDB Community. Your connection string is `mongodb://127.0.0.1:27017/forma_ai`.
- **MongoDB Compass** (optional). It lets you view and edit documents, which helps with the "DONE when" test.

---

## Step 1: Create the Express server

```bash
clone repo
mkdir backend && cd backend
npm init -y
npm install express mongoose cors dotenv
npm install -D nodemon
```

In `package.json`, add `"type": "module"` and these scripts:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "seed": "node src/seed/seedInsuranceClaim.js"
  }
}
```

Create this folder structure:

```
backend/
├── .env
└── src/
    ├── server.js
    ├── config/db.js
    ├── models/FormSchema.js
    ├── controllers/formController.js
    ├── routes/formRoutes.js
    └── seed/seedInsuranceClaim.js
```
