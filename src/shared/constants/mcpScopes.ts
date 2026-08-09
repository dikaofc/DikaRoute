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
  dikaroute_get_health: ["read:health"],
  dikaroute_list_combos: ["read:combos"],
  dikaroute_get_combo_metrics: ["read:combos"],
  dikaroute_switch_combo: ["write:combos"],
  dikaroute_check_quota: ["read:quota"],
  dikaroute_route_request: ["execute:completions"],
  dikaroute_web_search: ["execute:search"],
  dikaroute_web_fetch: ["execute:search"],
  dikaroute_cost_report: ["read:usage"],
  dikaroute_list_models_catalog: ["read:models"],

  // Phase 2: Advanced Tools
  dikaroute_simulate_route: ["read:health", "read:combos"],
  dikaroute_set_budget_guard: ["write:budget"],
  dikaroute_set_resilience_profile: ["write:resilience"],
  dikaroute_test_combo: ["execute:completions", "read:combos"],
  dikaroute_get_provider_metrics: ["read:health"],
  dikaroute_best_combo_for_task: ["read:combos", "read:health"],
  dikaroute_explain_route: ["read:health", "read:usage"],
  dikaroute_get_session_snapshot: ["read:usage"],
  dikaroute_db_health_check: ["read:health", "write:resilience"],
  dikaroute_sync_pricing: ["pricing:write"],
  dikaroute_cache_stats: ["read:cache"],
  dikaroute_cache_flush: ["write:cache"],
  dikaroute_compression_status: ["read:compression"],
  dikaroute_compression_configure: ["write:compression"],
  dikaroute_set_compression_engine: ["write:compression"],
  dikaroute_list_compression_combos: ["read:compression"],
  dikaroute_compression_combo_stats: ["read:compression"],
  dikaroute_ccr_store: ["write:compression"],
  dikaroute_ccr_retrieve: ["read:compression"],
  dikaroute_ccr_inspect: ["read:compression"],
  dikaroute_ccr_list: ["read:compression"],
  dikaroute_ccr_delete: ["write:compression"],
  dikaroute_ccr_stats: ["read:compression"],
  dikaroute_oneproxy_fetch: ["read:proxies"],
  dikaroute_oneproxy_rotate: ["read:proxies"],
  dikaroute_oneproxy_stats: ["read:proxies"],

  // Web-session pool observability (read) + lifecycle (write)
  dikaroute_pool_status: ["read:health"],
  dikaroute_pool_sessions: ["read:health"],
  dikaroute_pool_health: ["read:health"],
  dikaroute_pool_reset: ["write:resilience"],
  dikaroute_pool_warm: ["write:resilience"],
  // Stealth browser pool observability (#3368 PR7)
  dikaroute_browser_pool_status: ["read:health"],
} as const;
