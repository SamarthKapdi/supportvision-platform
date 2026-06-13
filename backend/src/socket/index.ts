import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { socketAuth } from './middleware/socketAuth';
import { registerSessionHandlers, handleDisconnect } from './handlers/session.handler';
import { registerChatHandlers } from './handlers/chat.handler';
import { registerMediaHandlers } from './handlers/media.handler';
import { registerRecordingHandlers } from './handlers/recording.handler';

export let io: Server;
export const redis = new Redis(config.redis.url);

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: config.cors?.origin || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Apply authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.data.user?.id})`);

    // Register handlers
    registerSessionHandlers(io, socket, redis);
    registerChatHandlers(io, socket, redis);
    registerMediaHandlers(io, socket, redis);
    registerRecordingHandlers(io, socket, redis);

    socket.on('disconnect', () => {
      handleDisconnect(io, socket, redis);
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}
