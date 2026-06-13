# SupportVision - Real-Time Customer Support Video Calling Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node->=20.0.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-enabled-blue.svg)

SupportVision is a modern, WebRTC-based platform designed to connect support agents with customers through high-quality video and audio calls, complete with screen sharing, call recording, and real-time chat capabilities. Built for ATOMQUEST 2026.

## Architecture Diagram

```mermaid
graph TD
    Client[Web Client - React/Vite] -->|HTTPS/WSS| Nginx[Nginx Reverse Proxy]
    Nginx --> Frontend[Frontend Assets]
    Nginx --> Backend[Backend Node.js API & Socket.io]
    
    Backend --> DB[(PostgreSQL)]
    Backend --> Cache[(Redis)]
    Backend --> Mediasoup[Mediasoup WebRTC Workers]
    Mediasoup <-->|UDP/TCP WebRTC| Client
    Mediasoup --> RecordingService[Recording Service]
    RecordingService --> MinIO[(MinIO Object Storage)]
```

## Features

This project implements all 11 Hackathon requirements:
1. **Secure Authentication** (Role-based access for Admins, Agents, Customers)
2. **Video & Audio Calling** (SFU architecture via Mediasoup)
3. **Screen Sharing** (High resolution display capture)
4. **Real-time Chat** (In-call messaging with WebSockets)
5. **Call Recording** (Server-side recording to MinIO S3)
6. **Live Dashboard** (Admin monitoring of active sessions)
7. **Session History** (Detailed call logs and durations)
8. **Scalable Architecture** (Dockerized, Redis pub/sub ready)
9. **Resilience & Reconnection** (Seamless reconnect on network drop)
10. **File Sharing** (Secure document exchange during calls)
11. **Metrics & Monitoring** (Prometheus & Grafana integration)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

## Quick Start

The fastest way to run SupportVision is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-org/SupportVision.git
cd SupportVision

# Start all services
docker compose up -d

# View logs
docker compose logs -f
```
Access the application at `http://localhost`.

## Development Setup

### 1. Start Infrastructure
```bash
docker compose -f docker-compose.infra.yml up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Sample Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@supportvision.com | Admin@123! | Full access, dashboard |
| Agent | agent@supportvision.com | Agent@123! | Can create/end sessions |
| Customer | customer@example.com | Cust@123! | Can only join sessions |

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/login` | POST | Authenticate user | No |
| `/api/session/create` | POST | Create a new session | Agent/Admin |
| `/api/session/:id/join` | POST | Join existing session | Any |
| `/api/session/:id/end` | POST | Terminate session | Agent/Admin |
| `/api/session/history`| GET | List past sessions | Agent/Admin |
| `/api/admin/live` | GET | Active sessions metric| Admin |

## Socket Events

| Event | Direction | Payload / Description |
|-------|-----------|-----------------------|
| `joinRoom` | Client -> Server | `roomId`, `token` |
| `participantJoined` | Server -> Client | `userId`, `role`, `name` |
| `sendMessage` | Client -> Server | `text`, `timestamp` |
| `receiveMessage` | Server -> Client | `messageObject` |
| `producerCreated` | Client -> Server | WebRTC Producer Info |
| `newProducer` | Server -> Client | WebRTC Remote Producer |

## Folder Structure

```
SupportVision/
├── backend/            # Express.js, Socket.io, Mediasoup
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/           # React, Vite, TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
├── docs/               # Detailed Documentation
├── docker-compose.yml  # Prod deployment
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` in respective folders:

**Backend:**
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/supportvision"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

## Screenshots

*(Placeholders for future screenshots)*
![Login Screen](placeholder-login.png)
![Active Call](placeholder-call.png)
![Admin Dashboard](placeholder-dashboard.png)

## License
MIT License. See `LICENSE` for details.

## Hackathon Info
Built for **ATOMQUEST 2026**.
Team: SupportVision Team
