export const APP_NAME = 'SupportVision';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  METRICS: '/admin/metrics',
  HISTORY: '/history',
  ROOM: '/room/:sessionId',
  JOIN: '/join/:token',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const SOCKET_EVENTS = {
  JOIN_SESSION: 'join-session',
  LEAVE_SESSION: 'leave-session',
  SESSION_ENDED: 'session-ended',
  PARTICIPANT_JOINED: 'participant-joined',
  PARTICIPANT_LEFT: 'participant-left',
  PARTICIPANT_UPDATED: 'participant-updated',
  CHAT_MESSAGE: 'chat-message',
  FILE_SHARED: 'file-shared',
  RECORDING_STARTED: 'recording-started',
  RECORDING_STOPPED: 'recording-stopped',
  // Mediasoup events
  GET_ROUTER_RTP_CAPABILITIES: 'getRouterRtpCapabilities',
  CREATE_WEB_RTC_TRANSPORT: 'createWebRtcTransport',
  CONNECT_TRANSPORT: 'connectTransport',
  PRODUCE: 'produce',
  CONSUME: 'consume',
  RESUME: 'resume',
  PAUSE: 'pause',
  NEW_PRODUCER: 'newProducer',
};
