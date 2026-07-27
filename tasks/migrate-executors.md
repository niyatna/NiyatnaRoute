# Migration: Provider Executors (TypeScript → Go)

## Overview
Port provider executors from `open-sse/executors/` to Go. Executors handle provider-specific request construction, authentication, and response parsing. Notion executor is DELETED (bloat).

## Executor Priority & Complexity

### Tier 1 — Port First (API-key based, simple)
| Executor | TS Source | Complexity | Notes |
|----------|-----------|-----------|-------|
| **default** | `executors/default/` | Low | Generic OpenAI-compatible — covers 80% of providers |
| **antigravity** | `executors/antigravity/` | Low | Google Antigravity SDK |
| **codex** | `executors/codex/` | Medium | Codex CLI integration |

### Tier 2 — Port Second (API-key based, medium)
| Executor | TS Source | Complexity | Notes |
|----------|-----------|-----------|-------|
| **kiro** | `executors/kiro/` | Medium | AWS Kiro with IdP auth |
| **promptql** | `executors/promptql/` | Medium | PromptQL query translation |

### Tier 3 — Port Last (Web session, complex)
| Executor | TS Source | Complexity | Notes |
|----------|-----------|-----------|-------|
| **chatgpt-web** | `executors/chatgpt-web/` | High | TLS fingerprint, cookie auth, conversation threads |
| **claude-web** | `executors/claude-web/` | High | TLS fingerprint, cookie auth, org selection |
| **deepseek-web** | `executors/deepseek-web/` | High | Web session management |
| **grok-web** | `executors/grok-web/` | High | X.com cookie auth |
| **cursor** | `executors/cursor/` | High | Cursor session + protobuf |
| **huggingchat** | `executors/huggingchat/` | Medium | HF cookie auth |
| **duckduckgo-web** | `executors/duckduckgo-web/` | Medium | Stateless web API |
| **lmarena** | `executors/lmarena/` | High | Arena battle mode, TLS client |
| **muse-spark-web** | `executors/muse-spark-web/` | Medium | Muse/Spark web |
| **perplexity-web** | `executors/perplexity-web/` | Medium | Perplexity web session |

### DELETED (Bloat)
| Executor | Status |
|----------|--------|
| ~~notion-web~~ | **DELETED** — confirmed bloat |

## Go Executor Interface
```go
type Executor interface {
    Name() string
    ProviderType() string
    Execute(ctx context.Context, req *ChatRequest, cfg *ProviderConfig) (*http.Response, error)
    SupportsStreaming() bool
    RequiresCookieAuth() bool
}
```

## Implementation Strategy
1. Port `default` executor first — it handles all standard OpenAI-compatible APIs
2. Run the `default` executor for OpenAI, Anthropic, Gemini, DeepSeek (API mode) — covers 90% of usage
3. Port web-session executors in a later phase (requires Rust TLS fingerprint)
4. Each executor gets its own Go file: `internal/executor/{name}.go`

## Executor → Translator Mapping
| Executor | Translator |
|----------|-----------|
| default | Auto-detect from provider type |
| antigravity | Gemini translator |
| codex | OpenAI translator |
| chatgpt-web | OpenAI translator + web session |
| claude-web | Anthropic translator + web session |
| deepseek-web | DeepSeek translator + web session |

## Test Strategy
- Record HTTP fixtures per executor
- Mock HTTP server in tests
- Integration test against real APIs (optional, CI-only)
