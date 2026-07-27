# NiyatnaRoute — Agent Guidelines & Master Architecture

## 1. Project Overview & Rebrand

**NiyatnaRoute** (workspace: `spirula`) is an ultra-fast, lightweight, ultra-lean AI Gateway & LLM Proxy Router built for performance, privacy, and zero resource waste.

- **Brand**: NiyatnaRoute
- **Core Purpose**: High-throughput LLM Proxy Router (OpenAI, Anthropic, Gemini, DeepSeek, Custom Relays)
- **Port**: Default listener on **port 9999** (`http://localhost:9999`)
- **UI Aesthetics**: Fast, small, sleek, beautiful dark-mode UI — zero clutter, modern micro-interactions, no generic styles.
- **Resource Footprint**: Max 1024MB V8 heap memory limit, ~0-2% idle CPU, ready in < 2 seconds.

---

## 2. Core Directives & Hard Rules (ZERO BLOAT POLICY)

1. **Rebrand to NiyatnaRoute**: All user-facing UI, headers, metadata, and docs must reflect NiyatnaRoute.
2. **Zero Sponsors & Zero Affiliates**: Permanently remove all Kimi / Moonshot / third-party sponsor banners, promo cards, and affiliate presets.
3. **Hard Deletion (No Dummy Stubs / No Commented Code)**:
   If a feature is unused or bloated, **DELETE IT COMPLETELY FROM DISK**. Never leave commented-out code, unimported imports, or dummy stubs.
4. **Port 9999 Standard**: The server, API, and MCP tools must default to port `9999`.
5. **Doc Accuracy Discipline**:
   Never state an API name, file path, or count without grepping for it first. Every claim in docs must be 100% verifiable against the codebase (`grep -rn`).

---

## 3. Retained Core Architecture (KEEP)

- 🚀 **High-Throughput Proxy Router**: OpenAI/Anthropic/Gemini/DeepSeek/Custom endpoints (`/v1/chat/completions`, `/v1/embeddings`, etc.)
- 🔀 **17 Combo Routing Strategies**: Priority, weighted, round-robin, P2C, headroom, fusion, cost-optimized, wildcard router.
- ⚡ **3 Essential Prompt Compression Engines**: `rtk`, `caveman`, and `headroom`.
- 📡 **Relay Proxies**: Vercel AI Gateway & Cloudflare AI Gateway relays (`relayProbeStats.ts`).
- 🛠️ **Testing UI**: Sleek Playground, Presets, Webhooks, and Media testing UI.
- 🛠️ **OMP CLI Sync**: Credential sync for `~/.omp/agent/agent.db`.
- 🔌 **15 Core MCP Server Tools & CLI**: MCP listener on port **9999**.

---

## 4. Stripped Bloatware (PERMANENTLY DELETED)

- ❌ **Electron Desktop App** (`electron/` deleted)
- ❌ **Agent-to-Agent Protocol** (`a2a-server` / `/api/a2a/*` deleted)
- ❌ **Plugins System** (`plugins.ts` / `/api/plugins/*` deleted)
- ❌ **Gamification System** (Leaderboards, Badges, Achievements deleted)
- ❌ **Notion & Obsidian Memory** (`notion.ts`, `obsidian.ts`, `/api/memory/*` deleted)
- ❌ **Batch Jobs & Files API** (`batches.ts`, `files.ts` deleted)
- ❌ **Evals, Chaos Mode, Discovery** (`evals.ts`, `chaosMode`, `discovery.ts` deleted)
- ❌ **Agent Bridge, Traffic Inspector, MITM Proxy, 1Proxy** (`agentBridge*`, `inspector*`, `oneproxy` deleted)
- ❌ **Browser Pool & Grok Clearance** (`browserPool.ts`, `browserBackedChat.ts` deleted)

---

## 5. Development & Build Commands

```bash
npm run dev                  # Start NiyatnaRoute dev server on http://localhost:9999 (Webpack Light, max 1024MB RAM)
npm run build                # Production build: next build -> dist/
npm run typecheck:core       # TypeScript strict typecheck (must exit 0)
npm run check:cycles         # Check for circular dependencies (must be 0)
npm run test:vitest          # Run vitest unit tests
```

---

## 6. Code Style & Verification

- **Target**: ES2022 / Next.js 16 (App Router) / Tailwind CSS v4 / SQLite (`better-sqlite3`).
- **Database**: Access SQLite only via `src/lib/db/` modules. Never write raw SQL in API routes.
- **Verification**: Never declare success without running `npm run typecheck:core` and `npm run check:cycles`.
