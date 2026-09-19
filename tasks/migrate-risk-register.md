# Migration: Risk Register

## Overview
25 identified risks for the NiyatnaRoute Go+Rust migration, ranked by severity.

## Critical Risks (🔴)

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 1 | **Translator parity failure** — Go translator produces different output than TS for edge cases (tool calls, vision, multi-turn) | High | Critical | HTTP fixture golden tests; shadow-mode diffing for 1+ week before cutover |
| 2 | **CGO cross-compilation breaks** — Rust static lib + CGO linking fails on different OS/arch combos | Medium | Critical | CI matrix (linux/amd64, linux/arm64, darwin/arm64); test in Docker; use Zig as cross-compiler |
| 3 | **Web session executors impossible in Go** — TLS fingerprinting / browser cookie flows can't replicate without Node.js/Puppeteer | Medium | Critical | Rust TLS fingerprint via `rustls` + JA3 spoofing; fallback: keep TS sidecar for web executors only |
| 4 | **Data migration corrupts production DB** — Migration CLI loses or garbles credentials, usage history, or settings | Medium | Critical | Backup before migration; dry-run mode; row-count verification; rollback plan |
| 5 | **Purge breaks import chains** — Deleting "dead" files causes cascade failures in files 3+ levels deep | High | High | Typecheck after EVERY task (not at end); rollback Git commit per task |

## High Risks (🟠)

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 6 | **SSE streaming bugs** — Go `http.Flusher` doesn't flush consistently across reverse proxies (nginx, Cloudflare) | Medium | High | Test with Cloudflare proxy, nginx, Caddy; add `X-Accel-Buffering: no` header |
| 7 | **SQLite concurrent write contention** — Go goroutines hitting SQLite write lock more aggressively than Node.js single-thread | Medium | High | WAL mode + `busy_timeout=5000`; write serialization via channel; consider `modernc.org/sqlite` (pure Go, no CGO) |
| 8 | **Notion executor deletion breaks users** — Users actively using Notion web proxy lose access | Low | High | User explicitly confirmed deletion; document in migration notes |
| 9 | **Anthropic streaming format changes** — Anthropic changes their SSE event format after Go translator is written | Medium | High | Abstract translator behind interface; version-detect in headers; monitor Anthropic changelog |
| 10 | **Go binary size exceeds target** — Static linking with CGO + Rust + embedded UI > 15MB | Low | High | Use `upx` compression; strip debug symbols; subset UI fonts; lazy-load icons |

## Medium Risks (🟡)

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 11 | **Compression engine parity** — Rust RTK/Caveman produce slightly different output than TS versions | Medium | Medium | Golden file tests with TS output as baseline; semantic equivalence testing |
| 12 | **Migration runner gap handling** — Deleting migration SQL files (002, 028, 060, 074, 112) breaks sequence numbering | Medium | Medium | Audit migration runner: verify it handles gaps; add no-op migration placeholders if needed |
| 13 | **Admin UI looks amateur** — Vanilla JS + CSS without React/Tailwind produces lower-quality UI | Medium | Medium | Design system with CSS custom properties; reference modern dark-mode dashboards; iterate with screenshots |
| 14 | **Rate limiter accuracy under load** — In-memory sliding window rate limiter loses accuracy with many goroutines | Low | Medium | Use atomic operations; token bucket algorithm; benchmark under 10K concurrent |
| 15 | **tiktoken-rs model coverage** — Rust tiktoken doesn't support all models (o200k_base for GPT-4o, etc.) | Low | Medium | Verify model coverage before committing to tiktoken-rs; fallback: port tokenizer in pure Go |
| 16 | **Bedrock SigV4 signing complexity** — AWS SigV4 request signing in Go has many edge cases | Medium | Medium | Use `aws-sdk-go-v2/aws/signer/v4`; test with real Bedrock endpoint |
| 17 | **MCP protocol spec changes** — MCP spec evolves, Go implementation falls behind | Low | Medium | Abstract MCP behind interface; monitor `@modelcontextprotocol/spec` repo |
| 18 | **Dashboard page deletion kills used feature** — A page marked "dead" has active users | Medium | Medium | Conservative kill list; check analytics before deletion; keep pages marked "uncertain" |
| 19 | **Prompt cache affinity breaks** — Provider-side prompt caching logic differs from TS implementation | Medium | Medium | Record cache-hit headers from providers; test with real Anthropic prompt caching |
| 20 | **Fusion strategy complexity** — Multi-provider fusion panel requires complex async coordination in Go | Medium | Medium | Start with simple "first response wins"; add judge-panel fusion later |

## Low Risks (🟢)

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| 21 | **Go dependency supply chain** — Malicious dependency injection in Go modules | Very Low | High | Vendor all dependencies; verify checksums; minimal dependency count (~8) |
| 22 | **Port 9999 conflicts** — Users already running something on port 9999 | Low | Low | `--port` flag; fallback to next available port; clear error message |
| 23 | **Fly.io deployment issues** — Fly.io doesn't support CGO static binaries | Very Low | Medium | Test deployment early; have Docker-based fallback; alternative: Railway, Render |
| 24 | **i18n/l10n regression** — Current TS dashboard has i18n support, Go admin UI doesn't | Medium | Low | Defer i18n to post-launch; English-only for v1 |
| 25 | **Developer onboarding friction** — New devs need both Go and Rust toolchains installed | Low | Low | Docker build (no local toolchain needed); clear CONTRIBUTING.md; Makefile with `make setup` |

## Risk Response Summary

| Response Type | Count | Examples |
|---------------|-------|---------|
| **Mitigate** | 18 | Testing, CI, abstraction layers |
| **Accept** | 4 | i18n regression, onboarding friction |
| **Avoid** | 2 | Use pure Go SQLite if CGO fails; keep TS sidecar for web executors |
| **Transfer** | 1 | Fly.io → alternative hosting if incompatible |
