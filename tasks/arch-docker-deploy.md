# Architecture: Docker & Deployment

## Multi-Stage Dockerfile
```dockerfile
# Stage 1: Rust builder
FROM rust:1.80-slim AS rust-builder
WORKDIR /build
COPY rust/ .
RUN cargo build --release --target x86_64-unknown-linux-gnu
# Output: /build/target/x86_64-unknown-linux-gnu/release/libniyatnaroute_core.a

# Stage 2: Go builder
FROM golang:1.23-alpine AS go-builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=rust-builder /build/target/x86_64-unknown-linux-gnu/release/libniyatnaroute_core.a /usr/local/lib/
ENV CGO_ENABLED=1
RUN go build -ldflags "-s -w -X main.version=$(cat VERSION)" -o /niyatnaroute ./cmd/niyatnaroute/

# Stage 3: Minimal runtime
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=go-builder /niyatnaroute /niyatnaroute
EXPOSE 9999
VOLUME /data
ENV NR_DB_PATH=/data/niyatnaroute.db
ENV NR_PORT=9999
HEALTHCHECK --interval=30s --timeout=5s CMD ["/niyatnaroute", "health"]
ENTRYPOINT ["/niyatnaroute", "serve"]
```

## docker-compose.yml
```yaml
version: '3.8'
services:
  niyatnaroute:
    image: niyatnaroute:latest
    build: .
    ports:
      - "9999:9999"
    volumes:
      - niyatnaroute-data:/data
    environment:
      - NR_PORT=9999
      - NR_LOG_LEVEL=info
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 64M
          cpus: '1.0'

volumes:
  niyatnaroute-data:
```

## fly.toml
```toml
app = "niyatnaroute"
primary_region = "sin"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 9999
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[mounts]
  source = "niyatnaroute_data"
  destination = "/data"
```

## Systemd Service
```ini
[Unit]
Description=NiyatnaRoute AI Gateway
After=network.target

[Service]
Type=simple
User=niyatnaroute
ExecStart=/usr/local/bin/niyatnaroute serve --port 9999 --db /var/lib/niyatnaroute/data.db
Restart=always
RestartSec=5
LimitNOFILE=65535
Environment=NR_LOG_LEVEL=info

[Install]
WantedBy=multi-user.target
```

## Image Size Target
| Component | Size |
|-----------|------|
| Go binary (stripped) | ~8 MB |
| Rust static lib | ~2 MB (included in binary) |
| Embedded UI | ~200 KB |
| Distroless base | ~5 MB |
| **Total image** | **< 15 MB** |

## CLI Commands
```bash
niyatnaroute serve [--port 9999] [--db ./data.db] [--log-level info]
niyatnaroute health [--url http://localhost:9999]
niyatnaroute version
niyatnaroute migrate [--db ./data.db]
niyatnaroute migrate-from-ts --db ./old-omniroute.db --output ./niyatnaroute.db
niyatnaroute keys list [--db ./data.db]
niyatnaroute keys create --name "my-key" [--db ./data.db]
niyatnaroute combos list [--db ./data.db]
```
