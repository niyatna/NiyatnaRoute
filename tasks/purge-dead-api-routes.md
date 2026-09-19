# Purge Spec: Dead API Routes

## Overview
Delete API routes for features that no longer exist or are dead bloat.

## Routes to DELETE
```
# VNC Session (dead — no VNC integration)
src/app/api/vnc-session/                         # All VNC session routes

# Tunnels (dead — ngrok/cloudflared/tailscale management)
src/app/api/tunnels/                              # All tunnel routes
  ├── cloudflared/route.ts
  ├── ngrok/route.ts
  └── tailscale/
      ├── check/route.ts
      ├── disable/route.ts
      ├── enable/route.ts
      ├── install/route.ts
      ├── login/route.ts
      ├── route.ts
      └── start-daemon/route.ts

# OpenAPI (dead — test/try route for deleted features)
src/app/api/openapi/                              # OpenAPI test routes

# Version Manager (dead — auto-update system)
src/app/api/version-manager/
  ├── check-update/route.ts
  ├── install/route.ts
  ├── restart/route.ts
  ├── start/route.ts
  ├── status/route.ts
  └── stop/route.ts

# Telemetry (dead — external telemetry)
src/app/api/telemetry/                            # Telemetry routes

# Storage Health (dead)
src/app/api/storage/                              # Storage health routes

# Discovery (dead — model auto-discovery)
src/app/api/providers/[id]/models/discovery/      # Discovery routes
src/app/api/providers/[id]/models/discoveryConfig.ts
src/app/api/providers/[id]/models/discoveryClientVersion.ts
```

## Files to EDIT
Any file that imports or references these dead routes — typically:
- Navigation components (Header, sidebar)
- CLI code that calls these API endpoints
- Type definitions that reference these routes

```bash
# Find all imports referencing dead routes
grep -rn "tunnels\|vnc-session\|version-manager\|telemetry/summary\|storage/health\|openapi/try" src/ --include='*.ts' --include='*.tsx' | grep -v "node_modules"
```

## Verification Commands
```bash
# Directories must not exist
for d in "src/app/api/vnc-session" "src/app/api/tunnels" "src/app/api/openapi" "src/app/api/version-manager" "src/app/api/telemetry" "src/app/api/storage"; do
  ls "$d" 2>/dev/null && echo "FAIL: $d exists" || echo "PASS: $d gone"
done

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None (dead routes are leaf nodes)
