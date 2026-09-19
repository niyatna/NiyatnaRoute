# Purge Spec: Dead Scripts

## Overview
Delete dead/obsolete scripts from the `scripts/` directory.

## Directories to DELETE
```
scripts/compression-eval/            # Evals — deleted feature
scripts/router-eval/                 # Evals — deleted feature
scripts/research/                    # Research scripts — dead
scripts/homolog/                     # Homolog/staging scripts — dead
scripts/docs/                        # Docs generation — dead (fumadocs)
scripts/features/                    # Feature flag scripts — audit, likely dead
scripts/vps/                         # VPS deployment scripts — dead
scripts/skills/                      # Skills scripts — dead
```

## Directories to KEEP
```
scripts/build/                       # Build scripts — needed
scripts/check/                       # Check scripts (cycles, etc.) — needed
scripts/ci/                          # CI scripts — needed
scripts/dev/                         # Dev scripts — needed
scripts/i18n/                        # i18n scripts — needed
scripts/ops/                         # Ops scripts — needed
scripts/quality/                     # Quality scripts — needed
scripts/release/                     # Release scripts — needed
scripts/test/                        # Test scripts — needed
scripts/cli/                         # CLI scripts — needed
scripts/ad-hoc/                      # Ad-hoc scripts — audit individually
scripts/sre/                         # SRE scripts — audit individually
scripts/compression/                 # Compression scripts — keep (core feature)
```

## Files to DELETE (root level)
```
scripts/codex-ws.sh                  # Codex websocket — dead
scripts/start-ws-server.mjs          # WS server starter — dead
```

## Verification Commands
```bash
# Check deleted dirs are gone
for d in scripts/compression-eval scripts/router-eval scripts/research scripts/homolog scripts/docs scripts/vps scripts/skills; do
  ls "$d" 2>/dev/null && echo "FAIL: $d exists" || echo "PASS: $d gone"
done

# Check remaining dirs still work
ls scripts/build scripts/check scripts/dev scripts/ci

# Must exit 0
npm run typecheck:core
npm run check:cycles
```

## Dependencies
- Depends on purge-evals-promptfoo (compression-eval, router-eval overlap)
