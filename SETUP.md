# Phoenix Inventory: Developer Setup Guide

Welcome to the Phoenix Inventory team! This guide will walk you through setting up your local development environment on **Windows**.

---

## 1. Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js (LTS)**: v20.x or higher.
- **Docker Desktop**: With the **WSL2** backend enabled.
- **Git**: For version control.
- **VS Code** (Recommended): With the *Docker* and *ESLint* extensions.

---

## 2. Initial Setup

1.  **Clone the Repository**:
    ```powershell
    git clone [your-repo-url]
    cd inventory-system
    ```

2.  **Environment Configuration**:
    Copy the example environment file to create your local configuration:
    ```powershell
    copy .env.example .env
    ```
    *Note: Update the values in `.env` if you are using custom ports or database credentials locally.*

3.  **Install Dependencies**:
    While we primarily run in Docker, installing local dependencies helps with IDE intellisense and linting:
    ```powershell
    cd backend; npm install; cd ..
    cd frontend; npm install; cd ..
    ```

---

## 3. Running the Application

We use **Docker Compose** to manage the frontend, backend, and database simultaneously.

1.  **Start Services**:
    ```powershell
    docker-compose up --build
    ```
2.  **Access the App**:
    - **Frontend**: [http://localhost](http://localhost) (or port 80).
    - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api).

---

## 4. Database Management

We use **Knex.js** for database migrations and seeds.

- **Run Migrations**:
  The backend container runs migrations automatically on start. To run them manually from your host:
  ```powershell
  cd backend
  npx knex migrate:latest
  ```

- **Seeding Data (Optional)**:
  To populate the database with initial test data (admin users, sample products):
  ```powershell
  cd backend
  npx knex seed:run
  ```

---

## 5. Testing & Quality Control

Before pushing any code, ensure all tests pass:

- **Backend Tests**: `cd backend; npm test`
- **Frontend Linting**: `cd frontend; npm run lint`
- **Docker Validation**: `docker-compose config`

---

## 6. Troubleshooting (Windows/WSL2)

- **Port Conflict (5000/5432)**: If you have a local PostgreSQL or another Node app running, change the ports in your `.env` and `docker-compose.yml`.
- **WSL2 Memory Issues**: If Docker consumes too much RAM, create/edit `%USERPROFILE%\.wslconfig` and limit memory:
  ```ini
  [wsl2]
  memory=4GB
  ```
- **File Watchers**: If Vite HMR (Hot Module Replacement) isn't working, ensure your project is stored within the WSL2 filesystem (e.g., `\\wsl$\Ubuntu\home\...`) for best performance.
