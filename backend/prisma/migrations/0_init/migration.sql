-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENT', 'CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('WAITING', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('IDLE', 'RECORDING', 'PROCESSING', 'READY');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SessionEventType" AS ENUM ('CREATED', 'JOINED', 'LEFT', 'ENDED', 'RECORDING_START', 'RECORDING_STOP', 'RECONNECTED', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'WAITING',
    "createdById" TEXT NOT NULL,
    "inviteToken" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_inviteToken_key" ON "sessions"("inviteToken");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE INDEX "sessions_createdById_idx" ON "sessions"("createdById");

-- CreateIndex
CREATE INDEX "sessions_inviteToken_idx" ON "sessions"("inviteToken");

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "mediaState" JSONB NOT NULL DEFAULT '{"camera": false, "microphone": false, "screenShare": false}',

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "participants_sessionId_idx" ON "participants"("sessionId");

-- CreateIndex
CREATE INDEX "participants_userId_idx" ON "participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_sessionId_userId_key" ON "participants"("sessionId", "userId");

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");

-- CreateTable
CREATE TABLE "recordings" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "startedById" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'IDLE',
    "filePath" TEXT,
    "downloadUrl" TEXT,
    "size" INTEGER DEFAULT 0,
    "duration" INTEGER DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recordings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recordings_sessionId_idx" ON "recordings"("sessionId");

-- CreateIndex
CREATE INDEX "recordings_status_idx" ON "recordings"("status");

-- CreateTable
CREATE TABLE "file_attachments" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "downloadUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_attachments_sessionId_idx" ON "file_attachments"("sessionId");

-- CreateTable
CREATE TABLE "session_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "SessionEventType" NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_events_sessionId_idx" ON "session_events"("sessionId");

-- CreateIndex
CREATE INDEX "session_events_type_idx" ON "session_events"("type");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
