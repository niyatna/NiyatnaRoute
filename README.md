# ⚡ NiyatnaRoute — Ultra-Fast, Ultra-Lean AI Gateway & Proxy Router

**NiyatnaRoute** is a lightweight, high-performance AI Gateway and LLM Proxy Router built for extreme speed, low resource consumption, and zero bloatware.

---

## ✨ Features

- 🚀 **High-Throughput LLM Proxy**: Route requests across 160+ AI providers (OpenAI, Anthropic, Gemini, DeepSeek, Custom Relays) via standard `/v1/chat/completions`.
- 🔀 **17 Combo Routing Strategies**: Priority, weighted, round-robin, P2C, headroom, fusion, cost-optimized, wildcard router.
- ⚡ **Prompt Compression**: Integrated `rtk`, `caveman`, and `headroom` compression engines.
- 🔌 **15 Core MCP Tools & CLI**: Native MCP server listening on port **9999**.
- 📡 **Relay Proxies**: Vercel AI Gateway & Cloudflare AI Gateway relays.
- 🛠️ **Testing UI**: Sleek Playground, Presets, Webhooks, & Media testing UI.
- ⚡ **Ultra-Lean Resource Usage**: < 1024MB RAM allocation, ~0-2% idle CPU, ready in < 2 seconds.
- 🚫 **Zero Bloat & Zero Sponsors**: 100% clean codebase — no Electron app, no Gamification, no A2A, no Notion/Obsidian memory, no sponsor banners.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start NiyatnaRoute dev server (port 9999)
npm run dev
```

Open [http://localhost:9999](http://localhost:9999) in your browser.

---

## 🛠️ Verification Commands

```bash
npm run typecheck:core       # TypeScript check (0 errors)
npm run check:cycles         # Circular dependency check (0 cycles)
npm run test:vitest          # Run vitest suite
```
