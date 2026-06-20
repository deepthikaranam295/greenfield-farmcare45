#!/bin/bash
# init-ssl.sh — Run this AFTER the server is reachable on port 80
# Usage: bash scripts/init-ssl.sh yourdomain.com your@email.com
set -euo pipefail

DOMAIN="${1:?Usage: bash scripts/init-ssl.sh <domain> <email>}"
EMAIL="${2:?Usage: bash scripts/init-ssl.sh <domain> <email>}"

echo "==> Requesting certificate for $DOMAIN"
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos --no-eff-email \
  -d "$DOMAIN" -d "www.$DOMAIN"

echo "==> Patching nginx config with real domain"
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/conf.d/app.conf

echo "==> Reloading nginx with SSL config"
cp nginx/conf.d/app.conf nginx/conf.d/active.conf
docker compose exec nginx nginx -s reload

echo ""
echo "✅  SSL active at https://$DOMAIN"
