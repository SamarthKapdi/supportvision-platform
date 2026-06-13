# Deployment Guide

This document outlines how to deploy the SupportVision platform for production.

## Prerequisites
- A Linux server (Ubuntu 22.04 LTS recommended)
- Docker (v24+) and Docker Compose (v2+)
- Valid domain name pointing to your server's IP
- SSL/TLS Certificates (Let's Encrypt recommended)

## Docker Compose Deployment (One-Command)

We provide a bundled `docker-compose.yml` for unified deployment.

1. **Clone Repo**
   ```bash
   git clone https://github.com/your-org/SupportVision.git
   cd SupportVision
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production secrets (DB password, JWT secret, etc.)
   ```

3. **Deploy**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

## Environment Configuration
Crucial production variables:
- `NODE_ENV=production`
- `DOMAIN=support.yourcompany.com`
- `MEDIASOUP_ANNOUNCED_IP=<your_public_ip>` (Critical for WebRTC)
- `JWT_SECRET=<strong_random_string>`
- `DB_PASSWORD=<secure_password>`

## Production Considerations
- **Mediasoup Ports**: You must open UDP/TCP ports `10000-10100` (or whatever range configured) on your firewall for WebRTC traffic.
- **Ulimits**: Increase file descriptors for the mediasoup container to handle many concurrent connections.

## SSL/TLS Setup Notes
WebRTC absolutely requires a secure context (HTTPS/WSS).
- Use an Nginx reverse proxy container with Certbot.
- Terminate SSL at Nginx, then forward HTTP to Node.js backend.
- Ensure WebSocket upgrade headers are passed correctly in Nginx configuration.

## Scaling Guidance
- **Stateless API**: The API layer can scale horizontally behind Nginx.
- **Redis Pub/Sub**: If running multiple socket/API containers, Redis acts as the adapter so events broadcast to all containers.
- **SFU Scaling**: Mediasoup handles roughly 500 audio/video consumers per CPU core. Scale by adding more worker processes or deploying to larger instances.

## Backup Strategy
- **Postgres**: Set up automated `pg_dump` cron jobs to S3/MinIO.
- **MinIO**: Enable bucket replication or back up the underlying volume periodically.

## Monitoring Setup (Prometheus + Grafana)
1. The backend exposes `/api/metrics`.
2. Configure Prometheus `prometheus.yml` to scrape the backend container.
3. Import the pre-built Grafana dashboard JSON (located in `docs/dashboards/`) to visualize active calls, WebRTC latency, and CPU usage.

## Troubleshooting
- **Black Video / No Audio**: Verify `MEDIASOUP_ANNOUNCED_IP` is set to the external public IP, and firewall allows UDP traffic.
- **Socket Disconnects**: Ensure Nginx is configured with `proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade";`.
- **Database Connection Issues**: Verify Docker network aliases and wait-for-it scripts.
