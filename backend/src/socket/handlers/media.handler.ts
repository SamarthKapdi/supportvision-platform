import { Socket, Server } from 'socket.io';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { getRoom, getOrCreateRoom } from '../../media';
import * as mediasoup from 'mediasoup';

export function registerMediaHandlers(io: Server, socket: Socket, redis: Redis) {
  socket.on('media:get-router-rtp-capabilities', async (callback) => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) throw new Error('Not in a session');
      
      const room = await getOrCreateRoom(sessionId);
      const rtpCapabilities = room.getRtpCapabilities();
      callback({ rtpCapabilities });
    } catch (error) {
      logger.error(`Error in get-router-rtp-capabilities: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:create-transport', async (payload: { direction: 'send' | 'recv' }, callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) throw new Error('Not in a session');

      const room = getRoom(sessionId);
      if (!room) throw new Error('Room not found');

      const transportOptions = await room.createWebRtcTransport(userId, payload.direction);
      callback(transportOptions);
    } catch (error) {
      logger.error(`Error in create-transport: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:connect-transport', async (payload: { direction: 'send' | 'recv', dtlsParameters: mediasoup.types.DtlsParameters }, callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) throw new Error('Not in a session');

      const room = getRoom(sessionId);
      if (!room) throw new Error('Room not found');

      await room.connectTransport(userId, payload.direction, payload.dtlsParameters);
      callback({ success: true });
    } catch (error) {
      logger.error(`Error in connect-transport: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:produce', async (payload: { kind: mediasoup.types.MediaKind, rtpParameters: mediasoup.types.RtpParameters, appData?: any }, callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) throw new Error('Not in a session');

      const room = getRoom(sessionId);
      if (!room) throw new Error('Room not found');

      const producerId = await room.produce(userId, payload.kind, payload.rtpParameters, payload.appData);
      
      // Notify other peers about the new producer
      socket.to(sessionId).emit('media:new-producer', {
        producerId,
        peerId: userId,
        kind: payload.kind,
        appData: payload.appData
      });

      callback({ id: producerId });
    } catch (error) {
      logger.error(`Error in produce: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:consume', async (payload: { producerId: string, rtpCapabilities: mediasoup.types.RtpCapabilities }, callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) throw new Error('Not in a session');

      const room = getRoom(sessionId);
      if (!room) throw new Error('Room not found');

      const consumerOptions = await room.consume(userId, payload.producerId, payload.rtpCapabilities);
      callback(consumerOptions || { error: 'Cannot consume' });
    } catch (error) {
      logger.error(`Error in consume: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:resume-consumer', async (payload: { consumerId: string }, callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) throw new Error('Not in a session');

      const room = getRoom(sessionId);
      if (!room) throw new Error('Room not found');

      await room.resumeConsumer(userId, payload.consumerId);
      callback({ success: true });
    } catch (error) {
      logger.error(`Error in resume-consumer: ${(error as Error).message}`);
      callback({ error: (error as Error).message });
    }
  });

  socket.on('media:producer-close', async (payload: { producerId: string }) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      if (!sessionId) return;

      const room = getRoom(sessionId);
      if (!room) return;

      room.closeProducer(userId, payload.producerId);
      
      socket.to(sessionId).emit('media:producer-closed', {
        producerId: payload.producerId,
        peerId: userId
      });
    } catch (error) {
      logger.error(`Error in producer-close: ${(error as Error).message}`);
    }
  });

  socket.on('participant:media-state', async (payload: { kind: string, enabled: boolean }) => {
    const sessionId = socket.data.sessionId;
    const userId = socket.data.user.id;
    if (!sessionId) return;

    try {
      // Update Redis
      const mediaStateStr = await redis.get(`user:${userId}:media`);
      const mediaState = mediaStateStr ? JSON.parse(mediaStateStr) : {};
      mediaState[payload.kind] = payload.enabled;
      await redis.set(`user:${userId}:media`, JSON.stringify(mediaState));

      socket.to(sessionId).emit('participant:media-state-changed', {
        userId,
        kind: payload.kind,
        enabled: payload.enabled
      });
    } catch (error) {
      logger.error(`Error updating media state: ${(error as Error).message}`);
    }
  });
}
