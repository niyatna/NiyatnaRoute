# NiyatnaRoute Phase 1 — Codebase Purge TODO

> See [tasks/plan.md](file:///home/galyarder/orca/workspaces/NiyatnaRoute/spirula/tasks/plan.md) for full task details, acceptance criteria, and verification steps.

## Phase 1A: Dead Feature Purge (Core Logic)

- [X] **Task 1:** Complete chaosMode purge from API key flow (S — 4 files)
- [X] **Task 2:** Delete chaosEngine + purge chaos from autoCombo (S — 2 files)
- [ ] **Task 3:** Delete evals schemas + promptfoo config + eval scripts (M — 6 files)

### ✅ Checkpoint A
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` → 0 cycles
- [ ] `grep -rn "chaosMode|promptfoo" src/ open-sse/` → 0

---

- [ ] **Task 4:** Delete batches API routes + lib (M — 5 dirs)
- [ ] **Task 5:** Purge batch references from remaining modules (M — 6 files)
- [ ] **Task 6:** Delete dead SQL migrations (S — 5 files)

### ✅ Checkpoint B
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` → 0 cycles
- [ ] `grep -rn "batches|batchWriter" src/` → 0

---

## Phase 1B: Dead Feature Purge (UI & Navigation)

- [ ] **Task 7:** Delete useElectron hook + purge electron refs (M — 5 files)
- [ ] **Task 8:** Delete gamification components + purge badge refs (S — 3 files)
- [ ] **Task 9:** Purge evals + a2a from sidebar, header, breadcrumbs (S — 3 files)

### ✅ Checkpoint C
- [ ] `npm run typecheck:core` exits 0
- [ ] `npm run check:cycles` → 0 cycles
- [ ] Dashboard navigation renders cleanly

---

## Phase 1C: Dead Dashboard Pages & API Routes

- [ ] **Task 10:** Delete dead dashboard pages batch 1 (M — 8 dirs)
- [ ] **Task 11:** Delete dead dashboard pages batch 2 (M — 7 dirs)
- [ ] **Task 12:** Delete dead API routes (L — 9 dirs)

### ✅ Checkpoint D
- [ ] `npm run typecheck:core` exits 0
- [ ] Dashboard ≤ 21 pages
- [ ] Dev server starts

---

## Phase 1D: Config & Root File Cleanup

- [ ] **Task 13:** Delete dead root config files (S — 8 files)
- [ ] **Task 14:** Purge a2a references from agentSkills + logs (M — 5 files)
- [ ] **Task 15:** Final verification sweep (XS — read-only)

### ✅ Checkpoint E: Phase 1 Complete
- [ ] All quality gates pass
- [ ] All dead feature greps → 0
- [ ] LOC reduced > 20% from 624K
- [ ] Dev server starts on port 9999
- [ ] **⏸ PAUSE — Plan Phase 2 (Go Engine) separately**
