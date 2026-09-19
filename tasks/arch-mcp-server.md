# Architecture: MCP Server (Go Native)

## Overview
MCP (Model Context Protocol) server running natively in Go, speaking JSON-RPC 2.0 over SSE on port 9999. Replaces the current `open-sse/mcp-server/` TypeScript implementation.

## Protocol Implementation

### Transport: SSE (Server-Sent Events)
- Client connects to `GET /mcp/sse`
- Server sends events as `data: {json-rpc}\n\n`
- Client sends requests to `POST /mcp/message`

### Lifecycle
1. Client → `initialize` with capabilities
2. Server → `initialize` response with server info + tool list
3. Client → `notifications/initialized`
4. Client → `tools/list` (optional, tools already in init response)
5. Client → `tools/call` with tool name + arguments
6. Server → result or error

## 15 MCP Tools

### Health & Status (3)
| Tool | Input | Output |
|------|-------|--------|
| `niyatnaroute_get_health` | none | `{status, uptime, version, port, activeCombo, providers}` |
| `niyatnaroute_get_session_snapshot` | none | `{combos, providers, keys, totalRequests, avgLatency}` |
| `niyatnaroute_db_health_check` | none | `{dbSize, walSize, pageCount, integrityCheck}` |

### Combo Management (4)
| Tool | Input | Output |
|------|-------|--------|
| `niyatnaroute_list_combos` | `{active?: bool}` | `[{id, name, strategy, targets, active}]` |
| `niyatnaroute_get_combo_metrics` | `{comboId: string}` | `{requests, avgLatency, errorRate, lastUsed}` |
| `niyatnaroute_switch_combo` | `{comboId: string}` | `{success, activeCombo}` |
| `niyatnaroute_set_routing_strategy` | `{comboId, strategy}` | `{success, newStrategy}` |

### Quota & Cost (3)
| Tool | Input | Output |
|------|-------|--------|
| `niyatnaroute_check_quota` | `{provider?: string}` | `{remaining, limit, resetAt}` |
| `niyatnaroute_cost_report` | `{period?: "day"\|"week"\|"month"}` | `{totalCost, byProvider, byModel}` |
| `niyatnaroute_set_budget_guard` | `{dailyLimit, weeklyLimit}` | `{success, limits}` |

### Model & Routing (3)
| Tool | Input | Output |
|------|-------|--------|
| `niyatnaroute_list_models_catalog` | `{provider?: string}` | `[{id, provider, contextWindow, pricing}]` |
| `niyatnaroute_pick_fastest_model` | `{task?: string}` | `{model, provider, avgLatency, reason}` |
| `niyatnaroute_route_request` | `{model, prompt}` | `{response, provider, latency, tokens}` |
| `niyatnaroute_simulate_route` | `{model, combo}` | `{selectedTarget, reason, alternatives}` |
| `niyatnaroute_explain_route` | `{requestId}` | `{strategy, scores, selectedTarget, reason}` |

### Compression (2)
| Tool | Input | Output |
|------|-------|--------|
| `niyatnaroute_compression_status` | none | `{engine, totalSaved, avgRatio, requestsCompressed}` |
| `niyatnaroute_compression_configure` | `{engine, ratio?}` | `{success, config}` |

## Go Implementation Structure
```go
type MCPServer struct {
    tools    map[string]Tool
    sessions sync.Map  // sessionID → SSEWriter
}

type Tool struct {
    Name        string
    Description string
    InputSchema json.RawMessage
    Handler     func(args json.RawMessage) (json.RawMessage, error)
}

func (s *MCPServer) HandleSSE(w http.ResponseWriter, r *http.Request)
func (s *MCPServer) HandleMessage(w http.ResponseWriter, r *http.Request)
```
