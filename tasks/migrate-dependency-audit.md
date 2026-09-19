# Migration: Dependency Audit (74 Production + 49 Dev)

## Overview
Complete audit of all npm dependencies. For each: name, what it does, size impact, Go equivalent, and migration action.

## Production Dependencies — DELETE (no Go equivalent needed)

| Package | Size | Purpose | Action |
|---------|------|---------|--------|
| `next` | ~15 MB | React framework | **DELETE** — Go stdlib `net/http` |
| `react` | ~2 MB | UI library | **DELETE** — Vanilla JS |
| `react-dom` | ~4 MB | React DOM renderer | **DELETE** — Vanilla JS |
| `tailwindcss` | ~5 MB | CSS framework | **DELETE** — Vanilla CSS |
| `@tailwindcss/postcss` | ~1 MB | Tailwind PostCSS | **DELETE** |
| `framer-motion` | ~3 MB | React animations | **DELETE** — CSS animations |
| `recharts` | ~2 MB | React charts | **DELETE** — Canvas charts |
| `@radix-ui/*` | ~4 MB | UI primitives | **DELETE** — Vanilla HTML |
| `lucide-react` | ~2 MB | React icons | **DELETE** — Inline SVG |
| `@tanstack/react-query` | ~500 KB | Data fetching | **DELETE** — Vanilla fetch |
| `@tanstack/react-table` | ~300 KB | Table component | **DELETE** — Vanilla table |
| `@tanstack/react-virtual` | ~100 KB | Virtual scrolling | **DELETE** — Vanilla scroll |
| `class-variance-authority` | ~50 KB | CSS utility | **DELETE** |
| `clsx` | ~5 KB | Class names | **DELETE** |
| `cmdk` | ~50 KB | Command palette | **DELETE** |
| `next-themes` | ~20 KB | Theme manager | **DELETE** — CSS `prefers-color-scheme` |
| `sonner` | ~30 KB | Toast notifications | **DELETE** — Vanilla toast |
| `nuqs` | ~20 KB | URL state management | **DELETE** |

## Production Dependencies — REPLACE with Go equivalent

| Package | Size | Purpose | Go Equivalent | Action |
|---------|------|---------|--------------|--------|
| `better-sqlite3` | ~5 MB | SQLite driver | `github.com/mattn/go-sqlite3` | **REPLACE** |
| `zod` | ~500 KB | Schema validation | Go struct tags + custom validation | **REPLACE** |
| `uuid` | ~20 KB | UUID generation | `github.com/google/uuid` | **REPLACE** |
| `bcrypt` / `bcryptjs` | ~100 KB | Password hashing | `golang.org/x/crypto/bcrypt` | **REPLACE** |
| `dotenv` | ~20 KB | Env file loading | `github.com/joho/godotenv` (or none — Go reads env natively) | **REPLACE** |
| `date-fns` | ~2 MB | Date utilities | Go `time` stdlib | **REPLACE** |

## Production Dependencies — KEEP (port to Rust FFI)

| Package | Size | Purpose | Rust Equivalent |
|---------|------|---------|----------------|
| `tiktoken` | ~3 MB | Token counting | `tiktoken-rs` crate |
| `gpt-tokenizer` | ~1 MB | GPT tokenizer | Part of `tiktoken-rs` |

## Production Dependencies — DELETE (dead feature)

| Package | Purpose | Dead Feature |
|---------|---------|-------------|
| `@anthropic-ai/sdk` | Anthropic SDK | Use raw HTTP in Go |
| `@google/generative-ai` | Gemini SDK | Use raw HTTP in Go |
| `openai` | OpenAI SDK | Use raw HTTP in Go |
| `ws` | WebSocket | Go stdlib `golang.org/x/net/websocket` |
| `eventsource-parser` | SSE parser | Custom Go SSE parser (trivial) |
| `marked` | Markdown parser | Dead dashboard feature |
| `@monaco-editor/react` | Code editor | Dead dashboard feature |
| `react-syntax-highlighter` | Syntax highlighting | Dead dashboard feature |
| `prismjs` | Code highlighting | Dead dashboard feature |

## Dev Dependencies — DELETE ALL

| Package | Purpose | Action |
|---------|---------|--------|
| `@types/react` | TS types for React | **DELETE** |
| `@types/node` | TS types for Node | **DELETE** |
| `typescript` | TypeScript compiler | **DELETE** — Go is statically typed |
| `eslint` + plugins | Linting | **DELETE** — `gofmt`, `golangci-lint` |
| `prettier` | Code formatting | **DELETE** — `gofmt` |
| `vitest` | Test runner | **DELETE** — `go test` |
| `@stryker-mutator/*` | Mutation testing | **DELETE** |
| `playwright` | E2E testing | **DELETE** |
| `postcss` | CSS processing | **DELETE** |
| `webpack` | Bundler | **DELETE** — Go `embed.FS` |

## Summary

| Category | Current Count | After Migration |
|----------|-------------|----------------|
| npm production deps | 74 | **0** |
| npm dev deps | 49 | **0** |
| Go dependencies | 0 | **~8** |
| Rust dependencies | 0 | **~4** |
| `node_modules` size | 3.4 GB | **0 bytes** |
| **Total binary size** | N/A | **< 15 MB** |
