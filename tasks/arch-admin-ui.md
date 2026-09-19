# Architecture: Admin UI (Lightweight)

## Overview
Ultra-light static admin dashboard. No React, no build step, no npm. Vanilla JS + CSS, served via Go `embed.FS`. Total bundle < 200KB gzipped.

## Design System
- **Theme**: Dark mode (HSL-based), NiyatnaRoute brand purple (#7c3aed)
- **Font**: Inter (from CDN, woff2 subset only)
- **Style**: Glassmorphism cards, subtle shadows, micro-animations
- **Layout**: CSS Grid + Flexbox, responsive (mobile-friendly)
- **Icons**: Lucide SVG icons (inline, no library)

## Pages (8 essential)

### 1. Dashboard Home (`/`)
- Server health status (uptime, version, port)
- Request count (24h)
- Active combos
- Provider status grid

### 2. Combos (`/combos`)
- Table: name, strategy, targets, status
- Create/Edit modal (strategy selector, target drag-reorder)
- Delete confirmation
- API: `GET/POST/PUT/DELETE /api/combos`

### 3. Providers (`/providers`)
- Table: name, type, endpoint, status, model count
- Create/Edit modal (API key field, endpoint URL)
- Test connection button
- API: `GET/POST/PUT/DELETE /api/providers`

### 4. API Keys (`/keys`)
- Table: name, key (masked), allowed models, rate limit
- Create modal (generate key, set limits)
- Revoke button
- API: `GET/POST/PUT/DELETE /api/keys`

### 5. Playground (`/playground`)
- Chat interface (messages list + input)
- Model selector dropdown
- Combo selector dropdown
- Streaming SSE response display
- API: `POST /v1/chat/completions`

### 6. Logs (`/logs`)
- Table: timestamp, model, provider, latency, tokens, status
- Filters: date range, model, provider, status
- Pagination (50 per page)
- API: `GET /api/logs`

### 7. Settings (`/settings`)
- Key-value settings editor
- Port, auth, logging config
- API: `GET/PUT /api/settings`

### 8. Compression (`/compression`)
- Engine selector (rtk/caveman/headroom)
- Compression stats (savings %, avg reduction)
- Test compression tool
- API: `GET/PUT /api/compression`

## File Structure
```
ui/
├── index.html              # SPA shell with router
├── style.css               # Full design system + all components
├── app.js                  # Router + page controllers + API client
├── components/
│   ├── modal.js            # Modal component
│   ├── table.js            # Table with sort + pagination
│   ├── toast.js            # Toast notifications
│   ├── chart.js            # Canvas-based mini charts
│   └── form.js             # Form validation helpers
└── icons/
    └── icons.js            # Inline SVG icon registry
```

## Size Budget
| File | Max Size (gzipped) |
|------|--------------------|
| index.html | 2 KB |
| style.css | 15 KB |
| app.js | 30 KB |
| components/*.js | 20 KB |
| Inter font subset | 30 KB |
| **Total** | **< 100 KB** |

## Go embed.FS Integration
```go
//go:embed ui/*
var uiFS embed.FS

func serveUI(mux *http.ServeMux) {
    stripped, _ := fs.Sub(uiFS, "ui")
    fileServer := http.FileServer(http.FS(stripped))
    mux.Handle("/", fileServer)
}
```
