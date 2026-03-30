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
