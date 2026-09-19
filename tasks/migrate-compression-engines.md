# Migration: Compression Engines (TypeScript → Rust)

## Overview
Port 3 compression engines from `open-sse/services/compression/engines/` (TypeScript) to `rust/src/compression.rs` (Rust), exposed via C FFI to Go.

## Engine 1: RTK (Rust Token Killer)
**Source**: `open-sse/services/compression/engines/rtk/`
**Algorithm**:
1. Tokenize input text
2. Score each token by information density (TF-IDF-like)
3. Remove lowest-scoring tokens until target ratio reached
4. Reconstruct text preserving grammatical structure
5. Return compressed text

**Rust FFI**:
```rust
#[no_mangle]
pub extern "C" fn nr_compress_rtk(text: *const c_char, ratio: f32) -> *mut c_char
```

**Key Edge Cases**:
- Preserve code blocks verbatim (don't compress code)
- Preserve URLs and paths
- Preserve numbers and dates
- Handle multi-language text (Unicode-aware tokenization)

## Engine 2: Caveman
**Source**: `open-sse/services/compression/engines/cavemanAdapter.ts`
**Algorithm**:
1. Remove articles (a, an, the)
2. Remove filler words (just, really, very, actually)
3. Abbreviate common words (because→bc, information→info)
4. Remove redundant whitespace
5. Shorten sentences to key phrases

**Rust FFI**:
```rust
#[no_mangle]
pub extern "C" fn nr_compress_caveman(text: *const c_char) -> *mut c_char
```

**Abbreviation Dictionary** (partial):
```
because → bc
information → info
approximately → ~
for example → e.g.
in order to → to
with respect to → re
as a result → so
in addition → also
however → but
therefore → so
```

## Engine 3: Headroom
**Source**: `open-sse/services/compression/engines/headroom/`
**Algorithm**:
1. Count current tokens in conversation
2. Calculate remaining headroom (context_window - current_tokens - reserve)
3. If headroom is sufficient, no compression
4. If headroom is tight, apply progressive compression:
   - Level 1: Remove system prompt redundancy
   - Level 2: Summarize older messages
   - Level 3: Apply RTK compression to all messages
5. Return compressed conversation fitting within headroom

**Rust FFI**:
```rust
#[no_mangle]
pub extern "C" fn nr_compress_headroom(
    text: *const c_char,
    max_tokens: i32,
    model: *const c_char,
) -> *mut c_char
```

## Go Wrapper (`internal/compression/`)
```go
package compression

type Engine interface {
    Name() string
    Compress(text string, opts Options) (string, Stats, error)
}

type Options struct {
    Ratio     float32  // Target compression ratio (RTK)
    MaxTokens int      // Context window limit (Headroom)
    Model     string   // Model name for token counting
}

type Stats struct {
    InputTokens  int
    OutputTokens int
    SavingsRatio float64
    LatencyMs    int64
}

// RTK engine via Rust FFI
type RTKEngine struct{}
func (e *RTKEngine) Compress(text string, opts Options) (string, Stats, error)

// Caveman engine via Rust FFI
type CavemanEngine struct{}
func (e *CavemanEngine) Compress(text string, opts Options) (string, Stats, error)

// Headroom engine via Rust FFI
type HeadroomEngine struct{}
func (e *HeadroomEngine) Compress(text string, opts Options) (string, Stats, error)
```

## Performance Targets
| Engine | Input Size | Target Latency | Savings |
|--------|-----------|---------------|---------|
| RTK | 4K tokens | < 5 ms | 60-90% |
| Caveman | 4K tokens | < 2 ms | 30-50% |
| Headroom | 32K tokens | < 10 ms | Variable |

## Test Strategy
- Golden file tests: known input → expected output
- Roundtrip semantic test: compressed text preserves meaning (manual review)
- Benchmark: `cargo bench` in rust/
- Fuzz testing: random UTF-8 input must not crash
