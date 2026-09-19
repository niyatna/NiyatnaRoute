# Purge Spec: Dead Dashboard Pages

## Overview
Delete dashboard pages that belong to deleted features or are confirmed bloat. Kill at least 20 of 36 pages.

## Pages to DELETE (Batch 1 — deleted features)
```
src/app/(dashboard)/dashboard/activity/          # Activity feed — unused
src/app/(dashboard)/dashboard/audit/             # Audit log — unused
src/app/(dashboard)/dashboard/auto-combo/        # Auto-combo — merged into combos
src/app/(dashboard)/dashboard/cache/             # Cache management — unused
src/app/(dashboard)/dashboard/changelog/         # Changelog viewer — dead
src/app/(dashboard)/dashboard/cli-agents/        # CLI agents page — dead
src/app/(dashboard)/dashboard/context/           # Context/omniglyph — dead
src/app/(dashboard)/dashboard/onboarding/        # Onboarding wizard — dead
```

## Pages to DELETE (Batch 2 — redundant/bloat)
```
src/app/(dashboard)/dashboard/api-endpoints/     # Redundant with endpoint/
src/app/(dashboard)/dashboard/endpoint/          # Redundant with api-endpoints/
src/app/(dashboard)/dashboard/free-tiers/        # Free tier management — dead
src/app/(dashboard)/dashboard/limits/            # Limits — merged into settings
src/app/(dashboard)/dashboard/media-providers/   # Media providers — dead
src/app/(dashboard)/dashboard/runtime/           # Runtime info — dead
src/app/(dashboard)/dashboard/system/            # System page — dead
```

## Pages to DELETE (Batch 3 — more bloat)
```
src/app/(dashboard)/dashboard/cli-code/          # CLI code page — bloat
src/app/(dashboard)/dashboard/costs/             # Costs — redundant with usage
src/app/(dashboard)/dashboard/mcp/               # MCP page — dead (MCP is in open-sse)
src/app/(dashboard)/dashboard/provider-stats/    # Provider stats — merged into providers
src/app/(dashboard)/dashboard/quota/             # Quota — redundant with usage
src/app/(dashboard)/dashboard/relay/             # Relay config — dead
src/app/(dashboard)/dashboard/search-tools/      # Search tools — dead
src/app/(dashboard)/dashboard/tools/             # Tools page — dead
src/app/(dashboard)/dashboard/translator/        # Translator — dead
```

## Pages to KEEP (8 essential)
```
src/app/(dashboard)/dashboard/combos/            # Combo management — CORE
src/app/(dashboard)/dashboard/providers/          # Provider management — CORE
src/app/(dashboard)/dashboard/playground/         # Chat playground — CORE
src/app/(dashboard)/dashboard/settings/           # Settings — CORE
src/app/(dashboard)/dashboard/logs/               # Request logs — CORE
src/app/(dashboard)/dashboard/api-manager/        # API key management — CORE
src/app/(dashboard)/dashboard/health/             # Health dashboard — CORE
src/app/(dashboard)/dashboard/compression/        # Compression config — CORE
src/app/(dashboard)/dashboard/analytics/          # Analytics — KEEP (useful)
src/app/(dashboard)/dashboard/usage/              # Usage tracking — KEEP (useful)
src/app/(dashboard)/dashboard/webhooks/           # Webhooks — KEEP (useful)
```

## Files to EDIT after page deletion
1. `src/shared/components/Header.tsx` — remove all dead page nav links
2. `src/shared/components/Breadcrumbs.tsx` — remove dead page breadcrumbs
3. `src/shared/constants/sidebarVisibility.ts` — remove dead sidebar entries
4. Any layout file that imports deleted page components

## Verification Commands
```bash
# Count remaining dashboard pages
find src/app/\(dashboard\)/dashboard -mindepth 1 -maxdepth 1 -type d | wc -l
# Should be ~11 (down from 36)

# Must exit 0
npm run typecheck:core
```

## Dependencies
- Must clean nav (Header, Breadcrumbs, sidebar) AFTER deleting pages
