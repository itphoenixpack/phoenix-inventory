# Phoenix Inventory: Architectural Overview

This document provides a complete technical layout of the Phoenix Inventory system, detailing the software architecture, data flow, database schema, and deployment strategies optimized for **Windows** environments.

---

## 1. High-Level System Architecture

The system follows a classic **Three-Tier Architecture**, containerized using Docker for consistency across development and production.

```mermaid
graph TD
    subgraph "Client Layer (Frontend)"
        A[React App / Vite] --> B[Nginx Reverse Proxy]
    end

    subgraph "Application Layer (Backend)"
        B --> C[Node.js / Express API]
        C --> D[Knex.js ORM/Query Builder]
    end

    subgraph "Data Layer (Database)"
        D --> E[(PostgreSQL 15)]
    end

    subgraph "Infrastructure"
        F[Docker Desktop / WSL2]
        F --> A
        F --> C
        F --> E
    end
```

---

## 2. Process Flow Representations

### 2.1. Request Lifecycle: Stock Update
This diagram illustrates the process when a user updates stock levels.

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Front as Frontend (React)
    participant Back as Backend (Express)
    participant DB as Database (Postgres)

    User->>Front: Enter Quantity & Submit
    Front->>Back: POST /api/stock/update (JWT Auth)
    Back->>Back: Validate Input (Express-Validator)
    Back->>DB: Start Transaction
    DB->>DB: Check Product Existence
    DB->>DB: Update Stock Table
    DB->>DB: Insert Inventory Transaction Log
    DB->>Back: Commit Transaction
    Back->>Front: 200 OK (Success Message)
    Front->>User: Display Success Toast
```

### 2.2. Authentication Flow
```mermaid
sequenceDiagram
    User->>Front: Enter Email/Password
    Front->>Back: POST /api/auth/login
    Back->>DB: Query User by Email
    DB-->>Back: User Data (Hashed Password)
    Back->>Back: bcrypt.compare()
    Back->>Back: Generate JWT (Access + Refresh)
    Back->>Front: Tokens + User Role
    Front->>Front: Store Token (Local/Session Storage)
```

---

## 3. Database Schema (PostgreSQL)

### 3.1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ INVENTORY_TRANSACTIONS : performs
    PRODUCTS ||--o{ STOCK : contains
    PRODUCTS ||--o{ INVENTORY_TRANSACTIONS : logs
    STOCK ||--o{ INVENTORY_TRANSACTIONS : relates_to

    USERS {
        int id PK
        string name
        string email UK
        string password "Hashed"
        string role "super_admin, admin, user"
        jsonb company_access
        string status "active, inactive"
        datetime created_at
    }

    PRODUCTS {
        int id PK
        string name
        string sku UK
        datetime created_at
    }

    STOCK {
        int id PK
        int product_id FK
        string warehouse_name
        string shelf_code
        int quantity
        datetime updated_at
    }

    INVENTORY_TRANSACTIONS {
        int id PK
        int product_id FK
        string warehouse_name
        int quantity
        enum type "IN, OUT, ADJUSTMENT"
        int user_id FK
        text notes
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        string type "STOCK_LOW, USER_ACCESS"
        text message
        boolean is_read
        datetime created_at
    }
```

---

## 4. Deployment on Windows

### 4.1. Optimized Environment
For production-grade delivery on **Windows**, we utilize **Docker Desktop** with the **WSL2 (Windows Subsystem for Linux)** backend. This provides near-native performance for PostgreSQL and Node.js.

- **Recommended OS**: Windows Server 2022 or Windows 11 Pro.
- **Backend**: Docker Desktop (WSL2 Engine).
- **Frontend Serving**: Nginx container (serving Vite static builds).

### 4.2. Windows Server Access
1.  **Remote Access**: Use **Remote Desktop Protocol (RDP)** for GUI-based management.
2.  **Command Line**: Standardize on **PowerShell 7 (Core)** for scripting.
3.  **Environment Management**:
    - Use System Environment Variables or `.env` files mapped via `docker-compose.yml`.
    - Secure secrets using **Windows Credential Manager** or external Vaults if necessary.

---

## 5. Industry Standards & Optimization

### 5.1. Standards Used
- **RESTful API Design**: Predictable resource-based URLs.
- **JWT (JSON Web Tokens)**: Stateless authentication for scalability.
- **Bcrypt**: Adaptive hashing for password security.
- **ACID Transactions**: Ensuring DB integrity (Knex Transactions).
- **SemVer**: Semantic Versioning for releases.

### 5.2. Optimization Strategies
- **Database Indexing**: Indexes on `SKU`, `product_id`, and `created_at` for sub-second query performance.
- **Rate Limiting**: `express-rate-limit` to prevent Brute Force on Auth endpoints.
- **Compression**: `gzip` enabled via Nginx for faster frontend delivery.
- **Connection Pooling**: PostgreSQL connection pooling handled via `pg` and `Knex`.
