# Purge Spec: Discovery Module

## Overview
Remove the model discovery module — auto-discovery routes, config, client versioning, and migration SQL.

## Files to DELETE
```
src/app/api/providers/[id]/models/discovery/                # Entire discovery directory
src/app/api/providers/[id]/models/discoveryConfig.ts        # Discovery configuration
src/app/api/providers/[id]/models/discoveryClientVersion.ts # Discovery client versioning
src/lib/db/migrations/074_discovery_results.sql             # Discovery results DB table
```

## Files to EDIT

### 1. `src/app/api/providers/[id]/models/route.ts`
Remove discovery imports and discovery-related logic from the models route.

### 2. `src/lib/db/migrationRunner/constants.ts`
Remove discovery migration name constant.

## Verification Commands
```bash
# Must return 0 results
grep -rn "discovery\|Discovery" src/ --include='*.ts' --include='*.tsx' | grep -v "node_modules\|service-discovery"

# Discovery directory must not exist
ls src/app/api/providers/*/models/discovery/ 2>/dev/null && echo "FAIL" || echo "PASS"

# Migration must not exist
ls src/lib/db/migrations/074_discovery_results.sql 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None
