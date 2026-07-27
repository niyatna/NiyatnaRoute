# NiyatnaRoute Architecture

## Executive Summary

**NiyatnaRoute** is a lightweight, ultra-fast AI Gateway & LLM Proxy Router built on Next.js 16 (App Router) and SQLite.
It provides a high-throughput OpenAI-compatible endpoint (`/v1/*`) that routes traffic across LLM providers with format translation, combo fallback strategies, RTK/Caveman prompt compression, and zero resource waste.

---

## 🏗️ Core Architecture Components

### 1. High-Throughput Proxy Router (`open-sse/`)
- Unified `/v1/chat/completions`, `/v1/embeddings`, `/v1/images/generations`, `/v1/audio/*`, and `/v1/search` endpoints.
- Format translators (OpenAI ↔ Anthropic, Gemini, DeepSeek, etc.).

### 2. Combo Routing Engine (`open-sse/services/combo.ts`)
- 17 Combo routing strategies (Priority, Weighted, Round-Robin, P2C, Headroom, Fusion, Cost-Optimized, Wildcard).
- Account fallback and circuit breaker resilience layers.

### 3. Prompt Compression Engine (`open-sse/services/compression/`)
- `rtk`: Rule-based terminal & tool output token reduction.
- `caveman`: Semantic condensation.
- `headroom`: Context window headroom buffer management.

### 4. Lean MCP Server (`open-sse/mcp-server/`)
- 15 Core Tools listening on port **`9999`**.

### 5. SQLite Data Layer (`src/lib/db/`)
- WAL-mode SQLite database storing provider credentials, combos, quotas, and compression stats.
