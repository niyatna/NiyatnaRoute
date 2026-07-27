#!/usr/bin/env bash
# bin/restore-data.sh — restore the NiyatnaRoute SQLite data volume from a snapshot
# created by bin/snapshot-data.sh. Used by the data-layer incident-recovery
# flow after stopping writers.
#
# Safety: takes a pre-restore snapshot of the CURRENT data, refuses to run
# unattended without --yes, and verifies the snapshot before overwriting.
set -euo pipefail
SCRIPT_NAME="restore-data"
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_ops-common.sh"

usage() {
  cat <<'EOF'
Usage: bin/restore-data.sh <snapshot-id> [--data-dir <path>] [--yes|-y] [-h|--help]

Restores storage.sqlite (and any sibling *.sqlite) from a snapshot. The current
data is first copied to $DB_BACKUPS_DIR/pre-restore_<UTC> as a safety net.
<snapshot-id> is a timestamp/sha, a snapshot dir name, or a path (see snapshot-data.sh).
Stop NiyatnaRoute before running, and restart it afterwards.
EOF
}

ID=""
while [ $# -gt 0 ]; do
  case "$1" in
    --yes | -y) ASSUME_YES=1; shift ;;
    --data-dir) ops_set_data_dir "${2:?--data-dir needs a value}"; shift 2 ;;
    -h | --help) usage; exit 0 ;;
    -*) ops_die "unknown argument: $1 (see --help)" ;;
    *) ID="$1"; shift ;;
  esac
done

[ -n "$ID" ] || ops_die "snapshot id required (see --help)"
snap="$(ops_find_snapshot "$ID")"
ops_log "restore source: $snap → $NIYATNAROUTE_DATA_DIR"
ops_confirm "Overwrite storage.sqlite at $NIYATNAROUTE_DATA_DIR from $snap?" || ops_die "aborted"

# Pre-restore safety copy of the live data.
if [ -f "$NIYATNAROUTE_SQLITE" ]; then
  safety="$NIYATNAROUTE_BACKUPS_DIR/pre-restore_$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$safety"
  if command -v sqlite3 >/dev/null 2>&1; then
    sqlite3 "$NIYATNAROUTE_SQLITE" "VACUUM INTO '$safety/storage.sqlite'" \
      || cp -a "$NIYATNAROUTE_SQLITE" "$safety/storage.sqlite"
  else
    cp -a "$NIYATNAROUTE_SQLITE" "$safety/storage.sqlite"
  fi
  ops_log "current data saved to $safety"
fi

mkdir -p "$NIYATNAROUTE_DATA_DIR"
# Drop stale WAL/SHM so the restored DB is authoritative, then copy in.
rm -f "$NIYATNAROUTE_SQLITE" "${NIYATNAROUTE_SQLITE}-wal" "${NIYATNAROUTE_SQLITE}-shm"
cp -a "$snap/storage.sqlite" "$NIYATNAROUTE_SQLITE"

# Restore sibling DBs captured in the snapshot.
for f in "$snap"/*.sqlite; do
  [ -e "$f" ] || continue
  [ "$(basename "$f")" = "storage.sqlite" ] && continue
  cp -a "$f" "$NIYATNAROUTE_DATA_DIR/"
done

ops_log "restore complete — restart NiyatnaRoute to pick up the restored data"
