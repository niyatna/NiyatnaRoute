# NiyatnaRoute — Developer Guide & Core Instructions

This file provides authoritative guidance for AI assistants working in this repository.

## 🚀 Project Overview

**NiyatnaRoute** (workspace: `spirula`) is an ultra-fast, lightweight, ultra-lean AI Gateway & LLM Proxy Router built for maximum performance, minimal resource usage, zero sponsors, and zero bloatware.

- **Default Port**: **9999** (`http://localhost:9999`)
- **Memory Ceiling**: Max 1024MB V8 heap RAM
- **Bundler Mode**: Webpack Light (fast startup, ~200MB RAM, 0-2% CPU)
- **Design Aesthetic**: Fast, small, clean, beautiful dark-mode UI with sleek modern styling.

---

## 🔑 Core Directives (NEW GOALS)

1. **Rebrand Everything to NiyatnaRoute**: Maintain clean NiyatnaRoute branding across UI and docs.
2. **Zero Sponsors & Zero Affiliates**: Permanently remove all Kimi / Moonshot / third-party sponsor banners, promo cards, and affiliate presets.
3. **Hard Deletion Policy**:
   - Unused or bloated features MUST be permanently deleted from disk.
   - NEVER leave dummy stubs, commented code, or unused import wrappers.
4. **Port 9999 Enforcement**: Server, API routes, and MCP tools run on port `9999`.
5. **Empirical Verification**: Always verify code changes with `npm run typecheck:core` and `npm run check:cycles`. Never guess file contents or pretend a task is complete.

---

## 🛠️ Retained Core Stack

- **Proxy Router**: Chat/Completions, Embeddings, Images, Audio across 160+ providers.
- **Routing Engine**: 17 Combo strategies (Priority, Weighted, P2C, Headroom, Fusion, Cost-optimized, etc.).
- **Prompt Compression**: `rtk`, `caveman`, `headroom`.
- **Relay Proxies**: Vercel & Cloudflare AI Gateway relays.
- **Testing UI**: Playground, Presets, Webhooks, Media testing UI.
- **OMP CLI Sync**: Credential sync for `~/.omp/agent/agent.db`.
- **15 Core MCP Server Tools**: Listening on port `9999`.

---

## 🗑️ Permanently Deleted Bloatware

- Electron Desktop (`electron/`)
- Agent-to-Agent Protocol (`a2a-server/`)
- Plugins System (`plugins.ts`, `/api/plugins/`)
- Gamification (Leaderboards, Badges, Profiles, Tokens)
- Notion & Obsidian Memory Integrations
- Batch Jobs & Files API (`/v1/batches`, `/v1/files`)
- Evals, Chaos Mode, Discovery
- Agent Bridge, Traffic Inspector, MITM Proxy, 1Proxy
- Browser Pool & Grok Clearance

---

## ⚡ Quick Commands

```bash
npm run dev                  # Start NiyatnaRoute dev server (port 9999)
npm run build                # Production build
npm run typecheck:core       # TypeScript check (0 errors)
npm run check:cycles         # Circular dependency check (0 cycles)
npm run test:vitest          # Run vitest suite
```
