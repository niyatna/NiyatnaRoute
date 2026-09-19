# Migration: Translator Layer (TypeScript → Go)

## Overview
Port the request/response translator layer from `open-sse/translator/` to Go. The translator converts between OpenAI-compatible format and provider-native formats (Anthropic, Gemini, DeepSeek, Bedrock).

## Current TS Source Files
```
open-sse/translator/
├── request/       # Request transformation
├── response/      # Response transformation
├── image/         # Image generation translation
└── helpers/       # Shared utilities
```

## Translators to Port

### 1. OpenAI (passthrough)
- Identity translation — OpenAI format in, OpenAI format out
- Handle streaming (`text/event-stream`) passthrough
- Go: `internal/translator/openai.go`

### 2. Anthropic (OpenAI ↔ Messages API)
- Convert `messages` array format
- Map `system` message to `system` field
- Convert `tool_use` ↔ `function_call`
- Handle streaming: `message_start`, `content_block_delta`, `message_delta`
- Map `max_tokens` ↔ `max_tokens` (required in Anthropic)
- Handle `thinking` / extended thinking blocks
- Go: `internal/translator/anthropic.go`

### 3. Gemini (OpenAI ↔ GenerateContent)
- Convert `messages` → `contents` array
- Map roles: `assistant` → `model`
- Convert `function_call` → `functionCall`
- Handle `safety_settings` injection
- Map `stream: true` → `streamGenerateContent?alt=sse`
- Convert streaming format differences
- Go: `internal/translator/gemini.go`

### 4. DeepSeek (OpenAI-like with extensions)
- Mostly passthrough with DeepSeek-specific fields
- Handle `prefix` parameter
- Handle reasoning_content in responses
- Go: `internal/translator/deepseek.go`

### 5. Bedrock (SigV4 + Claude format)
- AWS SigV4 request signing
- Convert to Bedrock's `InvokeModel` / `InvokeModelWithResponseStream`
- Handle `anthropic.claude-*` model ID mapping
- Go: `internal/translator/bedrock.go`

## Go Interface
```go
type Translator interface {
    Name() string
    TranslateRequest(req *ChatRequest, cfg *ProviderConfig) (*http.Request, error)
    TranslateStreamChunk(chunk []byte) ([]byte, bool, error)  // data, done, error
    TranslateResponse(body []byte) (*ChatResponse, error)
}

type TranslatorRegistry struct {
    translators map[string]Translator  // provider type → translator
}

func (r *TranslatorRegistry) Get(providerType string) Translator
```

## Test Strategy
- Record HTTP fixtures from each provider (request + response pairs)
- Golden file tests: input fixture → translate → compare with expected output
- Fuzz testing for malformed responses
- Benchmark: translation must add < 0.1ms overhead

## Edge Cases to Port
1. Anthropic streaming with `ping` events (must skip)
2. Gemini `finishReason: "SAFETY"` error mapping
3. Bedrock response wrapping/unwrapping
4. Tool call streaming across multiple chunks
5. Image content blocks (base64 + URL)
6. Multi-turn conversation with mixed content types
