/**
 * localDb.js — Re-export layer for backward compatibility.
 *
 * All 27+ consumer files import from "@/lib/localDb".
 * This thin layer re-exports everything from the domain-specific DB modules,
 * so zero consumer changes are needed.
 */

export {
  // Provider Connections
  getProviderConnections,
  getProviderConnectionsCount,
  getProviderConnectionById,
  createProviderConnection,
  updateProviderConnection,
  resetConnectionBackoff,
  clearConnectionErrorIfUnchanged,
  touchConnectionLastUsed,
  deleteProviderConnection,
  deleteProviderConnections,
  deleteProviderConnectionsByProvider,
  reorderProviderConnections,
  cleanupProviderConnections,
  getProviderNodes,
  getProviderNodesCount,
  getProviderNodeById,
  resolveProviderNodeForConnection,
  createProviderNode,
  updateProviderNode,
  deleteProviderNode,
  // T05: Rate-limit DB persistence (survives token refresh)
  setConnectionRateLimitUntil,
  isConnectionRateLimited,
  getRateLimitedConnections,
  clearStaleCrashCooldowns,
  // T13: Stale quota display fix (zero out usage after window resets)
  getEffectiveQuotaUsage,
  formatResetCountdown,
} from "./db/providers";

export {
  // Model Aliases
  getModelAliases,
  setModelAlias,
  deleteModelAlias,
  deleteModelAliasesForProvider,

  // MITM Alias
  getMitmAlias,
  setMitmAliasAll,

  // Custom Models
  getCustomModels,
  getAllCustomModels,
  addCustomModel,
  replaceCustomModels,
  removeCustomModel,
  updateCustomModel,
  getModelCompatOverrides,
  mergeModelCompatOverride,
  removeModelCompatOverride,
  getModelNormalizeToolCallId,
  getModelPreserveOpenAIDeveloperRole,
  getModelUpstreamExtraHeaders,
  getModelIsHidden,
  setModelIsHidden,
  getHiddenModelsByProvider,
  // Synced Available Models
  getSyncedAvailableModels,
  getAllSyncedAvailableModels,
  getActiveProvidersWithSyncedModel,
  replaceSyncedAvailableModelsForConnection,
  deleteSyncedAvailableModelsForConnection,
  deleteSyncedAvailableModelsForProvider,
  removeSyncedAvailableModel,
} from "./db/models";

export type { ModelCompatPerProtocol, ModelCompatPatch, SyncedAvailableModel } from "./db/models";

export {
  // Combos
  getCombos,
  getCombosCount,
  getComboById,
  getComboByName,
  getComboByNameInsensitive,
  createCombo,
  updateCombo,
  reorderCombos,
  deleteCombo,
} from "./db/combos";
export * from "./db/compressionCacheStats";
export * from "./db/compressionCombos";
export * from "./db/compressionContextBudget";
export * from "./db/compressionRunTelemetry";
export * from "./db/modelContextOverrides";

export {
  getApiKeys,
  getApiKeysCount,
  getApiKeyById,
  createApiKey,
  deleteApiKey,
  validateApiKey,
  getApiKeyMetadata,
  updateApiKeyPermissions,
  regenerateApiKey,
  isModelAllowedForKey,
  pickApiKeyForInternalUse,
  clearApiKeyCaches,
  resetApiKeyState,
} from "./db/apiKeys";

// (Evals module removed)

export {
  // Settings
  getSettings,
  updateSettings,
  isCloudEnabled,

  // LKGP (Last Known Good Provider) (#919)
  getLKGP,
  setLKGP,

  // Pricing
  getPricing,
  getPricingWithSources,
  getPricingForModel,
  updatePricing,
  resetPricing,
  resetAllPricing,

  // Proxy Config
  getProxyConfig,
  getProxyForLevel,
  setProxyForLevel,
  deleteProxyForLevel,
  resolveProxyForConnection,
  setProxyConfig,
} from "./db/settings";

export type { PricingSource, PricingSourceMap } from "./db/settings";

export {
  getDatabaseSettings,
  getUserDatabaseSettings,
  updateDatabaseSettings,
} from "./db/databaseSettings";

export type { UserDatabaseSettings } from "./db/databaseSettings";

export {
  // Proxy Registry
  listProxies,
  getProxyById,
  createProxy,
  createProxyAndAssign,
  updateProxy,
  updateProxyAndAssign,
  upsertProxy,
  deleteProxyById,
  getProxyAssignments,
  getProxyWhereUsed,
  assignProxyToScope,
  addProxyToScopePool,
  removeProxyFromScopePool,
  getScopeProxyPool,
  setScopeRotationStrategy,
  getScopeRotationStrategy,
  resolveProxyForConnectionFromRegistry,
  resolveProxyForProvider,
  resolveProxyForScopeFromRegistry,
  migrateLegacyProxyConfigToRegistry,
  getProxyHealthStats,
  bulkAssignProxyToScope,
} from "./db/proxies";

export {
  // Pricing Sync
  getSyncedPricing,
  saveSyncedPricing,
  clearSyncedPricing,
  syncPricingFromSources,
  getSyncStatus,
  initPricingSync,
  startPeriodicSync,
  stopPeriodicSync,
} from "./pricingSync";

export {
  // Backup Management
  backupDbFile,
  cleanupDbBackups,
  getDbBackupMaxFiles,
  setDbBackupMaxFiles,
  getDbBackupRetentionDays,
  setDbBackupRetentionDays,
  listDbBackups,
  restoreDbBackup,
  // Export-All / Import helpers (#3500 slice 5)
  exportAllSummaryRows,
  getTableNamesFromAdapter,
  countImportedRows,
} from "./db/backup";

export type { ExportAllRows } from "./db/backup";

// (Skills, Files, Batches modules removed)

export type { ModelComboMapping } from "./db/modelComboMappings";
export * from "./db/reasoningRoutingRules";
export * from "./db/autoCandidateOverrides";
export {
  // Webhooks
  getWebhooks,
  getWebhook,
  getEnabledWebhooks,
  createWebhook,
  updateWebhook as updateWebhookRecord,
  deleteWebhook,
  recordWebhookDelivery,
  disableWebhooksWithHighFailures,
} from "./db/webhooks";

export type { Webhook, WebhookKind } from "./db/webhooks";

export { insertDelivery, getDeliveries } from "./db/webhookDeliveries";

// (Plugin module removed)



export { sumUsageTokensThisMonth } from "./db/usageSummary";

export {
  // Model Intelligence (task-fitness scores)
  getModelIntelligence,
  getModelIntelligenceBySource,
  upsertModelIntelligence,
  deleteModelIntelligence,
  deleteExpiredIntelligence,
  deleteModelIntelligenceBySource,
  listModelIntelligence,
  bulkUpsertModelIntelligence,
  getResolvedTaskFitness,
  setUserFitnessOverrideEntry,
  deleteUserFitnessOverrideEntry,
} from "./db/modelIntelligence";

export type { ModelIntelligenceEntry } from "./db/modelIntelligence";

export {
  getProviderMetrics,
  getSearchProviderStats,
  getRecentSearchLogs,
  getSearchAggregateStats,
  getSearchProviderCounts,
  getFallbackStats,
} from "./db/callLogStats";
export type {
  ProviderMetricRow,
  SearchProviderStatRow,
  SearchRecentRow,
  SearchAggregateStats,
  SearchProviderCountRow,
  FallbackStatsRow,
} from "./db/callLogStats";

export {
  buildUnifiedSource,
  buildPresetUnifiedSource,
  getUsageSummary,
  getDailyUsage,
  getDailyCostRows,
  getHeatmapRows,
  getModelUsageRows,
  getProviderCostRows,
  getProviderUsageRows,
  getAccountCostRows,
  getAccountUsageRows,
  getApiKeyUsageRows,
  getServiceTierUsageRows,
  getApiKeyMetadataRows,
  getWeeklyPatternRows,
  getPresetCostModelRows,
  getAllUsageHistory,
  getAllDomainCostHistory,
  getAllDomainBudgets,
} from "./db/usageAnalytics";
export type {
  AnalyticsParams,
  BuildUnifiedSourceOptions,
  UnifiedSourceResult,
  UsageSummaryRow,
  DailyUsageRow,
  DailyCostRow,
  HeatmapRow,
  ModelUsageRow,
  ProviderCostRow,
  ProviderUsageRow,
  AccountCostRow,
  AccountUsageRow,
  ApiKeyUsageRow,
  ServiceTierUsageRow,
  ApiKeyMetadataRow,
  WeeklyPatternRow,
  PresetCostModelRow,
} from "./db/usageAnalytics";

// ---------------------------------------------------------------------------
// usage_logs — auto-routing analytics (#3500 slice 4)
// ---------------------------------------------------------------------------
export {
  getAutoRoutingTotalCount,
  getAutoRoutingVariantBreakdown,
  getAutoRoutingTopProviders,
} from "./db/usageLogs";
export type {
  AutoRoutingTotalResult,
  AutoRoutingVariantRow,
  AutoRoutingTopProviderRow,
} from "./db/usageLogs";

// ---------------------------------------------------------------------------
// semantic_cache — cache entries CRUD (#3500 slice 4)
// ---------------------------------------------------------------------------
export {
  listSemanticCacheEntries,
  deleteSemanticCacheBySignature,
  deleteSemanticCacheByModel,
} from "./db/semanticCache";
export type {
  SemanticCacheEntry,
  SemanticCacheListOptions,
  SemanticCacheListResult,
  DeleteSemanticCacheBySignatureResult,
  DeleteSemanticCacheByModelResult,
} from "./db/semanticCache";

// ---------------------------------------------------------------------------
// proxy_logs — export query (#3500 slice 4)
// ---------------------------------------------------------------------------
export { exportProxyLogsSince } from "./db/proxyLogs";
// ---------------------------------------------------------------------------
// Per-connection 429 cooldown wrappers (#5957 / #5958 — Issue 1 follow-ups)
// Logic lives in db/providers/rateLimit.ts (Hard Rule #2 — localDb is re-export
// only); re-exported here for the historical localDb import contract.
// ---------------------------------------------------------------------------
export { markConnectionRateLimitedUntil, clearConnectionRateLimit } from "./db/providers";
// Provider param filters — denylist/allowlist config per provider/model (#6625)
export * from "./db/relayProbeStats"; // Relay probe latency/health stats (#6909)
export * from "./db/readCache";
export * from "./db/providerLimits";
export * from "./db/quotaConsumption";
export * from "./db/quotaPools";
export * from "./db/providerPlans";
export * from "./db/tokenLimits";
export * from "./db/quotaSnapshots";
export * from "./db/quotaResetEvents";
export * from "./db/accessTokens";
export * from "./db/apiKeyColumnFallbacks";
export * from "./db/apiKeyGroups";
export * from "./db/apiKeyUsageLimitFields";
export * from "./db/caseMapping";
export * from "./db/cleanup";
export * from "./db/cliToolState";
export * from "./db/comboForecast";
export * from "./db/commandCodeAuth";
export * from "./db/compressionAnalytics";
export * from "./db/compressionDetailNormalizers";
export * from "./db/contextHandoffs";
export * from "./db/creditBalance";
export * from "./db/detailedLogs";
export * from "./db/domainState";
export * from "./db/encryption";
export * from "./db/featureFlags";
export * from "./db/healthCheck";
export * from "./db/jsonMigration";
export * from "./db/middleware";
export * from "./db/modelCapabilityOverrides";
export * from "./db/omp";
export * from "./db/optimizationSettings";
export * from "./db/paramFilters";
export * from "./db/playgroundPresets";
export * from "./db/prompts";
export * from "./db/providerNodeSelect";
export * from "./db/providerStats";
export * from "./db/proxyLatency";
export * from "./db/proxySubscriptions";
export * from "./db/quotaGroups";
export * from "./db/quotaModelCaps";
export * from "./db/reasoningCache";
export * from "./db/recovery";
export * from "./db/registeredKeys";
export * from "./db/relayProxies";
export * from "./db/schemaColumns";
export * from "./db/secrets";
export * from "./db/serviceModels";
export * from "./db/sessionAccountAffinity";
export * from "./db/stateReset";
export * from "./db/stats";
export * from "./db/syncTokens";
export * from "./db/tierConfig";
export * from "./db/upstreamProxy";
export * from "./db/vacuumScheduler";
export * from "./db/versionManager";
export * from "./db/webSessionDedup";








