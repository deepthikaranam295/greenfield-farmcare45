#!/bin/bash
# backup-db.sh — Dumps PostgreSQL to /opt/backups/
# Add to cron: 0 2 * * * /opt/greenfield-farm-care/scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="/opt/backups/greenfield"
mkdir -p "$BACKUP_DIR"
FILENAME="$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz"

docker compose -f /opt/greenfield-farm-care/docker-compose.yml \
  exec -T db pg_dump -U "${POSTGRES_USER:-greenfield}" "${POSTGRES_DB:-greenfield_db}" \
  | gzip > "$FILENAME"

# Keep last 14 backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -delete

echo "Backup saved: $FILENAME"
