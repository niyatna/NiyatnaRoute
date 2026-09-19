# Migration: Performance Targets & Benchmarking

## Overview
Concrete performance targets for Go+Rust NiyatnaRoute vs current TypeScript implementation.

## Resource Targets

| Metric | Current (TS/Next.js) | Target (Go+Rust) | Improvement |
|--------|---------------------|-------------------|-------------|
| Binary size | N/A (needs Node.js runtime) | < 15 MB | ∞ |
| Cold start | ~4-8 sec | < 500 ms | 10x |
| Idle RAM | ~200-400 MB | < 10 MB | 30x |
| Peak RAM (100 concurrent) | ~600-800 MB | < 50 MB | 12x |
| Idle CPU | 2-5% | < 0.1% | 30x |
| Docker image | ~1.2 GB (node:20) | < 15 MB (distroless) | 80x |
| `node_modules` | 3.4 GB | 0 bytes | ∞ |

## Latency Targets (Proxy Overhead)

| Operation | Current (TS) | Target (Go) | Improvement |
|-----------|-------------|-------------|-------------|
| Request routing (strategy selection) | ~5 ms | < 0.01 ms | 500x |
| Request translation (OpenAI→Anthropic) | ~2 ms | < 0.1 ms | 20x |
| Auth + rate limit check | ~3 ms | < 0.05 ms | 60x |
| SSE chunk forwarding | ~1 ms/chunk | < 0.01 ms/chunk | 100x |
| Total proxy overhead (non-streaming) | ~15 ms | < 1 ms | 15x |
| Total proxy overhead (streaming, per chunk) | ~5 ms | < 0.05 ms | 100x |

## Throughput Targets

| Metric | Current (TS) | Target (Go) |
|--------|-------------|-------------|
| Requests/sec (single core) | ~500 | > 5,000 |
| Requests/sec (4 cores) | ~1,500 | > 15,000 |
| Concurrent SSE streams | ~500 | > 10,000 |
| Max concurrent connections | ~1,000 | > 50,000 |

## Compression Targets (Rust)

| Engine | Current (TS) | Target (Rust) |
|--------|-------------|---------------|
| RTK (4K tokens) | ~50 ms | < 5 ms |
| Caveman (4K tokens) | ~20 ms | < 2 ms |
| Headroom (32K tokens) | ~100 ms | < 10 ms |
| Token counting (10K chars) | ~10 ms | < 1 ms |

## Benchmarking Tools

### Go Benchmarks
```bash
# Router strategy benchmarks
go test -bench=BenchmarkStrategy -benchmem ./internal/router/

# Translator benchmarks
go test -bench=BenchmarkTranslate -benchmem ./internal/translator/

# Full proxy benchmarks
go test -bench=BenchmarkProxy -benchmem ./internal/proxy/
```

### Rust Benchmarks
```bash
cd rust && cargo bench
```

### Load Testing
```bash
# Install hey
go install github.com/rakyll/hey@latest

# Non-streaming load test
hey -n 10000 -c 100 -m POST \
  -H "Authorization: Bearer test" \
  -H "Content-Type: application/json" \
  -d @test_payload.json \
  http://localhost:9999/v1/chat/completions

# Streaming load test (wrk + Lua)
wrk -t4 -c100 -d60s -s scripts/bench/stream_test.lua \
  http://localhost:9999/v1/chat/completions
```

### Profiling
```bash
# CPU profile
go tool pprof http://localhost:9999/debug/pprof/profile?seconds=30

# Memory profile
go tool pprof http://localhost:9999/debug/pprof/heap

# Goroutine profile
go tool pprof http://localhost:9999/debug/pprof/goroutine

# Trace
curl -o trace.out http://localhost:9999/debug/pprof/trace?seconds=5
go tool trace trace.out
```

## CI Performance Gates
```yaml
# Fail CI if:
- Cold start > 1 sec
- Idle RAM > 20 MB
- p99 latency > 5 ms (non-streaming)
- Throughput < 3000 req/s
```
