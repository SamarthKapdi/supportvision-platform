# Hackathon Submission: ATOMQUEST 2026

## Project Name and Team
**Project**: SupportVision
**Team**: CodeCrafters (or respective team name)

## Problem Statement
Customer support interactions involving complex physical setups (e.g., routers, hardware, software configuration) are difficult to resolve over text or standard voice calls. Existing solutions are either too expensive, lack integration, or offer poor video quality.

## Solution Overview
SupportVision is a custom-built, WebRTC-based video support platform that enables agents to generate secure, one-time links for customers. It offers high-quality video, screen sharing, server-side recording, and live chat, packaged in an easy-to-deploy, scalable Docker environment.

## Features Checklist
We successfully implemented all 11 required features:
- [x] Secure Authentication (JWT, RBAC)
- [x] Video & Audio Calling (Mediasoup SFU)
- [x] Screen Sharing
- [x] Real-time Chat
- [x] Call Recording (FFmpeg + MinIO)
- [x] Live Dashboard (Admin interface)
- [x] Session History & Analytics
- [x] Scalable Architecture (Redis, Docker)
- [x] Resilience & Reconnection handling
- [x] File Sharing via Chat
- [x] Metrics & Monitoring (Prometheus/Grafana)

## Demo Workflow (Step by Step)
1. **Login**: Go to the portal and login as an Agent.
2. **Dashboard**: View past sessions. Click "Create New Session".
3. **Invite Customer**: Copy the generated secure link. Send it to a hypothetical customer.
4. **Join Call**: Agent enters the room. Customer opens the link in an incognito window and joins without creating an account.
5. **Support Interaction**: 
   - Agent toggles video.
   - Customer shares screen.
   - Both use the text chat to send a file.
6. **Record**: Agent clicks "Start Recording".
7. **End Call**: Agent ends the session, kicking the customer out. The recording is saved to the history tab.
8. **Admin View**: Login as Admin to view the Live Sessions dashboard and Prometheus metrics.

## Technical Implementation Highlights
- Used **Mediasoup** instead of peer-to-peer for the WebRTC layer to ensure low bandwidth utilization on mobile clients and reliable recording.
- Implemented **Redis Pub/Sub** ensuring the chat and signaling work even if we scale to multiple backend instances.
- **Server-side Recording**: Avoided browser-based MediaRecorder limitations by routing RTP packets directly to FFmpeg on the server.

## Architecture Decisions
- Chose an SFU over MCU to reduce server CPU load while keeping client bandwidth manageable.
- Chose MinIO for storage so the platform remains cloud-agnostic but S3-compatible.

## Challenges and Solutions
- **WebRTC NAT Traversal**: Navigating complex ICE candidate generation was tricky. Resolved by carefully mapping Docker ports and properly setting the `announcedIp`.
- **Synchronizing State**: Handling race conditions when a user refreshes the page. Solved by storing ephemeral session state in Redis.

## Future Improvements
- AI-based transcription and summarization of support calls.
- Mobile native apps using React Native WebRTC.
- Integration with existing CRM platforms (Zendesk, Salesforce).

## How to Run the Demo
1. Ensure Docker is running.
2. Execute: `docker compose up -d`
3. Navigate to `http://localhost:5173`
4. Use provided sample credentials in `README.md`.
