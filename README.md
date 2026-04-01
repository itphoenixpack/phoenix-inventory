# Phoenix Systems: Enterprise Inventory Intelligence

**Phoenix Systems** is a production-ready, secure, and auditable Inventory Management System built for high-stakes organizational logistics.

---

## 🏗️ Enterprise Architecture

The system has been upgraded to a strict **Layered Architecture**:
- **Repositories**: Atomic data access via Knex.js.
- **Services**: Business logic with transactional integrity.
- **Controllers**: Standardized HTTP orchestration.
- **Real-Time**: Socket.IO stream for live synchronization.

## 🔐 Security Features

- **Double-Token Auth**: Short-lived Access Tokens + HttpOnly Refresh Tokens.
- **Audit Trail**: Every stock movement is recorded in `inventory_transactions`.
- **Hardened Middleware**: RBAC, input sanitization, and centralized error handling.

## 🚀 Getting Started (Production)

### 1. Environment Config
Define these in your `.env` or system environment:
```bash
DB_PASSWORD=your_secure_password
JWT_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

### 1b. Multi-tenant (Phoenix + Impack)
Phoenix Systems supports multi-tenancy using **two separate PostgreSQL databases** with an identical schema.

Set these environment variables (recommended in production):

```bash
PHOENIX_DB_URL=postgresql://USER:PASSWORD@HOST:5432/phoenix_db
IMPACK_DB_URL=postgresql://USER:PASSWORD@HOST:5432/impack_db
JWT_SECRET=your_access_secret
```

#### Create Impack DB + clone schema from Phoenix
You can clone Phoenix schema into Impack in two common ways.

**Option A (recommended): pg_dump schema-only**

```bash
# 1) Create the impack DB
createdb -h HOST -U USER impack_db

# 2) Dump schema from phoenix_db and restore into impack_db
pg_dump -h HOST -U USER -d phoenix_db --schema-only --no-owner --no-privileges > phoenix_schema.sql
psql    -h HOST -U USER -d impack_db  -f phoenix_schema.sql
```

**Option B: SQL clone inside psql (schema-only)**

```bash
-- Run this while connected to phoenix_db:
\copy (select 'pg_dump is recommended for consistent schema-only cloning') to stdout;
```

> Note: if you have existing migrations/Knex in this repo, you can also run the same migration set against `impack_db`.

#### Tenant routing rule
- Every frontend request sends a header: `x-company: phoenix` or `x-company: impack`
- JWT contains `company`
- Backend rejects requests where **token.company ≠ x-company**

### 2. One-Click Deployment
```bash
docker-compose up --build -d
```
The system will automatically initialize the database, run migrations, and start the high-performance Nginx frontend and Node.js backend.

## 🛠️ Maintenance & DevOps

- **Backups**: Run `scripts/backup_db.sh` daily.
- **Monitoring**: Access the `/health` endpoint for system vitals.
- **Logs**: Structured logs are maintained in `backend/logs/combined.log`.

---
Verified by Antigravity
