#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="${DATA_DIR:-$ROOT_DIR/data}"
DB_FILE="${DB_FILE:-$DATA_DIR/senseisandy.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-$DATA_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

if [[ ! -f "$DB_FILE" ]]; then
  echo "Database not found at $DB_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="$BACKUP_DIR/senseisandy-$STAMP.sqlite.gz"

gzip -c "$DB_FILE" > "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name "senseisandy-*.sqlite.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Created backup: $BACKUP_FILE"

