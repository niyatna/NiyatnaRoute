# Purge Spec: Gamification System

## Overview
Remove the ENTIRE gamification system — BadgeToast component, gamification notification SSE, migration SQL, and all gamification-specific badge references. NOTE: UI status badges (CliStatusBadge, QuantumLockBadge, RiskGateBadge) are NOT gamification — they are legitimate status indicators and STAY.

## Files to DELETE
```
src/app/(dashboard)/dashboard/components/BadgeToast.tsx     # Gamification badge toast
src/lib/db/migrations/060_create_gamification.sql           # Gamification DB tables
```

## Files to EDIT

### 1. `src/app/(dashboard)/dashboard/analytics/RouteExplainabilityTab.tsx`
Remove gamification badge icon reference (`icon="leaderboard"` at ~line 371 is an icon name, audit if it's gamification-tied or just an icon choice).

### 2. `src/app/(dashboard)/dashboard/api-manager/ApiManagerPageClient.tsx`
Remove any remaining gamification badge display logic or imports of BadgeToast.

### 3. `src/app/(dashboard)/dashboard/cli-code/components/CliproxyapiToolCard.tsx`
Remove gamification achievement/badge refs (NOT CliStatusBadge — that's UI status).

### 4. `src/app/(dashboard)/dashboard/cli-code/components/HermesAgentToolCard.tsx`
Remove gamification achievement/badge refs.

### 5. `src/app/(dashboard)/dashboard/combos/page.tsx`
Remove gamification badge display.

### 6. `src/app/(dashboard)/dashboard/compression/studio/CompressionAnnotation.tsx`
Remove gamification badge display.

## DO NOT DELETE (legitimate UI status badges)
```
src/app/(dashboard)/dashboard/cli-code/components/CliStatusBadge.tsx     # CLI status indicator
src/app/(dashboard)/dashboard/compression/studio/QuantumLockBadge.tsx    # Compression lock status
src/app/(dashboard)/dashboard/compression/studio/RiskGateBadge.tsx       # Risk gate status
```

## Verification Commands
```bash
# Must return 0 results
grep -rn "gamification\|/api/gamification\|BadgeToast" src/ --include='*.ts' --include='*.tsx'

# BadgeToast must not exist
ls src/app/\(dashboard\)/dashboard/components/BadgeToast.tsx 2>/dev/null && echo "FAIL" || echo "PASS"

# Migration must not exist
ls src/lib/db/migrations/060_create_gamification.sql 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None (independent purge)
