# UGIP Tanakpur Portal - daily database backup (Windows).
#
# What it does
#   1. Saves the whole PostgreSQL database into one file: ugip_<date>.dump
#   2. Keeps every backup of the last 30 days, and the backup of the 1st of every month for 5 years.
#      So you can go back to any day of the last month, or any month of the last 5 years.
#
# How to run it every night (Windows Task Scheduler)
#   Program:   powershell.exe
#   Arguments: -ExecutionPolicy Bypass -File "C:\ugip-portal\scripts\backup-database.ps1" -BackupDir "E:\UGIP-Backups"
#   Trigger:   Daily, 11:00 PM.  Run whether the user is logged on or not.
#
# Needs: PostgreSQL installed (pg_dump.exe), and DATABASE_URL set as a system environment variable
#        (the same value as in .env.local).
#
# Restore a backup (replaces the current data - be careful):
#   pg_restore --clean --if-exists --dbname="%DATABASE_URL%" "E:\UGIP-Backups\ugip_2026-11-09_2300.dump"

param(
  [string]$BackupDir = "E:\UGIP-Backups",   # put this on a DIFFERENT disk (external HDD / second drive)
  [int]$KeepDailyDays = 30,                 # keep every daily backup this long
  [int]$KeepMonthlyYears = 5                # keep the 1st-of-month backup this long
)

$ErrorActionPreference = "Stop"
if (-not $env:DATABASE_URL) { throw "DATABASE_URL is not set. Add it as a system environment variable." }

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$file = Join-Path $BackupDir "ugip_$stamp.dump"

# --format=custom = compressed, and pg_restore can restore single tables from it
& pg_dump --dbname="$env:DATABASE_URL" --format=custom --file="$file"
if ($LASTEXITCODE -ne 0) { throw "pg_dump failed (exit code $LASTEXITCODE)." }

# Also copy the uploaded files of demo mode, if the portal ever ran without a database
$demo = Join-Path $PSScriptRoot "..\.demo-data"
if (Test-Path $demo) {
  Compress-Archive -Path $demo -DestinationPath (Join-Path $BackupDir "demo-data_$stamp.zip") -Force
}

# Clean up: delete old daily backups, but never a 1st-of-month backup younger than 5 years
$now = Get-Date
Get-ChildItem $BackupDir -File | ForEach-Object {
  if ($_.Name -notmatch '^(ugip|demo-data)_(\d{4})-(\d{2})-(\d{2})_') { return }
  $day = [int]$Matches[4]
  $age = $now - $_.LastWriteTime
  $isMonthly = ($day -eq 1)
  if ((-not $isMonthly -and $age.TotalDays -gt $KeepDailyDays) -or ($isMonthly -and $age.TotalDays -gt 365 * $KeepMonthlyYears)) {
    Remove-Item $_.FullName
  }
}

Write-Output "Backup saved: $file"
