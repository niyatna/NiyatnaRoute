# Architecture: CLI (`niyatnaroute` binary)

## Overview
Single binary CLI with subcommands. Uses Go stdlib `flag` package (no cobra/urfave dependency). Every subcommand is a thin wrapper around the internal packages.

## Subcommands

### `niyatnaroute serve`
Start the HTTP/SSE proxy server.
```
Usage: niyatnaroute serve [flags]

Flags:
  --port       int     Listen port (default: 9999, env: NR_PORT)
  --db         string  SQLite database path (default: ./niyatnaroute.db, env: NR_DB_PATH)
  --log-level  string  Log level: debug|info|warn|error (default: info, env: NR_LOG_LEVEL)
  --log-format string  Log format: json|text (default: text, env: NR_LOG_FORMAT)
  --admin-pass string  Admin panel password (env: NR_ADMIN_PASS)
  --no-ui      bool    Disable admin UI serving (default: false)
  --mcp        bool    Enable MCP SSE server (default: true)
```

### `niyatnaroute health`
Check server health (exit 0 = healthy, exit 1 = unhealthy).
```
Usage: niyatnaroute health [flags]

Flags:
  --url    string  Server URL (default: http://localhost:9999)
  --json   bool    Output as JSON

Output:
  ✓ NiyatnaRoute is healthy
    Version:  v4.0.0
    Uptime:   2h 15m
    Port:     9999
    Combos:   3 active
    Providers: 5 configured
```

### `niyatnaroute version`
Print version and build info.
```
Output:
  NiyatnaRoute v4.0.0
  Go:    go1.23.0
  Rust:  rustc 1.80.0
  OS:    linux/amd64
  Built: 2026-07-27T08:00:00Z
```

### `niyatnaroute migrate`
Run database migrations.
```
Usage: niyatnaroute migrate [flags]

Flags:
  --db     string  SQLite database path (default: ./niyatnaroute.db)
  --dry    bool    Show pending migrations without applying
```

### `niyatnaroute migrate-from-ts`
Migrate data from old TypeScript/omniroute SQLite DB.
```
Usage: niyatnaroute migrate-from-ts [flags]

Flags:
  --source  string  Path to old omniroute.db (required)
  --output  string  Path to new niyatnaroute.db (default: ./niyatnaroute.db)
  --dry     bool    Preview migration without writing
```

### `niyatnaroute keys`
API key management.
```
Usage: niyatnaroute keys <subcommand> [flags]

Subcommands:
  list     List all API keys
  create   Create a new API key
  revoke   Revoke an API key
  info     Show key details

Flags (list):
  --db     string  SQLite database path
  --json   bool    Output as JSON

Flags (create):
  --db     string  SQLite database path
  --name   string  Key name (required)
  --models string  Comma-separated allowed models
  --rate   int     Rate limit per minute (default: 60)

Output (create):
  ✓ API key created
    Name:   my-key
    Key:    nr-sk-abc123...xyz789
    Prefix: nr-sk-ab
    ⚠ Save this key — it cannot be retrieved again.
```

### `niyatnaroute combos`
Combo management.
```
Usage: niyatnaroute combos <subcommand> [flags]

Subcommands:
  list     List all combos
  create   Create a new combo
  switch   Set active combo
  delete   Delete a combo

Flags (create):
  --name     string  Combo name (required)
  --strategy string  Routing strategy (default: priority)
  --targets  string  JSON array of targets
```

### `niyatnaroute providers`
Provider management.
```
Usage: niyatnaroute providers <subcommand> [flags]

Subcommands:
  list   List all providers
  add    Add a provider
  test   Test provider connection
  rm     Remove a provider
```

## Implementation Structure
```go
// cmd/niyatnaroute/main.go
func main() {
    if len(os.Args) < 2 {
        printUsage()
        os.Exit(1)
    }
    switch os.Args[1] {
    case "serve":    cmdServe(os.Args[2:])
    case "health":   cmdHealth(os.Args[2:])
    case "version":  cmdVersion()
    case "migrate":  cmdMigrate(os.Args[2:])
    case "keys":     cmdKeys(os.Args[2:])
    case "combos":   cmdCombos(os.Args[2:])
    case "providers": cmdProviders(os.Args[2:])
    default:         printUsage(); os.Exit(1)
    }
}
```

## Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Database error |
| 4 | Server unreachable (health check) |
