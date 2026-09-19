# Purge Spec: Evals & Promptfoo

## Overview
Remove ALL evals/promptfoo infrastructure. This includes validation schemas, root config, evaluation script directories, sidebar/header/breadcrumb navigation entries, and migration runner references.

## Files to DELETE
```
src/shared/validation/schemas/evals.ts        # Evals validation schema
promptfooconfig.yaml                           # Promptfoo root config
scripts/compression-eval/                      # Entire directory (compression evaluation scripts)
scripts/router-eval/                           # Entire directory (router evaluation scripts)
```

## Files to EDIT

### 1. `src/lib/db/migrationRunner/constants.ts`
Remove any evals-related migration name constants or table references.

### 2. `src/shared/components/Breadcrumbs.tsx`
Remove evals breadcrumb path entries (e.g., `/dashboard/evals`, `/evals`).

### 3. `src/shared/components/Header.tsx`
Remove evals menu items from header navigation dropdown.

### 4. `src/shared/constants/sidebarVisibility.ts`
Remove evals sidebar entry from visibility config.

### 5. `src/shared/validation/schemas.ts`
Remove evals re-export if present:
```diff
-export * from './evals';
```

## Verification Commands
```bash
# Must return 0 results
grep -rn "promptfoo\|schemas/evals\|evals\.ts" src/ open-sse/ --include='*.ts' --include='*.tsx'

# Directories must not exist
ls scripts/compression-eval/ 2>/dev/null && echo "FAIL" || echo "PASS"
ls scripts/router-eval/ 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None (independent purge)
