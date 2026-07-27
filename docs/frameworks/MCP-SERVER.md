# NiyatnaRoute — MCP Server Documentation

## 🔌 NiyatnaRoute MCP Server Overview

The **NiyatnaRoute MCP Server** provides 15 core tools for AI Gateway health, combo routing, model cataloging, quotas, and prompt compression management listening on port **`9999`**.

---

## 🛠️ 15 Core Tools

1. `niyatnaroute_get_health` — Health & server status check
2. `niyatnaroute_list_combos` — List configured combo routing strategies
3. `niyatnaroute_get_combo_metrics` — Get real-time routing metrics
4. `niyatnaroute_switch_combo` — Switch active combo strategy
5. `niyatnaroute_check_quota` — Check remaining quota & usage
6. `niyatnaroute_route_request` — Test request routing decision
7. `niyatnaroute_cost_report` — Cost analysis & token report
8. `niyatnaroute_list_models_catalog` — List available LLM models
9. `niyatnaroute_web_search` — Web search tool
10. `niyatnaroute_simulate_route` — Simulate routing logic
11. `niyatnaroute_set_budget_guard` — Configure budget guardrails
12. `niyatnaroute_set_routing_strategy` — Change strategy rules
13. `niyatnaroute_set_resilience_profile` — Change resilience settings
14. `niyatnaroute_test_combo` — Test combo strategy execution
15. `niyatnaroute_get_provider_metrics` — Get provider performance metrics

---

## 🚀 Running the MCP Server

```bash
# Stdio transport
npx niyatnaroute --mcp

# Endpoint (port 9999)
http://localhost:9999/api/mcp/sse
```
