# Phoenix Inventory: Windows Deployment Script
# 
# Usage: .\deploy-windows.ps1
# Requirements: Docker Desktop (WSL2), PowerShell 7+

Write-Host "--- Phoenix Inventory Deployment (Windows) ---" -ForegroundColor Cyan

# 1. Environment Check
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose not found. Please install Docker Desktop for Windows."
    exit 1
}

# 2. Update Source Code
Write-Host "[1/4] Pulling latest code..." -ForegroundColor Yellow
git pull origin main

# 3. Stop Existing Services (to ensure clean restart)
Write-Host "[2/4] Stopping current containers..." -ForegroundColor Yellow
docker-compose down

# 4. Build and Restart Services
Write-Host "[3/4] Building and starting services..." -ForegroundColor Yellow
# --build ensures any code changes in frontend/backend are picked up
docker-compose up -d --build

# 5. Verify Health
Write-Host "[4/4] Verifying health..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "Deployment Complete! Access the system at http://localhost" -ForegroundColor Green
