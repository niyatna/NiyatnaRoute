# Implementation Plan: NiyatnaRoute Phase 1 — Codebase Purge

## Overview

Remove all dead features, bloat references, and orphaned code from the NiyatnaRoute TypeScript codebase. This is the prerequisite step before any Go/Rust migration can begin. The codebase currently has **624K lines** across **3,317 files**, with dead references to 9+ deleted features still scattered throughout. After this phase the codebase should be surgically clean, typecheck-passing, and accurately reflect only the features NiyatnaRoute actually ships.

> [!IMPORTANT]
> **Scope boundary**: This plan covers Phase 1 (Purge) ONLY. Phases 2-6 (Go/Rust rewrite) are documented in the master architecture doc but will get their own planning session after this phase is verified complete.

## Architecture Decisions

- **Hard-delete, never stub**: If a feature is dead, its files are deleted from disk. No commented-out code, no `// TODO: remove`, no empty function stubs.
- **Verify after every group**: Each task ends with `npm run typecheck:core` + targeted grep. We never move to the next task on a broken build.
- **Preserve live provider executors**: The audit confirmed Notion web-session services (`notionStreamParser.ts`, etc.) are **actively imported** by `open-sse/executors/notion-web.ts`. These are NOT bloat.
- **Conservative dashboard kills**: Only kill pages that are confirmed orphaned or belong to deleted features. Keep webhooks, usage, analytics, costs.
- **Fix user's in-flight edits first**: The user already started purging `chaosModeEnabled` from `ApiManagerPageClient.tsx`. Complete that work as Task 1.

## Task List

### Phase 1A: Dead Feature Purge (Core Logic)

### Task 1: Complete chaosMode purge from API key flow

**Description:** The user already partially removed `chaosModeEnabled` from `ApiManagerPageClient.tsx`. Complete the purge across the remaining API route, DB module, and validation schema so the API key CRUD flow is fully clean.

- [X] `grep -rn "chaosMode|chaos_mode|chaosModeEnabled" src/` returns 0 results
- [X] API key create/update flow has no reference to chaosMode
- [X] `npm run typecheck:core` exits 0

**Verification:**
- [X] `grep -rn "chaosMode" src/ open-sse/ --include='*.ts' --include='*.tsx'` → 0 hits in non-chaos files
- [X] Build: `npm run typecheck:core` exits 0
- [X] Manual: Open `/dashboard/api-manager` in browser — key editing modal renders

**Dependencies:** None (first task)

**Files likely touched:**
- `src/app/api/keys/[id]/route.ts` — remove chaosModeEnabled from destructuring, payload, update
- `src/lib/db/apiKeys.ts` — remove chaosModeEnabled field
- `src/shared/validation/schemas/keys.ts` — remove from 3 schema locations
- `src/shared/constants/publicApiRoutes.ts` — remove chaos comment

**Estimated scope:** S (4 files)

---

### Task 2: Delete chaosEngine and purge chaos from autoCombo

**Description:** Delete the standalone chaos engine file and remove chaos-related variables/logic from the virtual factory.

- [X] `open-sse/services/autoCombo/chaosEngine.ts` does not exist on disk
- [X] `grep -rn "chaos" open-sse/` returns 0 results
- [X] `npm run typecheck:core` exits 0

**Verification:**
- [X] `ls open-sse/services/autoCombo/chaosEngine.ts` → "No such file"
- [X] `grep -rni "chaos" open-sse/ --include='*.ts'` → 0 results
- [X] Build: `npm run typecheck:core` exits 0

**Dependencies:** Task 1

**Files likely touched:**
- `open-sse/services/autoCombo/chaosEngine.ts` — **DELETE**
- `open-sse/services/autoCombo/virtualFactory.ts` — remove `chaosModels` variable and all chaos logic

**Estimated scope:** S (2 files)

---

### Task 3: Delete evals schemas + promptfoo config + eval scripts

**Description:** Remove all evals/promptfoo infrastructure.

**Acceptance criteria:**
- [ ] `src/shared/validation/schemas/evals.ts` does not exist
- [ ] `promptfooconfig.yaml` does not exist
- [ ] `scripts/compression-eval/` does not exist
- [ ] `scripts/router-eval/` does not exist
- [ ] `npm run typecheck:core` exits 0

**Verification:**
- [ ] File/dir existence checks (all 4 should be gone)
- [ ] `grep -rn "promptfoo|schemas/evals" src/ open-sse/ --include='*.ts'` → 0
- [ ] Build: `npm run typecheck:core` exits 0

**Dependencies:** None

**Files likely touched:**
- `src/shared/validation/schemas/evals.ts` — **DELETE**
- `promptfooconfig.yaml` — **DELETE**
- `scripts/compression-eval/` — **DELETE directory**
- `scripts/router-eval/` — **DELETE directory**
- `src/lib/db/migrationRunner/constants.ts` — remove evals refs
- `src/shared/validation/schemas.ts` — remove evals re-export if present

**Estimated scope:** M (4-6 files/dirs)

---

### Checkpoint A: After Tasks 1-3
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` reports 0 cycles
- [ ] `grep -rn "chaosMode|promptfoo|schemas/evals" src/ open-sse/` → 0 results
- [ ] Dev server starts without errors

---

### Task 4: Delete batches API routes + lib

**Description:** Remove the Batches & Files API endpoints and their backing library.

**Acceptance criteria:**
- [ ] `src/app/api/batches/` directory does not exist
- [ ] `src/lib/batches/` does not exist
- [ ] `npm run typecheck:core` exits 0

**Verification:**
- [ ] Directory existence checks
- [ ] `grep -rn "from.*batches|import.*batches" src/ --include='*.ts'` → 0 results
- [ ] Build: `npm run typecheck:core` exits 0

**Dependencies:** None

**Files likely touched:**
- `src/app/api/batches/` — **DELETE directory**
- `src/app/api/providers/test-batch/` — **DELETE directory**
- `src/app/api/settings/proxies/batch-activate/` — **DELETE directory**
- `src/app/api/settings/proxies/batch-delete/` — **DELETE directory**
- `src/lib/batches/` — **DELETE directory**

**Estimated scope:** M (5 directories)

---

### Task 5: Purge batch references from remaining modules

**Description:** Clean up dangling imports and references in files that depend on batch code.

**Acceptance criteria:**
- [ ] All `src/shared/constants/batch*.ts` files deleted
- [ ] `npm run typecheck:core` exits 0

**Verification:**
- [ ] `grep -rn "batchStatusCache|batchWriter|batchEndpoints|batch.ts" src/` → 0
- [ ] Build: `npm run typecheck:core` exits 0

**Dependencies:** Task 4

**Files likely touched:**
- `src/lib/cliTools/batchStatusCache.ts` — **DELETE**
- `src/lib/spend/batchWriter.ts` — **DELETE**
- `src/shared/constants/batch.ts` — **DELETE**
- `src/shared/constants/batchEndpoints.ts` — **DELETE**
- `src/domain/quotaCache.ts` — purge batch refs
- `src/lib/db/migrationRunner/constants.ts` — purge batch migration refs

**Estimated scope:** M (5-6 files)

---

### Task 6: Delete dead SQL migrations (a2a, batches, gamification, discovery)

**Description:** Remove orphaned SQL migration files for features that no longer exist.

**Acceptance criteria:**
- [ ] 5 dead migration files deleted
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Tasks 4-5

**Files likely touched:**
- `src/lib/db/migrations/002_mcp_a2a_tables.sql` — **DELETE**
- `src/lib/db/migrations/028_create_files_and_batches.sql` — **DELETE**
- `src/lib/db/migrations/060_create_gamification.sql` — **DELETE**
- `src/lib/db/migrations/074_discovery_results.sql` — **DELETE**
- `src/lib/db/migrations/112_batch_item_checkpoints.sql` — **DELETE**

**Estimated scope:** S (5 files, no logic changes)

---

### Checkpoint B: After Tasks 4-6
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` reports 0 cycles
- [ ] `grep -rn "batches|batchWriter|batchStatusCache" src/` → 0 results

---

### Phase 1B: Dead Feature Purge (UI & Navigation)

### Task 7: Delete useElectron hook + purge electron refs

**Description:** Remove the Electron integration hook and all `window.electronAPI` references.

**Acceptance criteria:**
- [ ] `src/shared/hooks/useElectron.ts` does not exist
- [ ] `grep -rn "electronAPI|useElectron|isElectron" src/` returns 0 results
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** None

**Files likely touched:**
- `src/shared/hooks/useElectron.ts` — **DELETE**
- `src/app/(dashboard)/dashboard/settings/components/AppearanceTab.tsx` — purge electron refs
- `src/app/(dashboard)/dashboard/HomePageClient.tsx` — purge electron refs
- `src/shared/components/layouts/DashboardLayout.tsx` — purge electron refs
- `src/shared/components/Header.tsx` — purge electron refs

**Estimated scope:** M (5 files)

---

### Task 8: Delete gamification components + purge badge refs

**Description:** Remove the gamification system (BadgeToast, notification SSE). Note: `CliStatusBadge`, `QuantumLockBadge`, `RiskGateBadge` are UI status indicators, NOT gamification — they stay.

**Acceptance criteria:**
- [ ] `src/app/(dashboard)/dashboard/components/BadgeToast.tsx` does not exist
- [ ] `grep -rn "gamification|/api/gamification" src/` returns 0 results
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** None

**Files likely touched:**
- `src/app/(dashboard)/dashboard/components/BadgeToast.tsx` — **DELETE**
- Files that import BadgeToast — remove import + usage

**Estimated scope:** S (2-3 files)

---

### Task 9: Purge evals + a2a from sidebar, header, breadcrumbs

**Description:** Clean the navigation components of all references to deleted features.

**Acceptance criteria:**
- [ ] Header menu has no evals, a2a, or discovery items
- [ ] Breadcrumbs has no evals, a2a paths
- [ ] `sidebarVisibility.ts` has no evals, a2a entries
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Task 3

**Files likely touched:**
- `src/shared/components/Breadcrumbs.tsx`
- `src/shared/components/Header.tsx`
- `src/shared/constants/sidebarVisibility.ts`

**Estimated scope:** S (3 files)

---

### Checkpoint C: After Tasks 7-9
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` reports 0 cycles
- [ ] Dashboard navigation renders cleanly

---

### Phase 1C: Dead Dashboard Pages & API Routes

### Task 10: Delete confirmed-dead dashboard pages (batch 1)

**Description:** Delete dashboard page directories that belong to deleted features.

**Acceptance criteria:**
- [ ] 8 dead page directories deleted
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Tasks 7-9

**Files likely touched:**
- `src/app/(dashboard)/dashboard/activity/` — **DELETE**
- `src/app/(dashboard)/dashboard/audit/` — **DELETE**
- `src/app/(dashboard)/dashboard/auto-combo/` — **DELETE**
- `src/app/(dashboard)/dashboard/cache/` — **DELETE**
- `src/app/(dashboard)/dashboard/changelog/` — **DELETE**
- `src/app/(dashboard)/dashboard/cli-agents/` — **DELETE**
- `src/app/(dashboard)/dashboard/context/` — **DELETE**
- `src/app/(dashboard)/dashboard/onboarding/` — **DELETE**

**Estimated scope:** M (8 directories)

---

### Task 11: Delete confirmed-dead dashboard pages (batch 2)

**Description:** Continue deleting confirmed unused dashboard pages.

**Acceptance criteria:**
- [ ] 7 more dead page directories deleted
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Task 10

**Files likely touched:**
- `src/app/(dashboard)/dashboard/api-endpoints/` — **DELETE**
- `src/app/(dashboard)/dashboard/endpoint/` — **DELETE**
- `src/app/(dashboard)/dashboard/free-tiers/` — **DELETE**
- `src/app/(dashboard)/dashboard/limits/` — **DELETE**
- `src/app/(dashboard)/dashboard/media-providers/` — **DELETE**
- `src/app/(dashboard)/dashboard/runtime/` — **DELETE**
- `src/app/(dashboard)/dashboard/system/` — **DELETE**

**Estimated scope:** M (7 directories)

---

### Task 12: Delete dead API routes

**Description:** Remove API routes for deleted features.

**Acceptance criteria:**
- [ ] Dead API route directories deleted
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Tasks 4-5

**Files likely touched:**
- `src/app/api/vnc-session/` — **DELETE**
- `src/app/api/tunnels/` — **DELETE**
- `src/app/api/openapi/` — **DELETE**
- `src/app/api/version-manager/` — **DELETE**
- `src/app/api/telemetry/` — **DELETE**
- `src/app/api/storage/` — **DELETE**
- `src/app/api/providers/[id]/models/discovery/` — **DELETE**
- `src/app/api/providers/[id]/models/discoveryConfig.ts` — **DELETE**
- `src/app/api/providers/[id]/models/discoveryClientVersion.ts` — **DELETE**

**Estimated scope:** L (9 directories/files)

---

### Checkpoint D: After Tasks 10-12
- [ ] `npm run typecheck:core` exits 0
- [ ] Dashboard has ≤ 21 pages (down from 36)
- [ ] Dev server starts and dashboard renders

---

### Phase 1D: Config & Root File Cleanup

### Task 13: Delete dead root config files

**Description:** Remove configuration files for tools NiyatnaRoute doesn't use.

**Acceptance criteria:**
- [ ] Dead config files deleted
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** None

**Files likely touched:**
- `stryker.conf.json` — **DELETE**
- `stryker.disablebail.json` — **DELETE**
- `sonar-project.properties` — **DELETE**
- `codecov.yml` — **DELETE**
- `playwright.config.ts` — **DELETE**
- `socket.yml` — **DELETE**
- `news.json` — **DELETE**
- `perf-audit-report.md` — **DELETE**

**Estimated scope:** S (8 files)

---

### Task 14: Purge a2a references from agentSkills and logs

**Description:** Clean remaining a2a references from the agentSkills module and logs page.

**Acceptance criteria:**
- [ ] `grep -rn "a2a|agent-to-agent|A2A" src/ --include='*.ts' --include='*.tsx'` returns 0 results
- [ ] `npm run typecheck:core` exits 0

**Dependencies:** Task 9

**Files likely touched:**
- `src/app/(dashboard)/dashboard/logs/page.tsx` — purge a2a refs
- `src/lib/agentSkills/cliRegistryParser.ts` — purge a2a refs
- `src/lib/agentSkills/openapiParser.ts` — purge a2a refs
- `src/lib/agentSkills/types.ts` — purge a2a type defs
- `src/lib/agentSkills/catalog.ts` — purge a2a catalog entries

**Estimated scope:** M (4-5 files)

---

### Task 15: Final verification sweep

**Description:** Comprehensive verification that the entire purge is clean.

**Acceptance criteria:**
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` reports 0 cycles
- [ ] Every dead feature grep returns 0 results
- [ ] LOC reduced by > 20% from 624K baseline

**Verification:**
- [ ] `npm run typecheck:core` → exit 0
- [ ] `npm run check:cycles` → 0 cycles
- [ ] Grep sweep for all killed features → 0 results each
- [ ] `find src open-sse -type f \( -name '*.ts' -o -name '*.tsx' \) -exec cat {} + | wc -l` → < 500K
- [ ] Dev server starts on port 9999

**Dependencies:** All previous tasks

**Estimated scope:** XS (verification only)

---

### Checkpoint E: Phase 1 Complete
- [ ] All quality gates pass
- [ ] All dead feature greps return 0
- [ ] Dev server starts cleanly
- [ ] Dashboard renders with correct navigation
- [ ] **STOP: Plan Phase 2 (Go Engine) in a new planning session**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Deleting a file breaks an import chain 3 levels deep | High | Typecheck after EVERY task |
| "Badge" in UI is legitimate status badge vs gamification | Med | Audit each file — CliStatusBadge, QuantumLockBadge, RiskGateBadge are UI, not gamification |
| Notion services look like memory bloat but are live executors | High | **CONFIRMED LIVE** — DO NOT DELETE |
| Dead migration SQL deletion might break migration runner | Med | Audit migration runner for gap handling |
| Dashboard pages marked "dead" might have active users | Med | Conservative kill list — only pages for confirmed-deleted features |

## Open Questions

- **Dashboard pages to keep**: Should we keep `webhooks` (20 files), `usage` (29 files), `analytics` (14 files), `costs` (11 files)?
- **Electron refs in `open-sse/`**: `providerHeaderProfiles.ts` and `inAppLoginService.ts` reference electron — dead code?
- **`arenaEloSync.ts`**: Uses "leaderboard" for LMARENA model ranking, not gamification. Keep?
