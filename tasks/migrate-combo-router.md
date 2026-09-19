# Migration: 17 Combo Routing Strategies (TypeScript → Go)

## Overview
Port all 17 routing strategies from `open-sse/services/combo/` (20 TS files) to `internal/router/` in Go. Each strategy implements a `Select(targets, request) → target` method.

## Source Files → Go Target

| # | Strategy | TS Source | Go Target | Algorithm |
|---|----------|-----------|-----------|-----------|
| 1 | **Priority** | `applyStrategyOrdering.ts` | `priority.go` | Sort targets by priority field, pick first healthy |
| 2 | **Weighted** | `applyStrategyOrdering.ts` | `weighted.go` | Weighted random selection (roulette wheel) |
| 3 | **Round-Robin** | `applyStrategyOrdering.ts` | `roundrobin.go` | Atomic counter mod len(targets) |
| 4 | **P2C** | `applyStrategyOrdering.ts` | `p2c.go` | Pick 2 random targets, select one with lower latency |
| 5 | **Headroom** | `quotaShareStrategy.ts` | `headroom.go` | Select target with most remaining quota headroom |
| 6 | **Fusion** | `fusionPanel.ts` | `fusion.go` | Send to multiple providers, merge/judge responses |
| 7 | **Cost-Optimized** | `quotaScoring.ts` | `cost.go` | Rank by $/1K tokens, pick cheapest available |
| 8 | **Wildcard** | `targetSorters.ts` | `wildcard.go` | Pattern-match model names to provider capabilities |
| 9 | **Latency** | `targetSorters.ts` | `latency.go` | EMA latency tracker, pick fastest p50 |
| 10 | **Quota-Share** | `quotaShareConcurrency.ts` | `quota.go` | Distribute load proportional to remaining quota |
| 11 | **Failover** | `comboCompatFallback.ts` | `failover.go` | Try targets in order, skip to next on error |
| 12 | **Session-Sticky** | `sessionStickiness.ts` | `sticky.go` | Hash(sessionID) → consistent target selection |
| 13 | **Shadow** | `shadowRouting.ts` | `shadow.go` | Primary target + async shadow copy to secondary |
| 14 | **Task-Aware** | `resolveAutoStrategy.ts` | `task.go` | Route based on task type (code, chat, vision) |
| 15 | **Auto** | `autoStrategy.ts` | `auto.go` | Heuristic: analyze request → pick best strategy |
| 16 | **Quota-Exhaustion-Cutoff** | `quotaExhaustionCutoff.ts` | `exhaustion.go` | Drop targets below quota threshold |
| 17 | **Prompt-Cache-Affinity** | `promptCacheAffinity.ts` | `affinity.go` | Route to same provider for cache hits |

## Go Interface
```go
type Strategy interface {
    Name() string
    Select(ctx context.Context, targets []Target, req *Request) (*Target, error)
}

type Target struct {
    ProviderID   string
    Model        string
    Weight       float64
    Priority     int
    AvgLatencyMs int64
    QuotaLeft    int64
    ErrorRate    float64
    Healthy      bool
}

type Request struct {
    Model       string
    SessionID   string
    TaskType    string  // "code", "chat", "vision", "embedding"
    TokenCount  int
    Stream      bool
}
```

## Supporting Files to Port
| TS File | Purpose | Go Equivalent |
|---------|---------|---------------|
| `comboSetup.ts` | Combo initialization | Part of `router.go` |
| `comboStructure.ts` | Combo data structures | Part of `router.go` (Target struct) |
| `concurrencyCaps.ts` | Max concurrent requests per target | `concurrency.go` |
| `quotaShareInflight.ts` | In-flight request tracking | `inflight.go` |
| `quotaStrategies.ts` | Quota calculation helpers | `quota_helpers.go` |
| `runtimeUnits.ts` | Runtime cost units | `units.go` |
| `autoConfig.ts` | Auto-strategy configuration | Part of `auto.go` |

## Benchmark Targets
| Metric | Target |
|--------|--------|
| Strategy selection latency | < 1 μs |
| 10K concurrent goroutines selecting | No contention (lock-free where possible) |
| Memory per combo | < 1 KB |

## Test Plan
- Unit test each strategy with fixed target sets
- Property-based testing: weighted selection distribution matches weights over 100K iterations
- Benchmark: `go test -bench=. -benchmem ./internal/router/`
