import { Request } from 'express';
import type { User, Session, Participant, Recording, Role, SessionStatus } from '@prisma/client';

export * from '@prisma/client';

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface SessionWithParticipants extends Session {
  participants: Participant[];
}

export interface MediaState {
  camera: boolean;
  microphone: boolean;
  screenShare: boolean;
}

export interface CreateSessionInput {
  title: string;
}

export interface JoinSessionInput {
  sessionId: string;
  role: Role;
}

export interface ChatMessageInput {
  text: string;
  sessionId: string;
}

export interface SocketData {
  user: UserPayload;
  sessionId: string;
}

export interface RoomState {
  id: string;
  active: boolean;
  participants: string[];
}

export interface TransportOptions {
  id: string;
  iceParameters: any;
  iceCandidates: any[];
  dtlsParameters: any;
  sctpParameters?: any;
}

export interface ProduceOptions {
  kind: 'audio' | 'video';
  rtpParameters: any;
  appData?: any;
}

export interface ConsumeOptions {
  producerId: string;
  rtpCapabilities: any;
}

export interface RecordingState {
  id: string;
  status: 'RECORDING' | 'PROCESSING' | 'READY';
  url?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
