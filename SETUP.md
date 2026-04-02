# 🔥 Phoenix Inventory — Developer Setup Guide

> **This guide gets any team member from zero to a fully running local environment in under 10 minutes.**
> Follow every step in order. Do not skip sections.

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Environment Configuration](#3-environment-configuration)
4. [Running with Docker (Recommended)](#4-running-with-docker-recommended)
5. [Running Without Docker (Manual)](#5-running-without-docker-manual)
6. [Database: Migrations & Seeds](#6-database-migrations--seeds)
7. [Testing](#7-testing)
8. [API Reference](#8-api-reference)
9. [Project File Structure](#9-project-file-structure)
10. [CI/CD Pipeline Overview](#10-cicd-pipeline-overview)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

Install these tools **before** anything else. Verify each one with the command shown.

| Tool | Minimum Version | Verify |
|------|----------------|--------|
| **Git** | 2.x | `git --version` |
| **Node.js** | 20.x LTS | `node --version` |
| **npm** | 9.x+ | `npm --version` |
| **Docker Desktop** | Latest | `docker --version` |
| **PowerShell** | 7+ (Windows) | `$PSVersionTable.PSVersion` |

### Install Node.js (if not installed)
```bash
# Windows — Download from:
https://nodejs.org/en/download

# Verify after install
node --version   # should output: v20.x.x
npm --version    # should output: 9.x.x or higher
```

### Install Docker Desktop (Windows)
```bash
# Download Docker Desktop for Windows from:
https://www.docker.com/products/docker-desktop/

# After install, verify:
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x

# IMPORTANT: Enable WSL2 backend in Docker Desktop settings
# Settings > General > "Use the WSL 2 based engine" ✅
```

---

## 2. Clone the Repository

```bash
# Clone the project to your machine
git clone https://github.com/itphoenixpack/phoenix-inventory.git

# Enter the project directory
cd phoenix-inventory

# Verify you are on the correct branch
git branch       # should show: * main
git status       # should show: nothing to commit
```

---

## 3. Environment Configuration

The project requires a `.env` file inside the `backend/` folder. **Never commit this file to Git.**

### Step 1 — Copy the example file

```bash
# Windows (PowerShell)
copy .env.example backend\.env

# Mac / Linux / WSL
cp .env.example backend/.env
```

### Step 2 — Edit `backend/.env` with your values

Open `backend/.env` in any text editor and set the following:

```env
# ─────────────────────────────────────────
# Application
# ─────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ─────────────────────────────────────────
# Database (matches docker-compose.yml)
# ─────────────────────────────────────────
DB_HOST=localhost       # Use "db" if connecting from inside Docker
DB_USER=postgres
DB_PASSWORD=root        # Change this for production!
DB_PORT=5432
DB_NAME=inventory_system

# ─────────────────────────────────────────
# Multi-Tenant Databases
# ─────────────────────────────────────────
PHOENIX_DB=inventory_system
IMPACK_DB=impack_db

# ─────────────────────────────────────────
# Security — GENERATE YOUR OWN SECRETS!
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# ─────────────────────────────────────────
JWT_SECRET=paste_your_generated_secret_here
JWT_REFRESH_SECRET=paste_another_generated_secret_here
```

### Step 3 — Generate secure JWT secrets

```bash
# Run this once for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run again for JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Paste each output into backend/.env
```

---

## 4. Running with Docker (Recommended)

Docker handles PostgreSQL, the Node.js backend, and the Nginx frontend automatically. **This is the standard way to run the project.**

### Start all services

```bash
# From the project root (phoenix-inventory/)
docker compose up --build

# The first run will take 2-3 minutes (downloading images, installing dependencies)
```

### Verify it's running

```bash
# Check all 3 containers are healthy
docker ps

# Expected output:
# CONTAINER ID   IMAGE              STATUS          PORTS
# xxxxxxxxxxxx   phoenix-frontend   Up (healthy)    0.0.0.0:80->80/tcp
# xxxxxxxxxxxx   phoenix-backend    Up (healthy)    0.0.0.0:5000->5000/tcp
# xxxxxxxxxxxx   phoenix-db         Up (healthy)    0.0.0.0:5432->5432/tcp
```

### Access the app

| Service | URL |
|---------|-----|
| **Frontend (UI)** | http://localhost |
| **Backend API** | http://localhost:5000/api |
| **Health Check** | http://localhost:5000/health |

### Stop all services

```bash
# Graceful stop (keeps database data)
docker compose down

# Stop AND wipe the database (fresh start)
docker compose down -v
```

### Restart after code changes

```bash
# Rebuild and restart (use after changing backend or frontend code)
docker compose up --build

# Restart a single service only
docker compose restart backend
docker compose restart frontend
```

---

## 5. Running Without Docker (Manual)

Use this method if Docker is unavailable or for deep backend development.

### Prerequisites for Manual Mode
You need a local PostgreSQL 15 installation:
```bash
# Windows — Download from:
https://www.postgresql.org/download/windows/

# After install, create the database
psql -U postgres
CREATE DATABASE inventory_system;
CREATE DATABASE impack_db;
\q
```

### Step 1 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 2 — Run database migrations

```bash
# Still inside /backend
npx knex migrate:latest

# Expected output:
# Using environment: development
# Batch 1 run: 6 migrations
```

### Step 3 — Start the backend server

```bash
# Development mode (auto-restart on file changes)
npm run dev

# Production mode
npm start

# Backend is now running at http://localhost:5000
```

### Step 4 — Install frontend dependencies

```bash
# Open a NEW terminal tab, go back to project root
cd phoenix-inventory/frontend
npm install
```

### Step 5 — Start the frontend dev server

```bash
npm run dev

# Frontend is now running at http://localhost:5173
```

---

## 6. Database: Migrations & Seeds

All database schema changes are managed through **Knex.js migrations**.

### Run all pending migrations

```bash
cd backend
npx knex migrate:latest

# Output:
# Batch 1 run: 6 migrations ✅
```

### Check current migration status

```bash
npx knex migrate:status

# Shows which migrations have been applied and which are pending
```

### Roll back one batch of migrations

```bash
npx knex migrate:rollback
```

### Seed the database with sample data

> ⚠️ **WARNING**: Seeds delete all existing data before inserting. Only run on development databases.

```bash
cd backend
npx knex seed:run

# This creates:
# - 3 sample products (Quantum Chipset X1, Thermal Regulator Prime, Neural Link Interface)
# - Stock entries across 2 warehouses
# - 1 initial inventory transaction
```

### Migration file order (important!)

```
migrations/
├── 20260324060000_core_schema.js            ← Creates users, products, stock, notifications
├── 20260324065318_create_inventory_transactions.js  ← Creates transactions table
├── 20260324130901_add_notes_to_transactions.js      ← Patch (idempotent)
├── 20260330120000_add_user_login_tracking.js        ← Adds login tracking
├── 20260401120000_update_user_security_schema.js    ← Adds company_access, status
└── 20260401130000_update_user_role_constraint.js    ← Adds super_admin role
```

---

## 7. Testing

### Backend Tests (Jest + Supertest)

```bash
cd backend
npm test

# Runs all tests in backend/src/tests/
# Tests cover: auth flow, stock CRUD, deduplication, cascading deletes
```

### Frontend Tests (Vitest)

```bash
cd frontend
npm test

# Runs all .test.jsx files
# Output: ✓ Frontend Sanity Check > should pass this dummy test
```

### Run linting (code quality check)

```bash
# Frontend (ESLint)
cd frontend
npm run lint

# Expected: No ESLint warnings or errors
```

### Run everything at once (simulate CI)

```bash
# From project root — Windows PowerShell
cd backend; npm test; cd ..\frontend; npm run lint; npm test; cd ..
```

---

## 8. API Reference

All API endpoints are prefixed with `/api`. Protected endpoints require a **Bearer JWT token** in the `Authorization` header.

### Authentication

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | `{ name, email, password, role? }` | Register new user |
| `POST` | `/api/auth/login` | ❌ | `{ email, password }` | Login, returns JWT |
| `POST` | `/api/auth/refresh` | ❌ | `{ refreshToken }` | Get new access token |
| `POST` | `/api/auth/logout` | ✅ | — | Invalidate refresh token |

### Stock Management

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/api/stock` | ✅ | All | Get all stock entries |
| `POST` | `/api/stock/add` | ✅ | admin, user | Add stock to a product |
| `POST` | `/api/stock/remove` | ✅ | admin, user | Remove stock from a product |
| `PUT` | `/api/stock/:id` | ✅ | admin | Update a stock entry |
| `DELETE` | `/api/stock/:id` | ✅ | admin | Delete a stock entry |

### Example: Login Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@phoenix.com", "password": "yourpassword"}'

# Response:
# {
#   "accessToken": "eyJhbGci...",
#   "refreshToken": "eyJhbGci...",
#   "user": { "id": 1, "name": "Admin", "role": "admin" }
# }
```

### Example: Get Stock (authenticated)

```bash
# Replace <token> with the accessToken from login
curl http://localhost:5000/api/stock \
  -H "Authorization: Bearer <token>"
```

### Health Check

```bash
curl http://localhost:5000/health
# Response: { "status": "ok", "db": "connected" }
```

---

## 9. Project File Structure

```
phoenix-inventory/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml          ← GitHub Actions CI/CD pipeline
│
├── backend/                   ← Node.js / Express API
│   ├── src/
│   │   ├── config/            ← Environment & DB config
│   │   ├── controllers/       ← HTTP request handlers
│   │   ├── database/
│   │   │   ├── migrations/    ← Knex schema migrations (run in order)
│   │   │   └── seeds/         ← Sample data for development
│   │   ├── middleware/        ← Auth, RBAC, validation, error handling
│   │   ├── repositories/      ← Raw DB queries (data access layer)
│   │   ├── routes/            ← Express route definitions
│   │   ├── services/          ← Business logic layer
│   │   └── server.js          ← App entry point
│   ├── .env                   ← Local secrets (NOT committed to Git)
│   ├── knexfile.js            ← Knex migration configuration
│   ├── Dockerfile             ← Backend container definition
│   └── package.json
│
├── frontend/                  ← React / Vite app
│   ├── src/
│   │   ├── context/           ← Auth context (JWT state management)
│   │   ├── pages/             ← All page components (Login, Admin, User)
│   │   ├── routes/            ← Route definitions & access guards
│   │   └── tests/             ← Vitest component tests
│   ├── nginx.conf             ← Nginx config for production container
│   ├── vite.config.js         ← Vite + Vitest configuration
│   ├── Dockerfile             ← Frontend container definition
│   └── package.json
│
├── docker-compose.yml         ← Orchestrates all 3 services
├── .env.example               ← Template for backend/.env
├── .gitignore                 ← Files excluded from Git
├── README.md                  ← Project overview and architecture
├── ARCHITECTURE.md            ← Deep-dive technical documentation
├── TESTING_SEQUENCE.md        ← Manual QA testing protocol
├── deploy-windows.ps1         ← One-click Windows deployment script
└── SETUP.md                   ← This file
```

---

## 10. CI/CD Pipeline Overview

Every push to `main` triggers the following automated pipeline on GitHub Actions:

```
Git Push to main
       │
       ▼
┌──────────────┐
│  🛡️  Lint    │  ← ESLint on frontend, code style check
└──────┬───────┘
       │ (parallel)
       ├────────────────────────────────────┐
       ▼                                    ▼
┌──────────────────────┐      ┌────────────────────────┐
│  🧠 Backend Tests    │      │  🏗️  Frontend Build     │
│  - Spin up Postgres  │      │  - npm run build (Vite) │
│  - Run migrations    │      │  - Upload dist artifact │
│  - Run Jest tests    │      └────────────┬───────────┘
└──────────┬───────────┘                   │
           │                               │ (parallel)
           ├───────────────────────────────┤
           ▼                               ▼
┌──────────────────────┐      ┌────────────────────────┐
│  🧪 Frontend Tests   │      │  🐳 Docker Audit        │
│  - vitest run        │      │  - docker compose config│
└──────────┬───────────┘      └────────────┬───────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                  ┌────────────────────┐
                  │  🚀 Deploy Ready   │
                  │  All checks passed │
                  └────────────────────┘
```

**GitHub Secrets required** (set in repo Settings > Secrets):

| Secret Name | Description |
|-------------|-------------|
| `DB_PASSWORD` | Production database password |
| `JWT_SECRET` | Production JWT signing key |
| `JWT_REFRESH_SECRET` | Production JWT refresh key |

---

## 11. Troubleshooting

### ❌ Port already in use (5000 or 5432)

```bash
# Windows — find what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# Kill the process (replace <PID> with the number from above)
taskkill /PID <PID> /F

# Then restart
docker compose down
docker compose up --build
```

### ❌ Docker containers won't start

```bash
# View logs for a specific service
docker compose logs backend
docker compose logs db
docker compose logs frontend

# Full reset — removes containers, networks, and volumes
docker compose down -v
docker compose up --build
```

### ❌ Migration fails: "relation does not exist"

This means migrations are running out of order.

```bash
cd backend

# Check the current status
npx knex migrate:status

# Roll back everything and re-run
npx knex migrate:rollback --all
npx knex migrate:latest
```

### ❌ JWT errors (401 Unauthorized)

```bash
# 1. Verify your .env has JWT_SECRET set
cat backend/.env | grep JWT

# 2. Tokens expire after 15 minutes — re-login to get a fresh token
# 3. Make sure you're sending the header correctly:
# Authorization: Bearer eyJhbGci...  (no quotes around the token)
```

### ❌ WSL2 memory issues on Windows

If Docker Desktop is consuming too much RAM:

```powershell
# Create or edit the WSL config
notepad "$env:USERPROFILE\.wslconfig"

# Add these lines:
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Then restart WSL:

```powershell
wsl --shutdown
# Reopen Docker Desktop
```

### ❌ "EACCES: permission denied" on Windows

```powershell
# Run PowerShell as Administrator and retry
docker compose up --build
```

---

## ✅ Quick Start Checklist

Use this checklist on day one to confirm everything works:

```
[ ] git clone completed successfully
[ ] backend/.env file created from .env.example
[ ] JWT secrets generated and saved in backend/.env
[ ] docker compose up --build runs without errors
[ ] http://localhost loads the login page
[ ] http://localhost:5000/health returns { "status": "ok" }
[ ] Can register a new user at /register
[ ] Can login and access the dashboard
[ ] npm test passes in /backend
[ ] npm test passes in /frontend
```

---

> 💬 **Need help?** Raise an issue in the GitHub repository or contact the project maintainer.
> 📖 **Deeper technical docs?** See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details.
