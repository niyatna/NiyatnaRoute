# Architecture: Database Migration (SQLite)

## Overview
Migrate from the current 60+ table SQLite schema to a lean Go schema with ~15 tables. Includes data migration CLI command.

## Current Schema (TypeScript — 60+ tables)
The current DB has accumulated tables for deleted features. The Go schema keeps only essential tables.

## New Go Schema (15 tables)

### `migrations/001_initial.sql`
```sql
-- Providers
CREATE TABLE providers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'openai', 'anthropic', 'gemini', 'deepseek', 'bedrock', 'custom'
    endpoint TEXT NOT NULL,
    api_key TEXT,  -- encrypted
    extra_headers TEXT,  -- JSON
    models TEXT,  -- JSON array of supported models
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Combos
CREATE TABLE combos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL UNIQUE,
    strategy TEXT NOT NULL DEFAULT 'priority',
    targets TEXT NOT NULL,  -- JSON array of {providerId, model, weight, priority}
    active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    config TEXT,  -- JSON strategy-specific config
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- API Keys
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,  -- bcrypt hash
    key_prefix TEXT NOT NULL,  -- First 8 chars for display
    allowed_models TEXT,  -- JSON array, NULL = all
    blocked_models TEXT,  -- JSON array
    allowed_combos TEXT,  -- JSON array, NULL = all
    rate_limit INTEGER DEFAULT 60,  -- requests per minute
    daily_limit_usd REAL,
    weekly_limit_usd REAL,
    no_log INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Settings
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Usage logs
CREATE TABLE usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id TEXT,
    combo_id TEXT,
    provider_id TEXT,
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    status INTEGER DEFAULT 200,  -- HTTP status code
    cost_usd REAL DEFAULT 0,
    compressed INTEGER DEFAULT 0,  -- Was compression applied?
    compression_savings REAL DEFAULT 0,  -- Token savings ratio
    error TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
CREATE INDEX idx_usage_logs_api_key ON usage_logs(api_key_id);
CREATE INDEX idx_usage_logs_model ON usage_logs(model);

-- Compression stats
CREATE TABLE compression_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engine TEXT NOT NULL,  -- 'rtk', 'caveman', 'headroom'
    input_tokens INTEGER,
    output_tokens INTEGER,
    savings_ratio REAL,
    latency_ms INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Webhooks
CREATE TABLE webhooks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    url TEXT NOT NULL,
    events TEXT NOT NULL,  -- JSON array of event types
    secret TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);
```

## Data Migration CLI
```bash
niyatnaroute migrate-from-ts --db /path/to/old/omniroute.db --output /path/to/new/niyatnaroute.db
```

### Migration Logic
1. Read old `providers` table → map to new schema
2. Read old `combos` table → map strategy + targets
3. Read old `api_keys` table → preserve hashes + limits (skip chaosModeEnabled)
4. Read old `settings` table → key-value migration
5. Read old `usage_logs` / `detailed_logs` → flatten to new schema
6. Skip all dead tables (gamification, a2a, batches, files, evals, discovery)

## Verification
```bash
# Check table count
sqlite3 niyatnaroute.db ".tables" | wc -w  # Should be ~7

# Check data integrity
sqlite3 niyatnaroute.db "SELECT COUNT(*) FROM providers;"
sqlite3 niyatnaroute.db "SELECT COUNT(*) FROM combos;"
sqlite3 niyatnaroute.db "SELECT COUNT(*) FROM api_keys;"
sqlite3 niyatnaroute.db "PRAGMA integrity_check;"  # Should output "ok"
```
