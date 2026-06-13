# API Documentation

## Base URL
All API requests should be prefixed with `/api`. For example: `http://localhost:3000/api`.

## Authentication
Authentication is handled via JWT Bearer tokens. 
Include the header: `Authorization: Bearer <your_jwt_token>`

---

## Auth Endpoints

### 1. Login
- **Method**: `POST`
- **Path**: `/auth/login`
- **Description**: Authenticate user and receive JWT.
- **Required Role**: None
- **Request Body**:
  ```json
  {
    "email": "agent@supportvision.com",
    "password": "Agent@123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "token": "eyJhbG...",
    "user": {
      "id": "uuid",
      "email": "agent@supportvision.com",
      "role": "AGENT"
    }
  }
  ```

---

## Session Endpoints

### 2. Create Session
- **Method**: `POST`
- **Path**: `/session/create`
- **Description**: Create a new video support session.
- **Required Role**: `ADMIN`, `AGENT`
- **Request Body**:
  ```json
  {
    "topic": "Router Setup Issue",
    "scheduledFor": "2026-06-14T10:00:00Z" 
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "sessionId": "uuid",
    "inviteLink": "https://.../join/uuid",
    "topic": "Router Setup Issue"
  }
  ```

### 3. Join Session
- **Method**: `POST`
- **Path**: `/session/:id/join`
- **Description**: Validate session ID and retrieve connection info.
- **Required Role**: Any (Customer, Agent, Admin)
- **Request Body**: `{}`
- **Response** (200 OK):
  ```json
  {
    "status": "ACTIVE",
    "hostId": "uuid"
  }
  ```

### 4. End Session
- **Method**: `POST`
- **Path**: `/session/:id/end`
- **Description**: Mark a session as completed.
- **Required Role**: `ADMIN`, `AGENT`
- **Request Body**: `{}`
- **Response** (200 OK):
  ```json
  {
    "message": "Session ended successfully"
  }
  ```

### 5. Session History
- **Method**: `GET`
- **Path**: `/session/history`
- **Description**: Retrieve past sessions for the authenticated user.
- **Required Role**: Any
- **Response** (200 OK):
  ```json
  [
    {
      "sessionId": "uuid",
      "topic": "Billing Issue",
      "duration": 1240,
      "date": "2026-06-10T14:30:00Z"
    }
  ]
  ```

---

## Recording Endpoints

### 6. Start Recording
- **Method**: `POST`
- **Path**: `/recording/:sessionId/start`
- **Description**: Trigger server-side recording of the session.
- **Required Role**: `ADMIN`, `AGENT`
- **Response** (200 OK):
  ```json
  { "recordingId": "uuid", "status": "RECORDING" }
  ```

### 7. Stop Recording
- **Method**: `POST`
- **Path**: `/recording/:sessionId/stop`
- **Description**: Stop recording and process video.
- **Required Role**: `ADMIN`, `AGENT`
- **Response** (200 OK):
  ```json
  { "recordingId": "uuid", "status": "PROCESSING" }
  ```

---

## Upload Endpoints

### 8. Upload File
- **Method**: `POST`
- **Path**: `/upload`
- **Description**: Upload an image or document to share in chat.
- **Required Role**: Any
- **Request Body**: `multipart/form-data` (file)
- **Response** (201 Created):
  ```json
  { "fileUrl": "https://minio.../file.pdf" }
  ```

---

## Admin & Metrics Endpoints

### 9. Get Live Sessions
- **Method**: `GET`
- **Path**: `/admin/live`
- **Description**: Get active sessions for the dashboard.
- **Required Role**: `ADMIN`
- **Response** (200 OK):
  ```json
  [
    {
      "sessionId": "uuid",
      "participants": 2,
      "agentId": "uuid"
    }
  ]
  ```

### 10. Prometheus Metrics
- **Method**: `GET`
- **Path**: `/metrics`
- **Description**: Scrape endpoint for Prometheus.
- **Required Role**: Basic Auth (Prometheus server only)
- **Response** (200 OK): Plaintext Prometheus format.
