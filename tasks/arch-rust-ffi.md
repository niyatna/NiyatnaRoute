# Architecture: Rust FFI Layer

## Overview
CPU-intensive operations (compression, token counting, TLS fingerprinting) run in Rust, exposed to Go via C FFI through CGO.

## Cargo.toml
```toml
[package]
name = "niyatnaroute-core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["staticlib"]  # Produces .a for static linking

[dependencies]
tiktoken-rs = "0.6"         # Token counting (cl100k_base, o200k_base)
rustls = "0.23"             # TLS fingerprinting
libc = "0.2"                # C FFI types

[profile.release]
opt-level = "z"             # Optimize for size
lto = true                  # Link-time optimization
strip = true                # Strip debug symbols
```

## FFI Function Signatures

### Token Counting
```rust
/// Count tokens for a given text and model encoding
#[no_mangle]
pub extern "C" fn nr_count_tokens(
    text: *const c_char,
    model: *const c_char,  // "gpt-4", "claude-3", etc. → maps to encoding
) -> i32

/// Encode text to token IDs
#[no_mangle]
pub extern "C" fn nr_encode(
    text: *const c_char,
    model: *const c_char,
    out_len: *mut i32,
) -> *mut u32  // Caller must free with nr_free_tokens()

/// Free token array
#[no_mangle]
pub extern "C" fn nr_free_tokens(ptr: *mut u32, len: i32)
```

### Compression Engines
```rust
/// RTK compression (token-aware reduction)
#[no_mangle]
pub extern "C" fn nr_compress_rtk(
    text: *const c_char,
    ratio: f32,            // Target compression ratio (0.0 - 1.0)
) -> *mut c_char           // Caller must free with nr_free_string()

/// Caveman compression (aggressive abbreviation)
#[no_mangle]
pub extern "C" fn nr_compress_caveman(
    text: *const c_char,
) -> *mut c_char

/// Headroom compression (context-window-aware)
#[no_mangle]
pub extern "C" fn nr_compress_headroom(
    text: *const c_char,
    max_tokens: i32,       // Context window limit
    model: *const c_char,
) -> *mut c_char

/// Free compressed string
#[no_mangle]
pub extern "C" fn nr_free_string(ptr: *mut c_char)
```

### TLS Fingerprinting
```rust
/// Create a TLS client with browser fingerprint
#[no_mangle]
pub extern "C" fn nr_create_tls_config(
    profile: *const c_char,  // "chrome", "firefox", "safari"
) -> *mut c_void             // Opaque TLS config pointer

/// Free TLS config
#[no_mangle]
pub extern "C" fn nr_free_tls_config(ptr: *mut c_void)
```

## Go CGO Bindings (`internal/compression/ffi.go`)
```go
package compression

/*
#cgo LDFLAGS: -L${SRCDIR}/../../rust/target/release -lniyatnaroute_core -lm -ldl -lpthread
#include <stdlib.h>

extern int nr_count_tokens(const char* text, const char* model);
extern char* nr_compress_rtk(const char* text, float ratio);
extern char* nr_compress_caveman(const char* text);
extern char* nr_compress_headroom(const char* text, int max_tokens, const char* model);
extern void nr_free_string(char* ptr);
*/
import "C"
import "unsafe"

func CountTokens(text, model string) int {
    cText := C.CString(text)
    cModel := C.CString(model)
    defer C.free(unsafe.Pointer(cText))
    defer C.free(unsafe.Pointer(cModel))
    return int(C.nr_count_tokens(cText, cModel))
}

func CompressRTK(text string, ratio float32) string {
    cText := C.CString(text)
    defer C.free(unsafe.Pointer(cText))
    result := C.nr_compress_rtk(cText, C.float(ratio))
    defer C.nr_free_string(result)
    return C.GoString(result)
}
```

## Cross-Compilation Matrix
| Target | Rust Triple | Go GOOS/GOARCH | Build Command |
|--------|------------|----------------|---------------|
| Linux AMD64 | `x86_64-unknown-linux-gnu` | `linux/amd64` | `CC="zig cc -target x86_64-linux-gnu"` |
| Linux ARM64 | `aarch64-unknown-linux-gnu` | `linux/arm64` | `CC="zig cc -target aarch64-linux-gnu"` |
| macOS ARM64 | `aarch64-apple-darwin` | `darwin/arm64` | Native clang |
| Windows AMD64 | `x86_64-pc-windows-gnu` | `windows/amd64` | `CC="zig cc -target x86_64-windows-gnu"` |

## Build Steps
```bash
# 1. Build Rust static library
cd rust && cargo build --release --target x86_64-unknown-linux-gnu

# 2. Build Go binary with CGO linking to Rust
CGO_ENABLED=1 go build -ldflags "-s -w" -o niyatnaroute ./cmd/niyatnaroute/
```

## Performance Targets
| Operation | Target | Current (TS) |
|-----------|--------|-------------|
| Count 10K tokens | < 1 ms | ~10 ms |
| RTK compress 4K tokens | < 5 ms | ~50 ms |
| Caveman compress 4K tokens | < 2 ms | ~20 ms |
| Headroom compress 4K tokens | < 5 ms | ~50 ms |
