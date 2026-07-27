# [COMPLETED] Purge Spec: chaosMode

## Overview
Remove ALL chaosMode/chaosModeEnabled references from the entire codebase. This includes API key fields, validation schemas, the standalone chaos engine, and autoCombo virtual factory chaos logic.

## Files to DELETE (hard delete from disk)
```
open-sse/services/autoCombo/chaosEngine.ts    # 500+ line standalone chaos engine
```

## Files to EDIT (remove specific code)

### 1. `src/app/api/keys/[id]/route.ts`
**Remove from destructuring (~line 89):**
```diff
-      chaosModeEnabled,
```
**Remove from payload construction (~line 116):**
```diff
-    if (chaosModeEnabled !== undefined) payload.chaosModeEnabled = chaosModeEnabled;
```
**Remove from update object (~line 150):**
```diff
-      ...(chaosModeEnabled !== undefined && { chaosModeEnabled }),
```

### 2. `src/lib/db/apiKeys.ts`
**Remove field from type (~line 184):**
```diff
-  chaosModeEnabled?: boolean;
```

### 3. `src/shared/validation/schemas/keys.ts`
**Remove from 3 locations (~lines 28, 114, 139):**
```diff
-  chaosModeEnabled: z.boolean().optional(),
```
```diff
-    chaosModeEnabled: z.boolean().optional(),
```
```diff
-      value.chaosModeEnabled === undefined
```

### 4. `src/shared/constants/publicApiRoutes.ts`
**Remove chaos comment (~line 24):**
```diff
-  // chaosModeEnabled check) before doing any work. See src/app/api/skills/
```

### 5. `open-sse/services/autoCombo/virtualFactory.ts`
**Remove chaosModels variable and all chaos logic (~lines 606-645):**
```diff
-  let chaosModels: typeof models;
-  ...
-    chaosModels = diverse.length > 0 ? diverse : models.slice(0, CHAOS_MAX_PANEL);
-  ...
-    chaosModels = models;
-  ...
-    models: chaosModels,
-  ...
-              panelSize: chaosModels.length,
-              judgeModel: chaosModels[0]?.model,
```

### 6. `src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx`
**User already partially cleaned this. Verify remaining refs:**
```diff
-  chaosModeEnabled?: boolean;    # line ~129
```

## Verification Commands
```bash
# Must return 0 results
grep -rn "chaosMode\|chaosModeEnabled\|chaos_mode\|CHAOS_MAX_PANEL" src/ open-sse/ --include='*.ts' --include='*.tsx'

# Must exit 0
npm run typecheck:core

# Chaos engine file must not exist
ls open-sse/services/autoCombo/chaosEngine.ts && echo "FAIL: file still exists" || echo "PASS"
```

## Dependencies
- None (first purge task)
