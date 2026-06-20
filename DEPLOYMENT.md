# GreenField Farm Care — Production Deployment Guide

## Architecture

```
Browser
  │
  ▼
Nginx (80/443) ──► React SPA (static files)
  │
  └──► /api/*   ──► FastAPI backend (uvicorn, port 8000)
  └──► /docs    ──► FastAPI backend
  └──► /health  ──► FastAPI backend

FastAPI ──► PostgreSQL (port 5432, internal)
Certbot ──► Let's Encrypt (auto-renew every 12 h)
```

## Folder Structure (production)

```
greenfield-farm-care/
├── frontend/
│   ├── Dockerfile
│   └── nginx-spa.conf          # SPA fallback for the frontend container
├── backend/
│   ├── Dockerfile
│   ├── .env.production         # ← you create this (see step 3)
│   └── .env.production.example
├── nginx/
│   └── conf.d/
│       ├── app.conf            # HTTPS config (active after SSL)
│       └── app-init.conf      # HTTP-only (used during first-time SSL setup)
├── scripts/
│   ├── deploy.sh              # First-time full deploy
│   ├── init-ssl.sh            # SSL setup (called by deploy.sh)
│   └── backup-db.sh           # Daily DB backup (add to cron)
├── .env                        # ← you create this (see step 3)
├── .env.example
└── docker-compose.yml
```

---

## Step 1 — Get a VPS

Provision an Ubuntu 22.04 VPS from any provider (DigitalOcean, Hetzner, AWS Lightsail, Vultr, etc.).

Recommended minimum specs:
- 2 vCPU / 2 GB RAM / 40 GB SSD
- Ubuntu 22.04 LTS

Note your server's **public IP address** — you'll need it for DNS.

---

## Step 2 — Point Your Wix Domain to the VPS

Your domain is managed through Wix. Follow these steps to point it to your server:

### In your Wix Dashboard:
1. Go to **Dashboard → Domains**
2. Click **Manage** next to your domain
3. Click **Advanced → Manage DNS Records**
4. Find the **A record** for `@` (root domain) — click **Edit**
5. Change the value to your **VPS IP address** → Save
6. Find (or add) an **A record** for `www` — set it to the same **VPS IP address** → Save
7. Delete any existing **CNAME** for `www` if it was pointing to Wix's servers

> **Important:** Wix may show a warning that the domain will stop working with their website — that's expected, since you're replacing it.

### DNS propagation
DNS changes take **15 minutes to 48 hours** to propagate worldwide. You can check with:
```bash
nslookup yourdomain.com 8.8.8.8
# Should return your VPS IP
```

### If Wix is the Registrar (not just hosting)
If you registered the domain *through* Wix and want to use external nameservers instead, you can also transfer nameserver control to Cloudflare (free) for more control. Otherwise the DNS panel above works fine.

---

## Step 3 — Prepare the Server

SSH into your VPS:
```bash
ssh root@YOUR_VPS_IP
```

Install Docker:
```bash
apt-get update
apt-get install -y docker.io docker-compose-plugin git curl
systemctl enable --now docker
```

Clone your repository:
```bash
git clone https://github.com/YOUR_ORG/greenfield-farm-care.git /opt/greenfield-farm-care
cd /opt/greenfield-farm-care
```

---

## Step 4 — Create Environment Files

### Root `.env` (docker-compose variables)
```bash
cp .env.example .env
nano .env
```
Fill in:
```env
POSTGRES_DB=greenfield_db
POSTGRES_USER=greenfield
POSTGRES_PASSWORD=SomethingVeryStrong123!
VITE_API_URL=https://yourdomain.com      # ← your real domain
```

### Backend production env
```bash
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```
Fill in:
```env
APP_ENV=production
DEBUG=false
SECRET_KEY=<output of: python3 -c "import secrets; print(secrets.token_hex(32))">
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
# DATABASE_URL is set automatically by docker-compose
```

---

## Step 5 — Build and Start (HTTP first)

The first time, start with HTTP only so Let's Encrypt can verify domain ownership:

```bash
cd /opt/greenfield-farm-care

# Use the HTTP-only nginx config
cp nginx/conf.d/app-init.conf nginx/conf.d/active.conf

# Replace placeholder domain in configs
sed -i "s/yourdomain.com/YOUR_REAL_DOMAIN/g" nginx/conf.d/app.conf
sed -i "s/yourdomain.com/YOUR_REAL_DOMAIN/g" nginx/conf.d/active.conf

# Build and start
docker compose build --no-cache
docker compose up -d

# Verify services are running
docker compose ps
```

Verify the site loads over HTTP:
```bash
curl -I http://yourdomain.com
# Should return 200
```

---

## Step 6 — Issue SSL Certificate

```bash
bash scripts/init-ssl.sh yourdomain.com your@email.com
```

This will:
1. Run certbot to get the certificate from Let's Encrypt
2. Replace the HTTP-only nginx config with the HTTPS config
3. Reload nginx

Verify HTTPS:
```bash
curl -I https://yourdomain.com
# Should return 200 with SSL
```

---

## Step 7 — Seed the Database

```bash
docker compose exec backend python seed.py
```

This creates the default users:
| Role | Email | Password |
|---|---|---|
| Admin | admin@greenfield.com | Admin@123 |
| Field Staff | ramu@greenfield.com | Field@123 |
| Customer | venkat@example.com | Customer@123 |

**Change all passwords after first login.**

---

## Step 8 — Set Up Automatic Backups

```bash
chmod +x scripts/backup-db.sh

# Add to cron (runs at 2 AM daily)
crontab -e
# Add this line:
0 2 * * * /opt/greenfield-farm-care/scripts/backup-db.sh
```

---

## Updating the Application

```bash
cd /opt/greenfield-farm-care
git pull
docker compose build --no-cache
docker compose up -d
```

Migrations run automatically on backend startup (`alembic upgrade head`).

---

## Useful Commands

```bash
# View live logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Restart a single service
docker compose restart backend

# Run a Django-style shell
docker compose exec backend python -c "from app.database import SessionLocal; db = SessionLocal(); print('DB OK')"

# Check SSL certificate expiry
docker compose run --rm certbot certificates

# Manually renew SSL
docker compose run --rm certbot renew
```

---

## Security Checklist

- [ ] `SECRET_KEY` is a unique random 64-char hex string
- [ ] `POSTGRES_PASSWORD` is strong and unique
- [ ] `DEBUG=false` in production env
- [ ] `ALLOWED_ORIGINS` contains only your domain (no localhost)
- [ ] Default seed passwords changed after first login
- [ ] Port 5432 (PostgreSQL) is NOT exposed to the internet (docker-compose keeps it internal)
- [ ] UFW firewall allows only 22, 80, 443
- [ ] SSH key authentication enabled (disable password auth)

---

## Troubleshooting

| Problem | Check |
|---|---|
| Site not loading | `docker compose ps` — all services should be `Up` |
| 502 Bad Gateway | `docker compose logs backend` — look for startup errors |
| SSL not working | Verify DNS has propagated: `nslookup yourdomain.com` |
| Login fails | Check `ALLOWED_ORIGINS` matches your domain exactly |
| DB connection error | `docker compose logs db` — check POSTGRES_PASSWORD matches |
