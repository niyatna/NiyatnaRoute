# Purge Spec: Notion & Obsidian (ALL of it — CONFIRMED BLOAT)

## Overview
Remove ALL Notion and Obsidian services, executors, and registry entries from the codebase. The user has explicitly confirmed these are bloat and must be fully deleted — including the `notion-web` executor and its provider registry.

## Files to DELETE

### Notion Services (open-sse/services/)
```
open-sse/services/notionStreamParser.ts         # Notion stream parser
open-sse/services/notionThreadSessions.ts       # Notion thread session manager
open-sse/services/notionTlsClient.ts            # Notion TLS client
open-sse/services/notionTranscriptBuilder.ts    # Notion transcript builder
open-sse/services/notionWebFallbackModels.ts    # Notion web fallback model list
open-sse/services/notionWebModels.ts            # Notion web model definitions
```

### Notion Executor
```
open-sse/executors/notion-web.ts                # Entire Notion web executor
```

### Notion Provider Registry
```
open-sse/config/providers/registry/notion-web/  # Entire directory (index.ts + config)
```

## Files to EDIT

### 1. Provider Registry Index
The provider registry likely has an import/export for `notion-web`. Find the registry barrel file and remove the notion-web entry:
```bash
grep -rn "notion-web\|notion" open-sse/config/providers/ --include='*.ts'
```
Remove the import and registration.

### 2. Any executor barrel file
If there's an executor index/barrel that imports notion-web, remove that import.
```bash
grep -rn "notion" open-sse/executors/ --include='*.ts' | grep -v "notion-web.ts"
```

### 3. Model lists / provider constants
```bash
grep -rn "notion" open-sse/ --include='*.ts' | grep -v "services/notion\|executors/notion\|config/providers/registry/notion"
```
Remove any remaining references in model catalogs, provider lists, or feature flags.

### 4. `src/` references
```bash
grep -rn "notion\|obsidian" src/ --include='*.ts' --include='*.tsx' | grep -v node_modules
```
Remove from:
- `src/app/api/providers/[id]/models/route.ts`
- `src/lib/db/core.ts`
- `src/lib/embeddings/familyGuard.ts`
- `src/lib/embeddings/service.ts`
- `src/lib/freeProxyProviders/syncCycle.ts`
- `src/lib/guardrails/credentialMasker.ts`
- `src/lib/providers/validation/transport.ts`
- `src/lib/providers/validation/webProvidersB.ts`
- `src/lib/providers/validation.ts`
- `src/shared/constants/providers/web-cookie.ts`

## Verification Commands
```bash
# Must return 0 results (case-insensitive)
grep -rni "notion\|obsidian" src/ open-sse/ --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v "// notion" | grep -v "conventional"

# Notion executor must not exist
ls open-sse/executors/notion-web.ts 2>/dev/null && echo "FAIL" || echo "PASS"

# Notion services must not exist
ls open-sse/services/notion*.ts 2>/dev/null && echo "FAIL" || echo "PASS"

# Notion registry must not exist
ls open-sse/config/providers/registry/notion-web/ 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- This may break the provider registry — audit all provider init code
- May need to remove notion from the supported providers list in UI
