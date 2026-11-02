<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-LangChain-orange" />
  <img src="https://img.shields.io/badge/WebApp-React-blueviolet?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?logo=github" />
</p>

<p align="center">
  <i>"Turning complex forms into intelligent, conversational workflows."</i>
</p>

---

## 📌 Overview

**Forma AI** is an AI-powered dynamic form engine designed to simplify complex and branching forms used in domains such as **Insurance, Healthcare, Finance, and Enterprise Workflow Automation**.

Instead of forcing users to manually complete dozens of form fields, Forma AI allows them to describe their situation using natural language.

The system uses an **LLM to extract structured information** from the user's description and automatically populates the corresponding fields in a dynamically generated React form.

---


## Features

- Generate form schemas from natural-language prompts with Ollama
- Build and manage forms with sections, common field types, validation, and conditional logic
- Extract suggested field values from a natural-language description
- Save drafts and submit validated form responses
- Review forms, submissions, and analytics in the application dashboard
- Sign in with Google when OAuth is configured
- Start from included insurance claim and patient intake form examples

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| AI | LangChain, Ollama (Qwen model by default) |
| Deployment | Docker Compose, Nginx, Caddy |

## Run locally

### Prerequisites

- Node.js 22 or newer and npm
- MongoDB, local or hosted
- Ollama for AI form generation and extraction

### Start MongoDB and configure the backend

1. Start MongoDB and note its connection URI. For a local MongoDB instance, the default is `mongodb://127.0.0.1:27017/forma_ai`.
2. Create the backend environment file:

   ```bash
   cd backend
   cp .env.example .env
   ```

   In PowerShell, use `Copy-Item .env.example .env`.

3. Set `MONGO_URI` in `backend/.env`. Configure `CORS_ORIGINS` if your frontend uses an origin other than the defaults (`http://localhost:5173` and `http://localhost:3000`).
4. Install dependencies, seed the example forms, and start the API:

   ```bash
   npm install
   npm run seed
   npm run dev
   ```

   The seed script creates/replaces the included `insurance_claim`, `health-intake`, and `insurance-claim` forms.

### Start the frontend

In another terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>. The API health check is at <http://localhost:5000/api/health>.

For AI features, install and start Ollama, download the configured model (`qwen3.5:4b` by default), and ensure the backend can reach its Ollama endpoint. For Google sign-in, set `GOOGLE_CLIENT_ID` in the backend environment and `VITE_GOOGLE_CLIENT_ID` for the frontend build.

## Run with Docker Compose

The Compose stack builds the frontend and backend, starts MongoDB, and serves the app through Caddy over HTTPS. Caddy requires a domain name that resolves to this machine.

1. Create a private deployment environment file:

   ```bash
   Copy-Item deployment/.env.production.example deployment/.env.production
   ```

   Or use `cp deployment/.env.production.example deployment/.env.production` in a POSIX shell.

2. Edit `deployment/.env.production`. Set `DOMAIN` to your domain and `CORS_ORIGINS` to its HTTPS origin. Set `GOOGLE_CLIENT_ID` if enabling Google sign-in. Keep this file private and do not commit it.
3. Start the stack from the repository root:

   ```bash
   docker compose --env-file deployment/.env.production up --build -d
   ```

4. Open `https://<your-domain>`. Check the API at `https://<your-domain>/api/health`.

The detailed DigitalOcean deployment instructions are in [deployment/README.md](deployment/README.md).

### Configuration

| Variable | Purpose | Default |
|---|---|---|
| `DOMAIN` | Public hostname used by Caddy; required for Compose | — |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo:27017/forma_ai` in Compose |
| `CORS_ORIGINS` | Comma-separated allowed browser origins | `http://localhost:5173,http://localhost:3000` in the backend |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for backend verification and frontend build | Disabled when empty |
| `VITE_API_URL` | Frontend API base URL | `/api` in the Docker image |
| `OLLAMA_BASE_URL` | Ollama endpoint reachable from the backend | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Ollama model used for AI requests (local backend; Compose uses the default) | `qwen3.5:4b` |
| `PORT` | Backend HTTP port | `5000` |

The backend `.env.example` contains local development settings. The deployment template is [deployment/.env.production.example](deployment/.env.production.example). In the Compose network MongoDB is not published to the host. Point `OLLAMA_BASE_URL` at an Ollama service reachable by the backend container; `127.0.0.1` inside that container is not the host machine.

### Stop the app

Stop the foreground Compose process with `Ctrl+C`, or stop a detached deployment with:

```bash
docker compose --env-file deployment/.env.production down
```

This removes containers but keeps MongoDB data in its named volume. Do **not** add `-v` unless you intend to permanently delete that data.

## API

All endpoints are served under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API availability |
| POST | `/api/auth/google` | Verify a Google sign-in credential |
| GET | `/api/forms` | List saved forms |
| POST | `/api/forms` | Create a form |
| POST | `/api/forms/save` | Create or update a form by slug |
| GET | `/api/forms/:id` | Get a form by slug or MongoDB ID |
| PUT | `/api/forms/:id` | Update a form |
| POST | `/api/forms/:id/validate` | Validate response values without saving |
| POST | `/api/forms/:id/submit` | Validate and save a form response |
| POST | `/api/submissions/draft` | Save a draft |
| GET | `/api/submissions` | List submissions |
| GET | `/api/submissions/:id` | Get one submission |
| PUT | `/api/submissions/:id/draft` | Update a draft |
| POST | `/api/submissions/:id/submit` | Validate and submit a saved draft |
| POST | `/api/ai/generate` | Generate a form schema from a prompt |
| POST | `/api/ai/extract` | Extract values from text for form fields |

## Tests and checks

Run the backend unit tests:

```bash
cd backend
npm test
```

Build and lint the frontend:

```bash
cd frontend
npm run build
npm run lint
```

## Project structure

```text
Forma-AI/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── models/       # Form and submission models
│   │   ├── routes/       # Auth, AI, form, and submission APIs
│   │   ├── seed/         # Example form definitions and seed script
│   │   ├── services/     # AI and form services
│   │   └── shared/       # Conditional logic and validation rules
│   └── test/             # Backend unit tests
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared layout and dynamic form UI
│   │   ├── pages/        # Application pages
│   │   └── services/     # Frontend API and AI helpers
│   └── Dockerfile
├── deployment/           # Caddy configuration and deployment scripts
├── compose.yaml          # Frontend, backend, MongoDB, and Caddy
└── README.md
```
