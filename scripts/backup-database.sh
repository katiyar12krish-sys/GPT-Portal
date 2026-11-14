#!/usr/bin/env bash
# UGIP Tanakpur Portal - daily database backup (Linux / Ubuntu server).
#
# What it does
#   1. Saves the whole PostgreSQL database into one file: ugip_<date>.dump
#   2. Keeps every backup of the last 30 days, and the backup of the 1st of every month for 5 years.
#
# Run it every night at 11 PM:   crontab -e   and add the line
#   0 23 * * *  DATABASE_URL="postgresql://ugip:PASSWORD@localhost:5432/ugip" /opt/ugip-portal/scripts/backup-database.sh /mnt/backup-disk/ugip
#
# Restore (replaces current data - be careful):
#   pg_restore --clean --if-exists --dbname="$DATABASE_URL" /mnt/backup-disk/ugip/ugip_2026-11-09_2300.dump
set -euo pipefail

BACKUP_DIR="${1:-/mnt/backup-disk/ugip}"   # use a DIFFERENT disk from the one the server runs on
KEEP_DAILY_DAYS=30
KEEP_MONTHLY_DAYS=$((365 * 5))

: "${DATABASE_URL:?DATABASE_URL is not set}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y-%m-%d_%H%M)"

pg_dump --dbname="$DATABASE_URL" --format=custom --file="$BACKUP_DIR/ugip_$STAMP.dump"

# uploaded files of demo mode, if the portal ever ran without a database
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/../.demo-data" ]; then
  tar -czf "$BACKUP_DIR/demo-data_$STAMP.tar.gz" -C "$SCRIPT_DIR/.." .demo-data
fi

# delete old daily backups; keep 1st-of-month backups for 5 years
find "$BACKUP_DIR" -type f \( -name 'ugip_*' -o -name 'demo-data_*' \) ! -name '*-01_*' -mtime +"$KEEP_DAILY_DAYS" -delete
find "$BACKUP_DIR" -type f \( -name 'ugip_*' -o -name 'demo-data_*' \) -name '*-01_*' -mtime +"$KEEP_MONTHLY_DAYS" -delete

echo "Backup saved: $BACKUP_DIR/ugip_$STAMP.dump"
