# SupportVision Architecture

## System Overview
SupportVision utilizes a modern decoupled architecture featuring a React frontend, Node.js/Express backend, PostgreSQL for persistent storage, Redis for session state and pub/sub, and Mediasoup as an SFU (Selective Forwarding Unit) for WebRTC media routing.

## Component Descriptions
- **Web Client**: React SPA handling UI, WebRTC connections via mediasoup-client.
- **API Server**: Node.js REST API for authentication, session management, and signaling.
- **Signaling Server**: Socket.io integrated with the Node.js backend for real-time events.
- **Media Server (SFU)**: Mediasoup workers managing WebRTC Transports, Producers, and Consumers.
- **Database**: PostgreSQL storing user accounts, session logs, and recording metadata.
- **Cache / PubSub**: Redis used for rate limiting, active session caching, and multi-node pub/sub.
- **Storage**: MinIO (S3-compatible) for storing recorded session videos and shared files.

## 1. System Architecture

```mermaid
graph TD
    User((User)) -->|HTTPS| Proxy[Nginx Proxy]
    Proxy --> Frontend[Vite/React SPA]
    Proxy --> Backend[Node.js API & Socket.io]
    Backend --> DB[(PostgreSQL)]
    Backend --> Redis[(Redis Cache)]
    Backend --> Mediasoup[Mediasoup Workers]
    Backend --> Storage[(MinIO S3)]
```

## 2. WebRTC Media Flow via Mediasoup

```mermaid
sequenceDiagram
    participant Client
    participant Signaling
    participant Mediasoup
    
    Client->>Signaling: getRouterRtpCapabilities()
    Signaling->>Client: router.rtpCapabilities
    Client->>Client: Load Mediasoup Device
    Client->>Signaling: createWebRtcTransport()
    Signaling->>Mediasoup: router.createWebRtcTransport()
    Mediasoup-->>Signaling: transport params
    Signaling-->>Client: transport params
    Client->>Signaling: connectTransport(dtlsParameters)
    Signaling->>Mediasoup: transport.connect()
    Client->>Signaling: produce(kind, rtpParameters)
    Signaling->>Mediasoup: transport.produce()
    Mediasoup-->>Signaling: producerId
    Signaling-->>Client: producerId
```

## 3. Database ER Diagram

```mermaid
erDiagram
    User ||--o{ Session : hosts
    Session ||--o{ Participant : contains
    User ||--o{ Participant : acts_as
    Session ||--o{ Recording : has
    
    User {
        uuid id PK
        string email
        string password_hash
        enum role
    }
    Session {
        uuid id PK
        uuid host_id FK
        datetime start_time
        datetime end_time
        string status
    }
    Participant {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        datetime joined_at
    }
    Recording {
        uuid id PK
        uuid session_id FK
        string s3_key
        int duration
    }
```

## 4. Deployment Architecture

```mermaid
graph TD
    Internet((Internet)) -->|TCP 443| LB[Load Balancer]
    LB --> Node1[Docker Node 1]
    LB --> Node2[Docker Node 2]
    Node1 --> DBCluster[(PostgreSQL Primary)]
    Node2 --> DBCluster
    DBCluster -.-> DBReplica[(PostgreSQL Replica)]
    Node1 --> RedisCluster[(Redis Sentinel)]
    Node2 --> RedisCluster
```

## 5. Socket Event Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Redis
    
    Client->>Server: emit("joinRoom", {roomId})
    Server->>Server: Verify Auth Context
    Server->>Redis: SADD room:participants userId
    Server->>Client: emit("roomJoined", currentParticipants)
    Server->>Redis: PUBLISH room_events "User Joined"
```

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    
    User->>API: POST /login (email, pass)
    API->>DB: SELECT user WHERE email
    DB-->>API: user_record
    API->>API: bcrypt.compare(pass, hash)
    API->>API: sign(JWT)
    API-->>User: 200 OK + Token
```

## 7. Recording Flow

```mermaid
sequenceDiagram
    participant Mediasoup
    participant FFmpeg
    participant S3
    
    Mediasoup->>FFmpeg: PlainRtpTransport (Audio/Video)
    FFmpeg->>FFmpeg: Mux to WebM/MP4
    FFmpeg->>S3: Stream to MinIO
    S3-->>FFmpeg: Upload Complete
```

## 8. Reconnection Flow

```mermaid
stateDiagram-v2
    [*] --> Connected
    Connected --> Disconnected: Network Drop
    Disconnected --> Reconnecting: Socket.io Retry
    Reconnecting --> Connected: Success (Resume Transports)
    Reconnecting --> Failed: Timeout (Clean up)
```

## Technology Choices and Rationale
- **Node.js**: Excellent asynchronous I/O, perfect for WebSockets.
- **Mediasoup**: Extremely performant C++ WebRTC worker, scales better than pure Node.js SFUs.
- **PostgreSQL**: ACID compliance for strict session auditing and billing.
- **Redis**: Enables multi-node scaling for Socket.io.

## Data Flow Descriptions
State is managed via Redis for ephemeral real-time data, while PostgreSQL serves as the source of truth for session history, analytics, and user accounts. Media flows purely over UDP (falling back to TCP) strictly handled by Mediasoup workers to avoid V8 garbage collection pauses.

## Security Architecture
- JWT-based authentication with short expirations.
- Role-Based Access Control (RBAC) middleware.
- WebRTC is inherently end-to-end encrypted via DTLS/SRTP.
- API requests are rate-limited via Redis.
- CORS strictly configured to frontend domains.

## Scalability Considerations
- **Horizontal Pod Autoscaling**: API nodes can scale independently of Media workers.
- **Media Routing**: Mediasoup workers map 1:1 with CPU cores.
- **Database**: Read replicas handle complex session history queries.
