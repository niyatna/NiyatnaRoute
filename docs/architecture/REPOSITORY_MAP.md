# NiyatnaRoute Repository Map

## Directory Layout

```
spirula/
├── src/
│   ├── app/                 # Next.js App Router (Dashboard & API routes)
│   ├── domain/              # Policy engine & routing rules
│   ├── lib/                 # Database domain modules (src/lib/db/) & auth
│   ├── server/              # Authz & WebSocket live server (port 9999)
│   └── shared/              # Validation schemas, constants, UI components
├── open-sse/                # Core streaming & LLM proxy engine
│   ├── executors/           # Upstream HTTP request dispatchers
│   ├── handlers/            # Request handlers (chat, embeddings, search)
│   ├── mcp-server/          # 15 Core MCP Server tools (port 9999)
│   ├── services/            # Combo routing, prompt compression (rtk/caveman/headroom)
│   └── translator/          # Protocol format translation
├── tasks/                   # Master implementation plan & todo checklist
├── tests/                   # Unit & vitest test suites
├── scripts/                 # Maintenance, build, and dev scripts
├── package.json             # Root package manifest (Webpack Light, max 1024MB RAM)
└── README.md                # NiyatnaRoute master overview
```
