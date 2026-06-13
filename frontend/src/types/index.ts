export enum Role {
  AGENT = 'agent',
  ADMIN = 'admin',
  CUSTOMER = 'customer'
}

export enum SessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export enum RecordingStatus {
  NOT_STARTED = 'not_started',
  RECORDING = 'recording',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
  FILE = 'file'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  status: SessionStatus;
  inviteToken: string;
  agentId: string;
  customerId?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  socketId: string;
  role: Role;
  name: string;
  cameraOn: boolean;
  micOn: boolean;
  screenShareOn: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  timestamp: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Recording {
  id: string;
  sessionId: string;
  url: string;
  duration: number;
  sizeBytes: number;
  status: RecordingStatus;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: string;
  data: any;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface RoomState {
  participants: Participant[];
  session: Session | null;
  isRecording: boolean;
}

export interface MediaState {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  producers: any[]; // Type properly if mediasoup types are available
  consumers: any[];
}
