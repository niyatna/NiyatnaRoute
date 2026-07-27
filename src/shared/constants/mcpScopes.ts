/**
 * MCP Authorization Scopes — Defines permission scopes for each MCP tool.
 *
 * Each tool requires specific scopes to execute. API keys can be configured
 * with a subset of scopes to limit tool access (least-privilege).
 */

// ============ Scope Definitions ============

/** All available MCP scopes */
export const MCP_SCOPE_LIST = [
  "read:health",
  "read:combos",
  "write:combos",
  "read:quota",
  "read:usage",
  "read:models",
  "execute:completions",
  "execute:search",
  "write:budget",
  "write:resilience",
  "pricing:write",
  "read:cache",
  "write:cache",
  "read:compression",
  "write:compression",
  "read:proxies",
] as const;

export type McpScope = (typeof MCP_SCOPE_LIST)[number];

// ============ Tool → Scope Mapping ============

/** Maps each MCP tool to its required scopes */
export const MCP_TOOL_SCOPES: Record<string, readonly McpScope[]> = {
  // Phase 1: Essential Tools
  niyatnaroute_get_health: ["read:health"],
  niyatnaroute_list_combos: ["read:combos"],
  niyatnaroute_get_combo_metrics: ["read:combos"],
  niyatnaroute_switch_combo: ["write:combos"],
  niyatnaroute_check_quota: ["read:quota"],
  niyatnaroute_route_request: ["execute:completions"],
  niyatnaroute_web_search: ["execute:search"],
  niyatnaroute_web_fetch: ["execute:search"],
  niyatnaroute_cost_report: ["read:usage"],
  niyatnaroute_list_models_catalog: ["read:models"],

  // Phase 2: Advanced Tools
  niyatnaroute_simulate_route: ["read:health", "read:combos"],
  niyatnaroute_set_budget_guard: ["write:budget"],
  niyatnaroute_set_resilience_profile: ["write:resilience"],
  niyatnaroute_test_combo: ["execute:completions", "read:combos"],
  niyatnaroute_get_provider_metrics: ["read:health"],
  niyatnaroute_best_combo_for_task: ["read:combos", "read:health"],
  niyatnaroute_explain_route: ["read:health", "read:usage"],
  niyatnaroute_get_session_snapshot: ["read:usage"],
  niyatnaroute_db_health_check: ["read:health", "write:resilience"],
  niyatnaroute_sync_pricing: ["pricing:write"],
  niyatnaroute_cache_stats: ["read:cache"],
  niyatnaroute_cache_flush: ["write:cache"],
  niyatnaroute_compression_status: ["read:compression"],
  niyatnaroute_compression_configure: ["write:compression"],
  niyatnaroute_set_compression_engine: ["write:compression"],
  niyatnaroute_list_compression_combos: ["read:compression"],
  niyatnaroute_compression_combo_stats: ["read:compression"],
  niyatnaroute_ccr_store: ["write:compression"],
  niyatnaroute_ccr_retrieve: ["read:compression"],
  niyatnaroute_ccr_inspect: ["read:compression"],
  niyatnaroute_ccr_list: ["read:compression"],
  niyatnaroute_ccr_delete: ["write:compression"],
  niyatnaroute_ccr_stats: ["read:compression"],
  niyatnaroute_oneproxy_fetch: ["read:proxies"],
  niyatnaroute_oneproxy_rotate: ["read:proxies"],
  niyatnaroute_oneproxy_stats: ["read:proxies"],

  // Web-session pool observability (read) + lifecycle (write)
  niyatnaroute_pool_status: ["read:health"],
  niyatnaroute_pool_sessions: ["read:health"],
  niyatnaroute_pool_health: ["read:health"],
  niyatnaroute_pool_reset: ["write:resilience"],
  niyatnaroute_pool_warm: ["write:resilience"],
  // Stealth browser pool observability (#3368 PR7)
  niyatnaroute_browser_pool_status: ["read:health"],
} as const;
