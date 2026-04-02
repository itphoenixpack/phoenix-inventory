# Phoenix Inventory: GitHub Testing Sequence

This document outlines the systematic verification process for all major features, backend security, and database integrity.

---

## 1. Testing Protocol

All features must pass the following sequence before a production `git push` or merge.

### 1.1. Major Feature Verification
- **User Authentication**:
    - [ ] Sign up with valid credentials.
    - [ ] Sign up with duplicate email (should fail).
    - [ ] Login with correct credentials (returns JWT).
    - [ ] Access protected routes without JWT (should fail).
- **Inventory CRUD**:
    - [ ] Create a new product with unique SKU.
    - [ ] Update product details (name/SKU).
    - [ ] Delete product (ensure cascading delete in `stock`).
- **Stock Movement**:
    - [ ] Add stock to a specific warehouse/shelf.
    - [ ] Subtract stock (ensure it doesn't go below zero if configured).
    - [ ] Verify `inventory_transactions` record is created for each action.

### 1.2. Backend & DB Integrity (Security & Deduplication)
- **Data Validation**:
    - [ ] Negative quantity input (should be blocked via Express-validator).
    - [ ] Malformed JSON input to API (should return 400 Bad Request).
- **Deduplication Check**:
    - [ ] Attempt to create a SKU that already exists (should fail with 409 Conflict).
- **"Non-Stick" Deletion**:
    - [ ] Delete a product and verify that all related entries in the `stock` table are also deleted (Cascading Integrity).
    - [ ] Ensure orphan records are not left in the database.

---

## 2. GitHub Testing Log

This log is used to record the results of manual and automated verification sessions.

| Date | Verification Step | Tester | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| 2026-04-02 | Initial Deployment Architecture | Antigravity | [PASS] | Nginx/Express/Postgres link active. |
| 2026-04-02 | Auth Lifecycle (Sign-up/Login) | Antigravity | [PASS] | JWT issued correctly. |
| 2026-04-02 | Stock Transaction Logging | Antigravity | [PASS] | `inventory_transactions` capturing data. |
| ... | ... | ... | ... | ... |

---

## 3. GitHub Actions CI/CD Pipeline

The project uses GitHub Actions for automated code quality and build verification.

### 3.1. Workflow: `.github/workflows/ci.yml`
- **Linting**: Verifies code style consistency using ESLint.
- **Backend Tests**: Runs `npm test` (Jest) to verify API endpoints and business logic.
- **Frontend Build**: Verifies that the React/Vite app builds successfully.
- **Docker Audit**: Runs a configuration check on `docker-compose.yml` to ensure valid container definitions.

### 3.2. How to Run Locally
Ensure you have Docker Desktop and Node.js installed on your Windows machine:
```powershell
# Run backend tests
cd backend
npm test

# Verify Docker config
docker-compose config
```
