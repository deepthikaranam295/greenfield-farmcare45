#!/bin/bash
# server-setup.sh
# Run this ON THE VPS after uploading the project.
# Usage: bash scripts/server-setup.sh
set -euo pipefail

APP_DIR="/opt/greenfield-farm-care"

echo "==> [1/5] Installing Docker & dependencies"
apt-get update -q
apt-get install -yq docker.io docker-compose-plugin curl ufw
systemctl enable --now docker

echo "==> [2/5] Configuring firewall"
ufw --force enable
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
echo "  Firewall: ports 22, 80, 443 open"

echo "==> [3/5] Creating env files"
cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "  !! REQUIRED: Edit /opt/greenfield-farm-care/.env"
  echo "     Set POSTGRES_PASSWORD and VITE_API_URL (your domain or IP)"
  echo "     Run: nano /opt/greenfield-farm-care/.env"
  echo ""
fi

if [ ! -f backend/.env.production ]; then
  cp backend/.env.production.example backend/.env.production
  # Generate a random SECRET_KEY automatically
  SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
  sed -i "s/CHANGE_ME_STRONG_RANDOM_64_CHAR_HEX/$SECRET/" backend/.env.production
  echo "  ✓ Generated SECRET_KEY automatically"
  echo ""
  echo "  !! REQUIRED: Edit /opt/greenfield-farm-care/backend/.env.production"
  echo "     Set ALLOWED_ORIGINS to your domain or http://YOUR_IP"
  echo "     Run: nano /opt/greenfield-farm-care/backend/.env.production"
  echo ""
fi

echo "==> [4/5] Building Docker images (this takes 3-5 minutes)"
docker compose build --no-cache

echo "==> [5/5] Starting all services"
cp nginx/conf.d/app-init.conf nginx/conf.d/active.conf
# Use HTTP-only nginx first (SSL comes after domain is ready)
# Patch placeholder in nginx config with real values
docker compose up -d

echo ""
echo "======================================================"
echo "  Server setup complete!"
echo "======================================================"
echo ""
docker compose ps
echo ""
echo "Next steps:"
echo "  1. Seed the database:  docker compose exec backend python seed.py"
echo "  2. Test the API:       curl http://$(hostname -I | awk '{print $1}')/health"
echo "  3. When domain is ready, run: bash scripts/init-ssl.sh yourdomain.com your@email.com"
echo ""
