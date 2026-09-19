# Migration: Testing Strategy

## Overview
Complete testing strategy for Go+Rust NiyatnaRoute. Covers unit tests, integration tests, HTTP fixture tests, load tests, and shadow-mode diffing.

## Test Pyramid

```
         ╱╲
        ╱  ╲         Load Tests (hey/wrk)
       ╱    ╲         ~5 scenarios
      ╱──────╲
     ╱        ╲       Integration Tests
    ╱          ╲       ~20 tests (real HTTP, real SQLite)
   ╱────────────╲
  ╱              ╲    HTTP Fixture Tests
 ╱                ╲    ~100 tests (recorded provider responses)
╱──────────────────╲
╱                    ╲  Unit Tests
╱                      ╲  ~300 tests (pure logic, no I/O)
```

## 1. Unit Tests (`go test`)
**Target**: 300+ tests, < 10 sec total runtime

| Package | What to Test | Count |
|---------|-------------|-------|
| `internal/router/` | Each strategy selection logic | ~50 |
| `internal/translator/` | Request/response translation | ~60 |
| `internal/auth/` | API key validation, rate limiting | ~30 |
| `internal/db/` | CRUD operations (in-memory SQLite) | ~40 |
| `internal/mcp/` | Tool dispatch, JSON-RPC parsing | ~30 |
| `internal/proxy/` | Stream parsing, retry logic | ~40 |
| `internal/compression/` | Engine wrappers | ~20 |
| `internal/admin/` | Admin API handlers | ~30 |

**Commands**:
```bash
go test ./...                          # All tests
go test -v ./internal/router/          # Router tests only
go test -race ./...                    # Race detector
go test -count=1 ./...                 # No cache
go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out
```

## 2. HTTP Fixture Tests
**Purpose**: Verify translator parity with recorded real provider responses.

**Structure**:
```
testdata/
├── fixtures/
│   ├── openai/
│   │   ├── chat_simple.request.json
│   │   ├── chat_simple.response.json
│   │   ├── chat_stream.response.txt       # Raw SSE
│   │   └── chat_tools.response.json
│   ├── anthropic/
│   │   ├── messages_simple.request.json
│   │   ├── messages_simple.response.json
│   │   └── messages_stream.response.txt
│   ├── gemini/
│   │   └── ...
│   └── deepseek/
│       └── ...
```

**Test Pattern**:
```go
func TestTranslator_Anthropic_SimpleChat(t *testing.T) {
    fixture := loadFixture(t, "anthropic/messages_simple")
    translator := NewAnthropicTranslator()
    
    // Test request translation
    httpReq, err := translator.TranslateRequest(fixture.Input, cfg)
    assert.NoError(t, err)
    assertJSONEqual(t, fixture.ExpectedRequest, httpReq.Body)
    
    // Test response translation
    resp, err := translator.TranslateResponse(fixture.ProviderResponse)
    assert.NoError(t, err)
    assertJSONEqual(t, fixture.ExpectedOutput, resp)
}
```

## 3. Integration Tests
**Purpose**: Full HTTP request through the entire proxy stack.

```go
func TestProxy_ChatCompletions_E2E(t *testing.T) {
    // Start mock LLM server
    mock := httptest.NewServer(mockOpenAIHandler())
    defer mock.Close()
    
    // Start NiyatnaRoute with mock provider
    srv := startTestServer(t, WithProvider("test", mock.URL))
    defer srv.Close()
    
    // Make chat completion request
    resp := httpPost(t, srv.URL+"/v1/chat/completions", chatRequest)
    assert.Equal(t, 200, resp.StatusCode)
    
    // Verify response format
    var result ChatResponse
    json.NewDecoder(resp.Body).Decode(&result)
    assert.NotEmpty(t, result.Choices)
}
```

## 4. Load Tests
**Tools**: `hey`, `wrk`, or Go's built-in benchmarks

```bash
# 1K concurrent, 10K total requests
hey -n 10000 -c 1000 -m POST \
  -H "Authorization: Bearer test-key" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"hi"}]}' \
  http://localhost:9999/v1/chat/completions

# SSE streaming load test
wrk -t4 -c100 -d30s -s stream_test.lua http://localhost:9999/v1/chat/completions
```

**Targets**:
| Metric | Target |
|--------|--------|
| p50 latency (non-streaming) | < 5 ms overhead |
| p99 latency | < 20 ms overhead |
| Throughput | > 5K req/s (single core) |
| Concurrent SSE streams | > 10K |
| Memory under load | < 50 MB |

## 5. Shadow-Mode Diffing
**Purpose**: Run Go proxy alongside TS proxy, compare responses.

```
Client → NiyatnaRoute (Go) → Provider
  ↓ (copy)
Shadow → NiyatnaRoute (TS) → Provider
  ↓
Diff Logger (compare responses)
```

**Implementation**: 
- Go proxy forwards a copy of each request to TS proxy
- Compare response JSON (ignoring timestamps, request IDs)
- Log mismatches to `shadow_diff.jsonl`
- Run for 24h before cutover

## 6. Rust Tests
```bash
cd rust && cargo test          # Unit tests
cd rust && cargo bench         # Benchmarks
cd rust && cargo fuzz run compress_rtk  # Fuzz testing
```

## CI Pipeline (`.github/workflows/test.yml`)
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.23' }
      - uses: dtolnay/rust-toolchain@stable
      - run: cd rust && cargo build --release
      - run: go test -race -coverprofile=coverage.out ./...
      - run: go test -bench=. -benchmem ./internal/router/
```
