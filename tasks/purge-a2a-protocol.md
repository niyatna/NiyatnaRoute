# Purge Spec: A2A Protocol (Agent-to-Agent)

## Overview
Remove ALL Agent-to-Agent protocol references. The A2A server was already deleted, but references remain in agentSkills, logs, navigation, and SQL migrations.

## Files to DELETE
```
src/lib/db/migrations/002_mcp_a2a_tables.sql   # A2A database tables migration
```

## Files to EDIT

### 1. `src/app/(dashboard)/dashboard/context/omniglyph/sampleData.ts`
Remove a2a sample data entries. (May be deleted entirely if context/ page is killed)

### 2. `src/app/(dashboard)/dashboard/logs/page.tsx`
Remove a2a log type filters, a2a column renderers, a2a-specific UI.

### 3. `src/app/api/openapi/try/route.ts`
Remove a2a endpoint references from OpenAPI try route. (May be deleted entirely)

### 4. `src/lib/agentSkills/cliRegistryParser.ts`
Remove a2a CLI skill parser entries.

### 5. `src/lib/agentSkills/openapiParser.ts`
Remove a2a OpenAPI schema parser.

### 6. `src/lib/agentSkills/types.ts`
Remove a2a type definitions (A2ATask, A2AAgent, etc.)

### 7. `src/lib/agentSkills/catalog.ts`
Remove a2a catalog entries from the skill registry.

### 8. `src/shared/components/Breadcrumbs.tsx`
Remove a2a breadcrumb paths.

### 9. `src/shared/components/Header.tsx`
Remove a2a menu items.

### 10. `src/shared/constants/sidebarVisibility.ts`
Remove a2a sidebar visibility entry.

## Verification Commands
```bash
# Must return 0 results (case-insensitive)
grep -rni "a2a\|agent-to-agent\|A2ATask\|A2AAgent" src/ --include='*.ts' --include='*.tsx' | grep -v "node_modules"

# Migration file must not exist
ls src/lib/db/migrations/002_mcp_a2a_tables.sql 2>/dev/null && echo "FAIL" || echo "PASS"

# Must exit 0
npm run typecheck:core
```

## Dependencies
- Partially depends on dashboard page purge (context/ page)
