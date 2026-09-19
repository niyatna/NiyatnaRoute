# Migration: Rollback Plan

## Overview
If the Go+Rust migration fails or is blocked, this documents how to revert to the TypeScript codebase and keep NiyatnaRoute running.

## Rollback Triggers
Rollback if ANY of these conditions are true after 1 week of shadow testing:
1. **Response parity < 99%** — More than 1% of responses differ between Go and TS proxies
2. **Latency regression** — Go proxy adds > 5ms overhead vs TS proxy
3. **Data loss** — Any credential, setting, or usage record lost during migration
4. **Critical executor failure** — A provider executor that works in TS doesn't work in Go
5. **Production crash** — Go binary panics or exits unexpectedly under load

## Rollback Strategy: Keep TS Codebase Alive

### During Migration (Phases 1-8)
The TS codebase is NOT deleted during migration. Both codebases coexist:
```
spirula/                    # TS codebase (production, running on port 9999)
spirula/go/                 # Go codebase (development, running on port 9998 for testing)
spirula/rust/               # Rust FFI library
```

### Cutover Process
1. **Shadow mode** (1 week): Go proxy on :9998, TS proxy on :9999. All traffic goes to TS. Go receives copy.
2. **Canary mode** (1 week): 10% traffic to Go (:9999), 90% to TS (:9998). Monitor diff.
3. **Full cutover**: 100% traffic to Go. TS kept alive on :9998 for 2 weeks.
4. **Archive**: After 2 weeks stable, archive TS codebase to `archive/ts-codebase/`.

### Rollback Execution (< 5 minutes)
```bash
# 1. Stop Go proxy
systemctl stop niyatnaroute-go

# 2. Start TS proxy
cd /opt/niyatnaroute/spirula
npm run dev  # or pm2 restart niyatnaroute-ts

# 3. Verify
curl -s http://localhost:9999/health | jq .status
# Expected: "ok"
```

### Docker Rollback
```bash
# 1. Switch to TS image
docker-compose down
docker-compose -f docker-compose.ts.yml up -d

# 2. Verify
curl -s http://localhost:9999/health
```

### Fly.io Rollback
```bash
# 1. Rollback to previous TS deployment
fly deploy --image niyatnaroute:ts-latest

# 2. Verify
fly status
```

## Data Compatibility

### Forward Migration (TS → Go)
```bash
niyatnaroute migrate-from-ts --source ./omniroute.db --output ./niyatnaroute.db
```

### Reverse Migration (Go → TS)
If rollback needed, the original TS SQLite DB was NEVER modified. The Go proxy uses a separate DB file. Simply point TS back to its original DB.

```
omniroute.db         # Original TS database (untouched)
niyatnaroute.db      # New Go database (separate file)
```

**Critical rule**: The Go migration NEVER modifies the original TS database. It creates a new file. This ensures zero-risk rollback.

## Partial Rollback: Hybrid Mode
If only some features fail in Go, run both proxies:

```
                    ┌─ Go proxy (:9999) ← API traffic (OpenAI/Anthropic API)
Client → nginx ─────┤
                    └─ TS proxy (:9998) ← Web executor traffic (chatgpt-web, claude-web)
```

**nginx config**:
```nginx
upstream go_proxy {
    server 127.0.0.1:9999;
}
upstream ts_proxy {
    server 127.0.0.1:9998;
}

server {
    listen 80;
    
    # API traffic → Go
    location /v1/ {
        proxy_pass http://go_proxy;
    }
    
    # Web executor traffic → TS (fallback if Go web executors fail)
    location /v1/chat/completions {
        # Check X-Provider header for web providers
        if ($http_x_provider ~* "chatgpt-web|claude-web|grok-web") {
            proxy_pass http://ts_proxy;
        }
        proxy_pass http://go_proxy;
    }
    
    # Admin UI → Go
    location / {
        proxy_pass http://go_proxy;
    }
}
```

## Rollback Decision Matrix

| Scenario | Action | Risk Level |
|----------|--------|------------|
| Go proxy works, translator has 1 edge case bug | Fix bug, don't rollback | Low |
| Go proxy works, 1 web executor fails | Hybrid mode (Go API + TS web) | Medium |
| Go proxy crashes under load | Full rollback to TS | High |
| Data migration corrupted | Full rollback, restore from backup | Critical |
| Rust FFI segfaults | Disable compression, use Go-only mode | High |
