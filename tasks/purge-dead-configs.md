# Purge Spec: Dead Root Config Files

## Overview
Delete configuration files for tools/frameworks NiyatnaRoute doesn't use.

## Files to DELETE
```
# Mutation Testing (Stryker) — never used
stryker.conf.json                    # 24KB config
stryker.disablebail.json             # Stryker bail config

# Code Quality (SonarQube) — not used
sonar-project.properties             # SonarQube config

# Coverage (Codecov) — moving to Go
codecov.yml                          # Codecov config

# E2E Testing (Playwright) — dead
playwright.config.ts                 # Playwright config

# Security (Socket) — dead
socket.yml                           # Socket.dev config

# Prose Linting (Vale) — unnecessary
.vale/                               # Entire Vale directory
.vale.ini                            # Vale config

# Misc
news.json                            # News feed data — dead
perf-audit-report.md                 # One-off perf report — dead
pnpm-workspace.yaml                  # pnpm workspace — not using pnpm
pnpm.json                            # pnpm config
source.config.ts                     # Source/fumadocs config — dead

# ESLint (3 extra configs beyond main)
eslint.complexity-ratchets.config.mjs
eslint.complexity.config.mjs
eslint.sonarjs.config.mjs

# PostCSS
postcss.config.mjs                   # PostCSS — dead (Tailwind handles it)

# Prettier
prettier.config.mjs                  # Moving to Go (gofmt)

# Vitest (extra config)
vitest.mcp.config.ts                 # MCP-specific vitest — dead
```

## Files to KEEP
```
.gitignore                           # Still needed
.editorconfig                        # Still needed
.dockerignore                        # Still needed
.npmignore                           # Still needed for now
eslint.config.mjs                    # Main ESLint (keep until Go migration)
vitest.config.ts                     # Main vitest (keep until Go migration)
tsconfig.json                        # Keep until Go migration
tsconfig.typecheck-core.json         # Keep until Go migration
```

## Verification Commands
```bash
# Check each file is gone
for f in stryker.conf.json stryker.disablebail.json sonar-project.properties codecov.yml playwright.config.ts socket.yml news.json perf-audit-report.md pnpm-workspace.yaml pnpm.json source.config.ts; do
  ls "$f" 2>/dev/null && echo "FAIL: $f exists" || echo "PASS: $f gone"
done

# Must exit 0
npm run typecheck:core
```

## Dependencies
- None
