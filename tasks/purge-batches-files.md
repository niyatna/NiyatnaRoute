# Purge Spec: Batches & Files API

## Overview
Remove the ENTIRE Batches & Files API surface — routes, libraries, constants, migration SQL, and all dangling imports.

## Files to DELETE
```
# API Routes
src/app/api/batches/                           # Entire batches API directory
src/app/api/providers/test-batch/              # Test batch route
src/app/api/settings/proxies/batch-activate/   # Proxy batch activate
src/app/api/settings/proxies/batch-delete/     # Proxy batch delete

# Libraries
src/lib/batches/                               # Entire batches lib (retryFailed.ts, etc.)
src/lib/cliTools/batchStatusCache.ts           # CLI batch status cache
src/lib/spend/batchWriter.ts                   # Batch spend writer

# Constants
src/shared/constants/batch.ts                  # Batch constants
src/shared/constants/batchEndpoints.ts         # Batch endpoint definitions

# Migration SQL
src/lib/db/migrations/028_create_files_and_batches.sql
src/lib/db/migrations/112_batch_item_checkpoints.sql
```

## Files to EDIT

### 1. `src/domain/quotaCache.ts`
Remove batch-related quota cache entries and imports.

### 2. `src/lib/credentialHealth/scheduler.ts`
Remove batch-related scheduling logic.

### 3. `src/lib/db/migrationRunner.ts`
Remove batch migration references from the migration list.

### 4. `src/lib/db/migrationRunner/constants.ts`
Remove batch migration name constants.

### 5. `src/app/(dashboard)/dashboard/settings/components/ComboDefaultsTab.tsx`
Remove batch-related settings UI.

## Verification Commands
```bash
# Must return 0 results
grep -rn "batchStatusCache\|batchWriter\|batchEndpoints\|batch\.ts\|from.*batches\|import.*batches" src/ --include='*.ts' --include='*.tsx' | grep -v "batch-activate\|batch-delete\|proxies/batch"

# Directories must not exist
for d in src/app/api/batches src/lib/batches; do
  ls "$d" 2>/dev/null && echo "FAIL: $d still exists" || echo "PASS: $d gone"
done

# Must exit 0
npm run typecheck:core
```

## Dependencies
- Must complete before deleting dead SQL migrations (Task 6)
