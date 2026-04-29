# Server Setup Guide — Phoenix Inventory System

## Server Hardware

- **Model**: HP ProLiant DL360 G9
- **CPU**: 2x Intel Xeon E5-2643 v4 (12 cores / 24 threads)
- **RAM**: 16GB DDR4
- **Storage**: 1TB SSD (RAID 1)
- **PSU**: 2x 400W (redundant)
- **OS**: Windows Server 2019

## Server Identity

- **Hostname**: `PHOENIX-SVR`
- **Tailscale IP**: `100.119.90.5` (fixed, works from anywhere — admin access only)
- **LAN IP**: `192.168.1.90` (static, on Etisalat router)
- **Public IP**: `217.165.165.14` (Etisalat WAN, dynamic — but irrelevant since we use Cloudflare Tunnel)
- **Domain**: `phoenix-softwares.com` (Cloudflare-managed)

---

## Access Methods

| Method | Address | Username | From Where |
|--------|---------|----------|------------|
| **Phoenix Inventory** | `https://inventory.phoenix-softwares.com` | App login | Anywhere, any device, no Tailscale needed |
| **Mattermost Chat** | `https://mattermost.phoenix-softwares.com` | App login | Anywhere, any device, no Tailscale needed |
| **RDP (Admin GUI)** | `mstsc /v:100.119.90.5` | `PHOENIX-SVR\Administrator` | Anywhere (Tailscale only — restricted by firewall) |
| **SSH (Admin CLI)** | `ssh Administrator@100.119.90.5` | `Administrator` | Anywhere via Tailscale |

---

## Services Running on Boot (No Login Required)

| Service | Type | Auto-Starts | What It Does |
|---------|------|------------|--------------|
| **Tailscale** | Windows Service | Yes | VPN tunnel — RDP/SSH accessible immediately on boot |
| **postgresql-x64-15** | Windows Service | Yes | PostgreSQL 15 database on port 5432 |
| **PhoenixBackend** | NSSM Service | Yes | Node.js Express API on port 5000 |
| **PhoenixNginx** | NSSM Service | Yes | Nginx serving frontend on port 80, proxying /api to backend |
| **sshd** | Windows Service | Yes | OpenSSH server for remote CLI access and GitHub Actions deploy |
| **MattermostServer** | Scheduled Task | Yes | Launches WSL → Mattermost on port 8065 (with auto-restart loop) |
| **CloudflareTunnel** | Scheduled Task | Yes | Cloudflared tunnel exposing apps to internet (no port forwarding) |
| **Auto-login** | Registry | Yes | Logs in as Administrator automatically |
| **AutoLockAfterLogin** | Scheduled Task | Yes | Locks screen immediately after auto-login |

**Boot sequence**: Power on → Windows boots → Auto-logs in as Administrator → Screen locks immediately → All services start → Both apps are live and accessible via public domain → RDP/SSH accessible via Tailscale.

---

## Security Configuration

- **RDP**: Blocked from all networks EXCEPT Tailscale (`100.64.0.0/10`)
- **Auto-login**: Enabled so services start properly on reboot without physical access
- **Auto-lock**: Screen locks immediately after login — physical access requires password
- **Screen timeout**: Monitor turns off after 1 minute of inactivity
- **SSH key auth**: Deploy user authenticates via ED25519 key (no password)
- **Firewall**: Only ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API) open

---

## Setup Steps Completed

### Step 1: Basic Server Setup

**1a. Static IP — PENDING**
- Server is currently on DHCP (temporary LAN connection)
- When moved to permanent router, set static IP:
  - Server Manager > Local Server > Ethernet > right-click adapter > Properties > IPv4
  - Change from "Obtain an IP address automatically" to "Use the following IP address"
  - Set IP matching the new router's subnet (e.g., `192.168.1.100`)
  - Subnet mask: `255.255.255.0`
  - Default gateway: router's IP (e.g., `192.168.1.1`)
  - DNS: `8.8.8.8` (primary), `8.8.4.4` (secondary)
- Then update `SERVER_HOST` GitHub Secret if using LAN IP

**1b. Rename Server — DONE**
- Server Manager > Local Server > Computer Name > Change
- Set to `PHOENIX-SVR`
- Required restart

**1c. Enable Remote Desktop — DONE**
- Server Manager > Local Server > Remote Desktop > Enabled
- Network Level Authentication (NLA) enabled

---

### Step 2: Install Tailscale — DONE

Tailscale creates an encrypted VPN between devices. No port forwarding needed.

**On the server (PowerShell as Admin):**
```powershell
Invoke-WebRequest -UseBasicParsing "https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe" -OutFile tailscale-setup.exe
.\tailscale-setup.exe /quiet
```
- Signed in via GitHub account (HIRAKHANJI)
- Server Tailscale IP: `100.119.90.5`

**On the laptop:**
```powershell
winget install --id Tailscale.Tailscale -e
```
- Signed in with same GitHub account

**Verified auto-start on boot:**
```powershell
Set-Service -Name "Tailscale" -StartupType Automatic
```

---

### Step 3: Remove Docker — DONE

Docker Desktop doesn't support Windows Server 2019. Docker Engine only runs Windows containers. App needs Linux containers. Removed Docker entirely.

```powershell
Stop-Service docker -Force -ErrorAction SilentlyContinue
dockerd --unregister-service
Remove-Item "$env:ProgramFiles\docker" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:ProgramData\docker" -Recurse -Force -ErrorAction SilentlyContinue
```

---

### Step 4: Install Node.js — DONE

```powershell
Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi" -OutFile node-installer.msi
msiexec /i node-installer.msi /qn
```

- Version: v20.18.1
- npm: 10.8.2
- Note: Some frontend dependencies warn about needing 20.19+, but everything builds and runs fine

---

### Step 5: Install PostgreSQL — DONE

```powershell
Invoke-WebRequest -UseBasicParsing "https://get.enterprisedb.com/postgresql/postgresql-15.10-1-windows-x64.exe" -OutFile pg-installer.exe
.\pg-installer.exe
```

- Installed: PostgreSQL Server, pgAdmin 4, Command Line Tools
- Port: 5432
- Auto-starts as Windows service

**Added to PATH:**
```powershell
[Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\Program Files\PostgreSQL\15\bin", [EnvironmentVariableTarget]::Machine)
```

**Databases created:**
```powershell
psql -U postgres -c "CREATE DATABASE inventory_system;"
psql -U postgres -c "CREATE DATABASE inpack_db;"
```

| Database | Purpose |
|----------|---------|
| `inventory_system` | Phoenix company data |
| `inpack_db` | Inpack company data |

**Note:** The codebase uses `IMPACK_DB` as the env var name but the actual database is `inpack_db`. A code refactor to standardize naming is planned.

---

### Step 6: Install OpenSSH Server — DONE

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

**sshd_config modified** (`C:\ProgramData\ssh\sshd_config`):
- `PubkeyAuthentication yes` (uncommented)
- `Match Group administrators` block uses `__PROGRAMDATA__/ssh/administrators_authorized_keys`

---

### Step 6.5: Security Hardening — DONE

**Changed Administrator password:**
```powershell
net user Administrator <new-password>
```

**Auto-login enabled (survives reboots):**
```powershell
$RegPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"
Set-ItemProperty -Path $RegPath -Name "AutoAdminLogon" -Value "1"
Set-ItemProperty -Path $RegPath -Name "DefaultUserName" -Value "Administrator"
Set-ItemProperty -Path $RegPath -Name "DefaultPassword" -Value "<password>"
Set-ItemProperty -Path $RegPath -Name "DefaultDomainName" -Value "PHOENIX-SVR"
```

**Auto-lock after login (blocks physical access):**
```powershell
$Action = New-ScheduledTaskAction -Execute "rundll32.exe" -Argument "user32.dll,LockWorkStation"
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings
Register-ScheduledTask -TaskName "AutoLockAfterLogin" -InputObject $Task -Force
```

**Screen timeout:**
```powershell
powercfg /change monitor-timeout-ac 1
```

**RDP restricted to Tailscale only:**
```powershell
Disable-NetFirewallRule -DisplayGroup "Remote Desktop"
New-NetFirewallRule -DisplayName "RDP via Tailscale Only" -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Allow -RemoteAddress 100.64.0.0/10
```

---

### Step 7: Install Git — DONE

```powershell
Invoke-WebRequest -UseBasicParsing "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.2/Git-2.47.1.2-64-bit.exe" -OutFile git-installer.exe
.\git-installer.exe /VERYSILENT
```

---

### Step 8: Create Deploy User — DONE

```powershell
net user deploy <password> /add
net localgroup Administrators deploy /add
```

This user is exclusively for GitHub Actions SSH deployments. The Administrator account stays separate.

---

### Step 9: Generate SSH Key Pair — DONE

```powershell
runas /user:deploy "cmd /c echo profile created"
mkdir C:\Users\deploy\.ssh
ssh-keygen -t ed25519 -f C:\Users\deploy\.ssh\deploy_key
```

- Passphrase: none (empty)
- Public key copied to: `C:\ProgramData\ssh\administrators_authorized_keys`
- Permissions set:
  ```powershell
  icacls C:\ProgramData\ssh\administrators_authorized_keys /inheritance:r /grant "SYSTEM:F" /grant "Administrators:F"
  ```
- Private key saved for GitHub Secrets (`SERVER_SSH_KEY`)

**Verified key-based SSH login works:**
```powershell
ssh -i C:\Users\deploy\.ssh\deploy_key deploy@localhost
```

---

### Step 10: Clone Repo and Set Up App — DONE

```powershell
mkdir C:\phoenix-inventory
cd C:\phoenix-inventory
git clone https://github.com/HIRAKHANJI/phoenix-inventory.git .
```

**Backend setup:**
```powershell
cd C:\phoenix-inventory\backend
npm install
Copy-Item C:\phoenix-inventory\.env.example C:\phoenix-inventory\backend\.env
```

**`.env` configured** (`C:\phoenix-inventory\backend\.env`):
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=<postgres-password>
DB_PORT=5432
PHOENIX_DB=inventory_system
IMPACK_DB=inpack_db
JWT_SECRET=<generated-base64-string>
JWT_REFRESH_SECRET=<generated-base64-string>
```

JWT secrets generated with:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }) -as [byte[]])
```

**Migrations and seeds run (using development config since production requires DATABASE_URL):**
```powershell
npx knex migrate:latest --env development
npx knex seed:run --env development
```

- 6 migrations ran successfully
- 2 seed files ran (super admin + initial data)
- Default super admin: `superadmin@phoenic-pack.com`

**Frontend build:**
```powershell
cd C:\phoenix-inventory\frontend
npm install
npm run build
```

Build output in `C:\phoenix-inventory\frontend\dist\`

---

### Step 11: Install Nginx — DONE

```powershell
Invoke-WebRequest -UseBasicParsing "https://nginx.org/download/nginx-1.26.2.zip" -OutFile nginx.zip
Expand-Archive nginx.zip -DestinationPath C:\ -Force
Rename-Item "C:\nginx-1.26.2" "C:\nginx"
```

**Nginx config** (`C:\nginx\conf\nginx.conf`):
```nginx
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile      on;

    server {
        listen 80;
        server_name localhost;
        root C:/phoenix-inventory/frontend/dist;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://127.0.0.1:5000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

- Port 80: serves React frontend static files
- `/api` requests proxied to Node.js backend on port 5000
- SPA routing: `try_files` falls back to `index.html`

---

### Step 12: Create Windows Services — DONE

**Installed NSSM (Non-Sucking Service Manager):**
```powershell
Invoke-WebRequest -UseBasicParsing "https://nssm.cc/release/nssm-2.24.zip" -OutFile nssm.zip
Expand-Archive nssm.zip -DestinationPath C:\ -Force
Copy-Item "C:\nssm-2.24\win64\nssm.exe" "C:\Windows\System32\nssm.exe"
```

**PhoenixBackend service:**
```powershell
nssm install PhoenixBackend "C:\Program Files\nodejs\node.exe"
nssm set PhoenixBackend AppParameters "C:\phoenix-inventory\backend\src\server.js"
nssm set PhoenixBackend AppDirectory "C:\phoenix-inventory\backend"
nssm set PhoenixBackend AppStdout "C:\phoenix-inventory\backend\logs\service-out.log"
nssm set PhoenixBackend AppStderr "C:\phoenix-inventory\backend\logs\service-err.log"
nssm set PhoenixBackend AppEnvironmentExtra "NODE_ENV=production"
nssm set PhoenixBackend Start SERVICE_AUTO_START
nssm set PhoenixBackend AppStopMethodSkip 0
nssm set PhoenixBackend AppStopMethodConsole 5000
nssm set PhoenixBackend AppStopMethodWindow 5000
nssm set PhoenixBackend AppStopMethodThreads 5000
```

**PhoenixNginx service:**
```powershell
nssm install PhoenixNginx "C:\nginx\nginx.exe"
nssm set PhoenixNginx AppDirectory "C:\nginx"
nssm set PhoenixNginx Start SERVICE_AUTO_START
nssm set PhoenixNginx AppStopMethodSkip 6
nssm set PhoenixNginx AppStopMethodConsole 3000
```

**Verified all services:**
```
PhoenixBackend    Running Automatic
PhoenixNginx      Running Automatic
postgresql-x64-15 Running Automatic
sshd              Running Automatic
Tailscale         Running Automatic
```

---

### Step 13: Create Deploy Script — DONE

**File**: `C:\phoenix-inventory\deploy.ps1`

```powershell
# deploy.ps1 — Graceful pull and restart

Write-Host "=== Pulling latest code ==="
cd C:\phoenix-inventory
git pull origin main

Write-Host "=== Installing backend dependencies ==="
cd C:\phoenix-inventory\backend
npm install --production

Write-Host "=== Running database migrations ==="
npx knex migrate:latest

Write-Host "=== Building frontend ==="
cd C:\phoenix-inventory\frontend
npm install
npm run build

Write-Host "=== Restarting backend (graceful) ==="
nssm restart PhoenixBackend

Write-Host "=== Restarting Nginx ==="
nssm restart PhoenixNginx

Write-Host "=== Deploy complete at $(Get-Date) ==="
```

GitHub Actions SSHs into the server and executes this script on every push to `main`.

---

### Step 14: Open Firewall Ports — DONE

```powershell
New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
```

RDP (port 3389) is restricted to Tailscale network only (configured in Step 6.5).

---

### Step 15: Verify Everything — DONE

**On the server — all checks passed:**
- `hostname` → `PHOENIX-SVR`
- `node --version` → `v20.18.1`
- `npm --version` → `10.8.2`
- `psql --version` → PostgreSQL 15
- `git --version` → Git installed
- `ssh Administrator@localhost` → SSH login successful
- `tailscale status` → 4 devices online (server, desktop, laptop, phone)
- All services running: PhoenixBackend, PhoenixNginx, postgresql-x64-15, sshd, Tailscale (all `Running` + `Automatic`)
- `Invoke-WebRequest http://localhost:5000` → `200 OK` — "Inventory API Running"
- `Invoke-WebRequest http://localhost` → `200 OK` — serves React HTML

**From laptop — verified:**
- Browser: `http://100.119.90.5` → Phoenix Inventory login page loads
- Terminal: `ssh Administrator@100.119.90.5` → SSH connects

**Tailscale network:**
```
100.119.90.5    phoenix-svr      (server)
100.112.110.39  desktop-d2ltv44  (home PC)
100.78.84.3     laptop-3mji9uge  (laptop)
100.91.255.44   xiaomi-15-ultra  (phone)
```

---

### Step 16: GitHub Actions Auto-Deploy — DONE

Because GitHub Actions runners are cloud-based (Azure) and the server is only reachable via Tailscale, the deploy workflow joins the Tailscale network temporarily using an auth key, then SSHs into the server as the `deploy` user.

**Phase 1: Retrieve deploy user's SSH private key — DONE**
```powershell
type C:\Users\deploy\.ssh\deploy_key
```
Private key copied, starts with `-----BEGIN OPENSSH PRIVATE KEY-----`.

**Important:** When pasting the key into GitHub Secrets, copy from Notepad (not PowerShell terminal) to avoid invisible character issues. Open the key in Notepad first:
```powershell
notepad C:\Users\deploy\.ssh\deploy_key
```
Then Ctrl+A, Ctrl+C, paste into GitHub.

**Phase 2: Generate Tailscale auth key — DONE**
- Went to `https://login.tailscale.com/admin/settings/keys`
- Generated with: Reusable ON, Ephemeral ON, 90-day expiration, Tags OFF
- Key format: `tskey-auth-...`
- **Note:** This key expires after 90 days. Regenerate and update the `TS_AUTHKEY` GitHub Secret before expiry.

**Phase 3: Add GitHub Secrets — DONE**
At `https://github.com/HIRAKHANJI/phoenix-inventory/settings/secrets/actions`:

| Secret | Value |
|--------|-------|
| `SERVER_HOST` | `100.119.90.5` |
| `SERVER_USER` | `deploy` |
| `SERVER_SSH_KEY` | Full private key (BEGIN/END lines included) |
| `TS_AUTHKEY` | Tailscale auth key from Phase 2 |

**Phase 4: Deploy workflow file — DONE**

Created `.github/workflows/deploy.yml`. The workflow:
1. Triggers on every push to `main`
2. Checks out repo
3. Connects to Tailscale using `TS_AUTHKEY` (ephemeral node, auto-removes after run)
4. Waits 5s for Tailscale network to settle
5. SSHs to `deploy@100.119.90.5` using `SERVER_SSH_KEY`
6. Runs `powershell -ExecutionPolicy Bypass -File C:\phoenix-inventory\deploy.ps1`
7. `deploy.ps1` pulls code, installs deps, runs migrations, builds frontend, restarts services
8. `concurrency` group ensures only one deploy runs at a time

**Phase 5: First deploy test — DONE**

- Merged PR #3 (`claude/git-author-setup-IoSrq`) into `main`
- Initial run failed: `ssh: no key found` — caused by invisible characters from RDP clipboard copy
- Fixed by copying key from Notepad instead of PowerShell terminal
- Second run succeeded: **Deploy to Phoenix Server — 1m 19s**
- Verified on server: `git log -1` shows merged commit, both services running

---

## Issues Encountered During Setup

### Docker Desktop couldn't install (Step 3)
**Problem:** Docker Desktop installer said Windows Server 2019 is too old. Docker Engine installed but could only run Windows containers, not Linux.

**Solution:** Abandoned Docker entirely. Went with native installs: Node.js + PostgreSQL + Nginx directly on Windows, using NSSM to manage them as Windows services.

### Hyper-V install triggered multiple reboots (Step 3)
**Problem:** After each restart, the HP ProLiant G9 boot menu appeared asking to select boot device.

**Solution:** Select **RAID 1 (931.48 GiB)** at each boot menu. Can be disabled in BIOS later to boot directly to Windows.

### `winget` package manager not pre-installed on Server 2019 (Step 7)
**Problem:** Couldn't use `winget install` for Git.

**Solution:** Downloaded Git installer directly via `Invoke-WebRequest` and installed with `/VERYSILENT`.

### `ssh-keygen -N ""` flag not accepted by Windows OpenSSH 7.7 (Step 9)
**Problem:** Windows version of `ssh-keygen` rejected the empty-quote passphrase argument.

**Solution:** Run `ssh-keygen -t ed25519 -f <path>` without `-N`, then hit Enter twice interactively when prompted for passphrase.

### SSH key auth failed for deploy user (Step 9)
**Problem:** The deploy user kept being asked for a password despite a correct key file being in `~/.ssh/authorized_keys`.

**Solution:** On Windows, administrator accounts don't use `~/.ssh/authorized_keys` — they use `C:\ProgramData\ssh\administrators_authorized_keys` instead. Needed to:
1. Copy the public key there (not append)
2. Set strict permissions: `icacls C:\ProgramData\ssh\administrators_authorized_keys /inheritance:r /grant "SYSTEM:F" /grant "Administrators:F"`
3. Uncomment `PubkeyAuthentication yes` in `C:\ProgramData\ssh\sshd_config`
4. Restart sshd service

### Deploy user password rejection (Step 8)
**Problem:** `net user deploy <password>` kept failing with "does not meet password policy requirements."

**Solution:** Password needed uppercase + lowercase + number + special character. `Ph03n1x_5VR!` worked.

### Knex migrations failed on production env (Step 10)
**Problem:** `npx knex migrate:latest` errored with "Unable to acquire a connection."

**Cause:** `knexfile.js` production config uses `process.env.DATABASE_URL` which wasn't set. The separate `DB_HOST`, `DB_USER`, etc. env vars are only used in the development config.

**Solution:** Ran migrations using `--env development` flag which uses the individual DB_* env vars from `.env`:
```powershell
npx knex migrate:latest --env development
npx knex seed:run --env development
```

### `.env.example` in wrong location (Step 10)
**Problem:** `Copy-Item .env.example .env` inside `backend/` folder failed — file didn't exist there.

**Solution:** `.env.example` is at the repo root, not in `backend/`. Copied from the correct location:
```powershell
Copy-Item C:\phoenix-inventory\.env.example C:\phoenix-inventory\backend\.env
```

### Node.js version warning during frontend build (Step 10)
**Problem:** `npm run build` warned that Vite requires Node.js 20.19+ (installed was 20.18.1).

**Solution:** Build still succeeded despite the warning. Kept Node.js 20.18.1 for now — upgrade to 20.19+ later if dependency issues arise.

### Nginx run from wrong directory (Step 11)
**Problem:** Running `.\nginx.exe -t` from `C:\phoenix-inventory\frontend` caused nginx to look for config in the wrong place.

**Solution:** Always `cd C:\nginx` before running nginx commands. NSSM service config handles this automatically via `AppDirectory`.

### RDP failed to Microsoft-account-linked Windows 11 PC (personal PC setup)
**Problem:** Couldn't RDP to personal PC using the Microsoft account email/password — kept failing.

**Cause:** Windows 11 with Microsoft account uses Windows Hello PIN by default. RDP requires the Microsoft account password to be cached locally.

**Solution:** On personal PC, locked screen (Win+L), clicked "Sign-in options", selected key icon, typed full Microsoft account password (not PIN). This cached it locally. Then RDP worked with email + password.

### Auto-login + security tradeoffs
**Problem:** Without auto-login, reboots would lock the server remotely (Tailscale still works but RDP session gets stuck).

**Solution:** Enabled auto-login (registry), but paired with immediate auto-lock (scheduled task) so anyone physically at the server sees a locked screen. Also restricted RDP to Tailscale network only — outside devices can't even attempt to connect.

---

## Current Server Capabilities (as of 2026-04-29)

- **Phoenix Inventory** live at `https://inventory.phoenix-softwares.com` — works on any device, any browser, anywhere in the world
- **Mattermost Chat** live at `https://mattermost.phoenix-softwares.com` — real-time messaging working, WebSocket-enabled
- **Admin access** via Tailscale (RDP + SSH from anywhere, restricted by firewall)
- **Auto-deploy** of inventory app on every push to `main` via GitHub Actions
- **All services auto-start on boot**, no physical login required
- **No port forwarding needed** — Cloudflare Tunnel bypasses ISP port blocks (Etisalat blocks inbound port 80)
- Both apps accessible without any client setup (no Tailscale, no VPN, no app install — just a URL)

---

## Step 17: Static IP — DONE

- Server LAN IP set to `192.168.1.90` on Etisalat router subnet
- Subnet mask: `255.255.255.0`
- Default gateway: `192.168.1.1`
- DNS: `8.8.8.8` / `8.8.4.4`
- Verified internet works after change

---

## Step 18: Domain Setup with Cloudflare Tunnel — DONE

**Why Cloudflare Tunnel (not port forwarding):** Etisalat blocks inbound port 80. Port forwarding rules saved correctly but traffic never reaches the server. Cloudflare Tunnel uses an outbound connection from server to Cloudflare, bypassing ISP blocks entirely. More secure too — server stays invisible to public internet.

### Domain
- Bought `phoenix-softwares.com` on Cloudflare Registrar
- DNS managed by Cloudflare

### Subdomains (CNAME records pointing to tunnel)
| Subdomain | Routes To |
|-----------|-----------|
| `inventory.phoenix-softwares.com` | Phoenix Inventory app (Nginx → backend) |
| `mattermost.phoenix-softwares.com` | Mattermost (direct to port 8065) |
| `phoenix-softwares.com` | Redirects to inventory subdomain |

### Cloudflare Settings
- **SSL/TLS**: Flexible
- **Network > WebSockets**: ON
- **DNS**: All records Proxied (orange cloud)

### Cloudflared Tunnel Setup

```powershell
Invoke-WebRequest -UseBasicParsing "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile C:\cloudflared.exe
C:\cloudflared.exe tunnel login
C:\cloudflared.exe tunnel create phoenix-tunnel
```

Tunnel ID: `20db35e1-b49b-4395-801f-18c54445a5a3`

Config file: `C:\Users\Administrator\.cloudflared\config.yml`
```yaml
tunnel: 20db35e1-b49b-4395-801f-18c54445a5a3
credentials-file: C:\Users\Administrator\.cloudflared\20db35e1-b49b-4395-801f-18c54445a5a3.json

ingress:
  - hostname: inventory.phoenix-softwares.com
    service: http://localhost:80
  - hostname: mattermost.phoenix-softwares.com
    service: http://localhost:8065
  - hostname: phoenix-softwares.com
    service: http://localhost:80
  - service: http_status:404
```

DNS routes added via:
```powershell
C:\cloudflared.exe tunnel route dns phoenix-tunnel inventory.phoenix-softwares.com
C:\cloudflared.exe tunnel route dns phoenix-tunnel mattermost.phoenix-softwares.com
C:\cloudflared.exe tunnel route dns phoenix-tunnel phoenix-softwares.com
```

### Tunnel Auto-Start (Scheduled Task, NOT NSSM)

NSSM service couldn't manage cloudflared properly (kept showing SERVICE_PAUSED). Switched to Scheduled Task.

Wrapper script: `C:\cloudflared-service.ps1`
```powershell
while ($true) {
    C:\cloudflared.exe --config "C:\Users\Administrator\.cloudflared\config.yml" tunnel run phoenix-tunnel
    Start-Sleep -Seconds 5
}
```

Scheduled Task created with:
```powershell
$Action = New-ScheduledTaskAction -Execute "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File C:\cloudflared-service.ps1"
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
$Principal = New-ScheduledTaskPrincipal -UserId "PHOENIX-SVR\Administrator" -LogonType S4U -RunLevel Highest
$Task = New-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal
Register-ScheduledTask -TaskName "CloudflareTunnel" -InputObject $Task -Force
```

---

## Step 19: Frontend Axios Fix — DONE

**Problem:** Frontend hardcoded `http://localhost:5000/api` which only works locally. Once accessed via the public domain, all API calls failed.

**Fix:** Changed `frontend/src/api/axios.js` `baseURL` from `http://localhost:5000/api` to `/api`. Nginx proxies `/api` to the backend, so relative URL works from any domain.

Committed to repo, auto-deployed via GitHub Actions.

---

## Step 20: Inpack Database Setup — DONE (TEMPORARY)

**Problem:** Super admin only seeded into `inventory_system` (Phoenix DB). Logging into Inpack failed with "Identity not found in current logistics node."

**Fix:** Copied schema from Phoenix DB to Inpack DB and inserted super admin:

```powershell
pg_dump -U postgres -d inventory_system --schema-only | psql -U postgres -d inpack_db
```

Then in `psql -U postgres -d inpack_db`:
```sql
INSERT INTO users (name, email, password, role, status, created_at, updated_at)
VALUES ('Super Administrator', 'superadmin@phoenic-pack.com', '$2b$10$T7bgz44YPcemCKp5JjToguHGMXQatzf.m.mUHvjckdsSwV/44L2PS', 'super_admin', 'active', NOW(), NOW());
```

**Important:** Use `psql` interactive mode for the INSERT — PowerShell mangles `$` characters in the bcrypt hash. The first attempt via `-c` flag truncated the password to `.m.mUHvjckdsSwV/44L2PS` and login failed with "Security key verification failed."

This is temporary until the Inpack-specific code update lands with proper migrations and seed data for that DB.

---

## Step 21: Mattermost Installation — DONE

### Why WSL1 (not Docker, not native binary)

- Docker Desktop doesn't support Windows Server 2019
- Docker Engine on Windows only runs Windows containers, not Linux
- Mattermost dropped Windows server binaries in February 2025
- WSL1 is the only viable native option (Server 2019 doesn't support WSL2)

### Setup Steps Done

**WSL1 + Ubuntu 20.04:**
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux
# Restart required
Invoke-WebRequest -Uri https://aka.ms/wslubuntu2004 -OutFile C:\Ubuntu.zip -UseBasicParsing
Expand-Archive C:\Ubuntu.zip -DestinationPath C:\Ubuntu -Force
# Extract inner x64 appx
Rename-Item "C:\Ubuntu\Ubuntu_2004.2021.825.0_x64.appx" "C:\Ubuntu\Ubuntu_x64.zip"
Expand-Archive "C:\Ubuntu\Ubuntu_x64.zip" -DestinationPath C:\Ubuntu\x64 -Force
C:\Ubuntu\x64\ubuntu.exe   # Initialize, create mmadmin user
```

**Mattermost Database:**
```powershell
psql -U postgres -c "CREATE DATABASE mattermost;"
psql -U postgres -c "CREATE USER mmuser WITH PASSWORD 'MatterM0st_DB!';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mattermost TO mmuser;"
psql -U postgres -c "ALTER DATABASE mattermost OWNER TO mmuser;"
```

**Mattermost Server (Linux 10.5.1) inside WSL:**
```bash
sudo apt update && sudo apt upgrade -y
wget https://releases.mattermost.com/10.5.1/mattermost-10.5.1-linux-amd64.tar.gz
sudo tar -xzf mattermost-10.5.1-linux-amd64.tar.gz -C /opt
sudo mkdir /opt/mattermost/data
sudo useradd --system --user-group mattermost
sudo chown -R mattermost:mattermost /opt/mattermost
sudo chmod -R g+w /opt/mattermost
```

**Passwordless sudo for mmadmin** (so service doesn't hang on password prompt):
```bash
sudo visudo
# Add line: mmadmin ALL=(ALL) NOPASSWD: ALL
```

**Mattermost config** (`/opt/mattermost/config/config.json`):
- `DriverName`: `postgres`
- `DataSource`: `postgres://mmuser:MatterM0st_DB!@localhost:5432/mattermost?sslmode=disable&connect_timeout=10`
- `SiteURL`: `https://mattermost.phoenix-softwares.com`
- `EnableUploads`: `true`
- `EnableMarketplace`: `true`
- `EnableRemoteMarketplace`: `true`

**Config file permissions** (must be readable by mattermost user):
```bash
sudo chmod 664 /opt/mattermost/config/config.json
sudo chown -R mattermost:mattermost /opt/mattermost
```

### Mattermost Auto-Start (Scheduled Task)

NSSM doesn't work with WSL processes — gets `SERVICE_PAUSED` error. Used Scheduled Task instead.

Wrapper script: `C:\mattermost-service.ps1`
```powershell
while ($true) {
    wsl bash -c "cd /opt/mattermost && sudo -u mattermost ./bin/mattermost"
    Start-Sleep -Seconds 5
}
```

Scheduled Task `MattermostServer` registered at startup, runs as Administrator, no time limit.

**IMPORTANT:** `ubuntu.exe run` lands in Windows home directory — DO NOT use it. Always use `wsl bash -c` to execute commands inside Linux filesystem.

---

## Step 22: Mattermost WebSocket Fix — DONE

**Problem:** Messages didn't appear in real-time. Users had to refresh the page to see new messages. Browser console showed `WebSocket connection to 'wss://mattermost.phoenix-softwares.com/api/v4/websocket' failed`.

**Root cause:** Mattermost generates WebSocket URLs from `SiteURL`. The SiteURL was still `http://100.119.90.5:8065` (Tailscale IP) instead of the public domain. Mattermost was telling the browser to connect WebSocket to the wrong URL.

**Fix:**
1. **System Console > Web Server > Site URL** changed from `http://100.119.90.5:8065` to `https://mattermost.phoenix-softwares.com`
2. **Forward port 80 to 443**: False
3. **Connection Security**: None (Cloudflare handles SSL)
4. Tunnel config routes `mattermost.phoenix-softwares.com` directly to `http://localhost:8065` (bypasses Nginx)
5. Cloudflare SSL/TLS mode: **Flexible**, WebSockets toggle: **ON**, DNS: **Proxied (orange)**

**Note:** Editing config.json directly via nano did NOT stick reliably — the System Console approach is more reliable. The mmctl approach requires local mode which adds complexity. Stick with System Console.

---

### Priority 3: Real Test Coverage

**When:** Before relying on CI status checks to gate PRs.

**Why:** Both backend and frontend currently have only dummy tests (`expect(true).toBe(true)`). CI passes but catches nothing. Critical business logic (stock movements, auth, cascading deletes) has zero automated validation.

**What needs testing:**

**Backend (Jest + Supertest):**
- Auth endpoints: register, login, duplicate email rejection, JWT validation
- Product CRUD: create, read, update, delete, cascading stock deletion
- Stock operations: inbound, outbound, prevent negative stock, deduplication
- User management: role changes, status changes, permission enforcement
- Multi-tenant isolation: ensure Phoenix data doesn't leak to Inpack

**Frontend (Vitest + React Testing Library):**
- Login/Register forms: validation, submission, error handling
- Admin pages: product list rendering, stock table rendering
- API calls: mock axios responses, verify correct endpoints called
- Route protection: unauthenticated redirect, role-based access

**How to start:**
1. Create backend test setup with test database
2. Write tests for auth endpoints first (highest risk)
3. Write tests for stock operations (most complex)
4. Enable the CI "Require status checks to pass" branch protection rule once tests are meaningful

---

### Priority 4: IMPACK → INPACK Code Refactor

> **NOTE:** Remove this section from SERVER_SETUP.md once the refactor is completed, as it is a codebase task not a server setup task.

**When:** Next available code cleanup session.

**Why:** The company is called "Inpack" but the codebase inconsistently uses "impack" in variable names, env vars, and config. The database on the server is already named `inpack_db` (correct). The code needs to match.

**What needs changing:**
- `backend/src/config/dbManager.js`: `impackPool` → `inpackPool`, `IMPACK_DB` → `INPACK_DB`
- `backend/.env.example`: `IMPACK_DB` → `INPACK_DB`
- `backend/src/config/env.js`: any `impack` references
- `backend/scripts/seed_impack.js`: rename file and internal references
- `backend/scripts/schema_clone.js`: `impack` references
- Frontend display text: verify "Inpack" is used consistently (not "Impack")
- `ARCHITECTURE.md`: `INPACK_DB` reference in Mermaid diagram
- Server `.env` file: update `IMPACK_DB=inpack_db` to `INPACK_DB=inpack_db` after code change

**After refactor:** Update the server's `.env` file:
```powershell
notepad C:\phoenix-inventory\backend\.env
```
Change `IMPACK_DB=inpack_db` to `INPACK_DB=inpack_db`. The deploy script will pull the code changes, but the `.env` must be manually updated since it's not in the repo.

---

### Priority 5: CLAUDE.md

> **NOTE:** Remove this section from SERVER_SETUP.md once CLAUDE.md is committed to the repo, as it is a project governance file not a server setup task.

**When:** Next session focused on codebase maintenance.

**Why:** CLAUDE.md provides rules and context for AI assistants (Claude Code) and contributors working on the repo. It documents the architecture, known issues, coding standards, and priority order for improvements.

**What it contains (proposed):**
- Project overview and tech stack
- Full directory structure with notes on dead code (unused services/repositories layers)
- Multi-tenancy architecture explanation
- Auth flow documentation
- Database access pattern (controllers use raw SQL, bypass services layer)
- All 20+ known issues prioritized (schema mismatches, missing deps, security gaps)
- Complete API endpoint reference including broken frontend calls
- Database schema: what exists vs what's missing from migrations
- Rules for AI assistants and contributors (git workflow, code standards, checklists)
- Environment variables reference

**Status:** Full content drafted and reviewed. Ready to commit when approved.

---

## Maintenance Notes

### Tailscale Auth Key Expiry
The `TS_AUTHKEY` GitHub Secret expires after **90 days** from creation. Before it expires:
1. Go to `https://login.tailscale.com/admin/settings/keys`
2. Generate a new auth key (Reusable ON, Ephemeral ON, 90 days, Tags OFF)
3. Update the `TS_AUTHKEY` secret at `https://github.com/HIRAKHANJI/phoenix-inventory/settings/secrets/actions`

### Node.js Upgrade (when needed)
Current: v20.18.1. Some dependencies warn about needing 20.19+. When builds start failing:
```powershell
Invoke-WebRequest -UseBasicParsing "https://nodejs.org/dist/v20.19.0/node-v20.19.0-x64.msi" -OutFile node-upgrade.msi
msiexec /i node-upgrade.msi /qn
```
Close and reopen PowerShell, verify with `node --version`, then restart the backend service:
```powershell
nssm restart PhoenixBackend
```

### knexfile.js Production Config
Migrations currently run with `--env development` because the production config requires `DATABASE_URL` which isn't set. To fix permanently, either:
- Add `DATABASE_URL=postgresql://postgres:<password>@localhost:5432/inventory_system` to `.env`
- Or update `knexfile.js` production section to use individual `DB_*` vars like development does

---

## Troubleshooting

### Service not starting
```powershell
nssm status PhoenixBackend
nssm restart PhoenixBackend
type C:\phoenix-inventory\backend\logs\service-err.log
```

### Database connection issues
```powershell
psql -U postgres -c "\l"
Get-Service postgresql*
```

### Nginx issues
```powershell
cd C:\nginx
.\nginx.exe -t
nssm restart PhoenixNginx
```

### Can't RDP after reboot
- Tailscale should auto-connect on boot (system service)
- Auto-login is enabled (no physical login needed)
- If stuck: need physical access to the server, login, check Tailscale tray icon

### SSH key not working for deploy user
- Key file: `C:\Users\deploy\.ssh\deploy_key`
- Authorized keys: `C:\ProgramData\ssh\administrators_authorized_keys`
- Check permissions: `icacls C:\ProgramData\ssh\administrators_authorized_keys`
- Restart SSH: `Restart-Service sshd`

### Mattermost not loading / 502 Bad Gateway
- Check Mattermost is actually listening: `netstat -an | findstr 8065`
- Check scheduled task: `Get-ScheduledTask -TaskName "MattermostServer" | Select TaskName, State`
- Kill zombies before restart: `wsl sudo killall mattermost`
- Then: `Stop-ScheduledTask -TaskName "MattermostServer"; Start-ScheduledTask -TaskName "MattermostServer"`

### Mattermost messages not appearing in real-time
- WebSocket issue. Check Site URL in System Console = `https://mattermost.phoenix-softwares.com`
- Cloudflare SSL/TLS = Flexible, WebSockets toggle = ON
- Tunnel ingress for mattermost goes to `http://localhost:8065` (NOT through Nginx port 80)

### Cloudflare Tunnel not connecting
- Check service: `Get-ScheduledTask -TaskName "CloudflareTunnel"`
- Check tunnel registration: `C:\cloudflared.exe tunnel list` — phoenix-tunnel should show connections
- If "system lacked sufficient buffer space" error appears, REBOOT the server — it's network buffer exhaustion from zombie processes

### Network buffer exhaustion (everything fails after multiple restarts)
- Symptoms: services say "Running" but ports aren't actually listening, local connections fail with "unable to connect"
- Cause: too many zombie WSL/cloudflared processes consumed Windows network buffers
- Fix: `shutdown /r /t 30 /c "Cleaning up"` then wait 3 minutes
- Prevention: always run `wsl sudo killall mattermost` before restarting MattermostServer task
