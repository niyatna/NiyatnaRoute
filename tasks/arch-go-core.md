# Architecture: Go Core Engine

## Overview
NiyatnaRoute's core engine in Go — a single binary HTTP/SSE proxy server on port 9999.

## Go Module
```
module github.com/niyatna/niyatnaroute
go 1.23
```

## Key Dependencies (go.mod)
```
github.com/mattn/go-sqlite3        # SQLite with CGO
github.com/rs/cors                 # CORS middleware
github.com/google/uuid             # UUID generation
golang.org/x/sync/errgroup         # Goroutine coordination
```
Total: < 10 dependencies. No frameworks. Pure stdlib `net/http`.

## Directory Structure
```
cmd/niyatnaroute/
  main.go                          # Entry point, CLI parsing, server start

internal/
  server/
    server.go                      # HTTP server, route registration, graceful shutdown
    middleware.go                   # Auth, CORS, logging, recovery, request ID
    sse.go                         # SSE stream writer (flush-based)

  router/
    router.go                      # Router interface + combo dispatch
    strategies.go                  # Strategy registry
    priority.go                    # Priority-ordered selection
    weighted.go                    # Weighted random selection
    roundrobin.go                  # Round-robin with atomic counter
    p2c.go                         # Power of 2 choices (latency-based)
    headroom.go                    # Headroom-aware (quota remaining)
    fusion.go                      # Multi-provider fusion panel
    cost.go                        # Cost-optimized selection
    wildcard.go                    # Wildcard pattern matching
    latency.go                     # Latency-percentile-based
    quota.go                       # Quota-share-aware
    failover.go                    # Sequential failover
    geographic.go                  # Region-aware routing
    sticky.go                      # Session stickiness (hash ring)
    shadow.go                      # Shadow traffic routing
    task.go                        # Task-type-aware routing
    auto.go                        # Auto-strategy (heuristic selection)

  proxy/
    proxy.go                       # Forward request to LLM provider
    stream.go                      # Parse SSE chunks, transform, forward
    retry.go                       # Retry with next combo target on error
    timeout.go                     # Request/response timeout management

  translator/
    translator.go                  # Translator interface definition
    registry.go                    # Translator auto-detection from provider
    openai.go                      # OpenAI passthrough (identity)
    anthropic.go                   # OpenAI ↔ Anthropic Messages conversion
    gemini.go                      # OpenAI ↔ Gemini GenerateContent
    deepseek.go                    # DeepSeek-specific fields
    bedrock.go                     # AWS Bedrock SigV4 signing

  auth/
    apikey.go                      # Bearer token → API key lookup + validation
    quota.go                       # Per-key daily/weekly usage limit enforcement
    ratelimit.go                   # Sliding window rate limiter (in-memory)

  db/
    db.go                          # SQLite connection (WAL mode, busy_timeout)
    migrations.go                  # Embed + auto-run SQL migrations
    apikeys.go                     # API key CRUD + field queries
    combos.go                      # Combo CRUD + strategy config
    providers.go                   # Provider CRUD + credential storage
    usage.go                       # Insert + query usage logs
    settings.go                    # Key-value settings store

  mcp/
    server.go                      # MCP SSE server (JSON-RPC 2.0)
    tools.go                       # Tool registry + dispatch
    (individual tool files)

  compression/
    engine.go                      # Compression interface
    rtk.go                         # RTK via Rust FFI
    caveman.go                     # Caveman via Rust FFI
    headroom.go                    # Headroom via Rust FFI
    ffi.go                         # CGO bindings to Rust .a/.so

  admin/
    routes.go                      # Admin API route registration
    combos.go                      # GET/POST/PUT/DELETE /api/combos
    providers.go                   # GET/POST/PUT/DELETE /api/providers
    keys.go                        # GET/POST/PUT/DELETE /api/keys
    logs.go                        # GET /api/logs (with pagination)
    settings.go                    # GET/PUT /api/settings
```

## Key Interfaces

### Router
```go
type Strategy interface {
    Name() string
    Select(targets []Target, req *Request) (*Target, error)
}

type Router struct {
    strategies map[string]Strategy
    combos     map[string]*Combo
}
```

### Translator
```go
type Translator interface {
    TranslateRequest(src *ChatCompletionRequest, provider *Provider) (*http.Request, error)
    TranslateStreamChunk(chunk []byte) ([]byte, error)
    TranslateResponse(resp *http.Response) (*ChatCompletionResponse, error)
}
```

### Proxy
```go
type Proxy struct {
    router     *Router
    translator *TranslatorRegistry
    db         *DB
    client     *http.Client
}

func (p *Proxy) HandleChat(w http.ResponseWriter, r *http.Request)
func (p *Proxy) HandleModels(w http.ResponseWriter, r *http.Request)
func (p *Proxy) HandleEmbeddings(w http.ResponseWriter, r *http.Request)
```

## Startup Sequence
1. Parse CLI flags (port, db path, log level)
2. Open SQLite DB, run migrations
3. Load providers + combos from DB
4. Initialize router with combo strategies
5. Register HTTP routes
6. Start HTTP server on :9999
7. Log startup time (target: < 500ms)

## Performance Design
- Zero allocation in hot path (pre-allocate buffers)
- `sync.Pool` for request/response objects
- Streaming SSE with `http.Flusher` (no buffering)
- Connection pooling via `http.Transport` (MaxIdleConnsPerHost: 100)
- SQLite WAL mode for concurrent reads
