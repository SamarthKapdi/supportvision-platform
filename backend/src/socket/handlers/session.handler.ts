import { Socket, Server } from 'socket.io';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { getOrCreateRoom, removeRoom } from '../../media';

export function registerSessionHandlers(io: Server, socket: Socket, redis: Redis) {
  socket.on('session:join', async (payload: { sessionId: string }) => {
    try {
      const { sessionId } = payload;
      const userId = socket.data.user.id;
      const userName = socket.data.user.name || 'Anonymous';
      const role = socket.data.user.role;

      // Cancel any disconnect timer
      await redis.del(`user:${userId}:disconnect`);

      await socket.join(sessionId);
      socket.data.sessionId = sessionId;

      // Add to Mediasoup room
      const room = await getOrCreateRoom(sessionId);
      room.addPeer(userId, userName, role);

      // Add to Redis state
      await redis.sadd(`session:${sessionId}:participants`, userId);
      await redis.set(`user:${userId}:session`, sessionId);
      await redis.hset(`session:${sessionId}:state`, userId, JSON.stringify({
        id: userId,
        name: userName,
        role,
        joinedAt: new Date().toISOString()
      }));

      // Broadcast to room
      socket.to(sessionId).emit('participant:joined', {
        userId,
        name: userName,
        role
      });

      logger.info(`User ${userId} joined session ${sessionId}`);
    } catch (error) {
      logger.error(`Error in session:join: ${(error as Error).message}`);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  socket.on('session:leave', async () => {
    await handleLeave(io, socket, redis);
  });

  socket.on('session:end', async () => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      
      // Only agent/admin can end session
      if (socket.data.user.role !== 'AGENT' && socket.data.user.role !== 'ADMIN') {
         socket.emit('error', { message: 'Unauthorized to end session' });
         return;
      }

      // Close Mediasoup room
      removeRoom(sessionId);

      // Clear Redis state
      const participants = await redis.smembers(`session:${sessionId}:participants`);
      for (const p of participants) {
        await redis.del(`user:${p}:session`);
        await redis.del(`user:${p}:media`);
      }
      await redis.del(`session:${sessionId}:participants`);
      await redis.del(`session:${sessionId}:state`);

      io.to(sessionId).emit('session:ended');
      io.in(sessionId).socketsLeave(sessionId);
      
      logger.info(`Session ${sessionId} ended by ${socket.data.user.id}`);
    } catch (error) {
      logger.error(`Error in session:end: ${(error as Error).message}`);
    }
  });

  socket.on('heartbeat', async () => {
    const userId = socket.data.user.id;
    await redis.setex(`user:${userId}:last_seen`, 120, Date.now().toString());
  });
}

export async function handleLeave(io: Server, socket: Socket, redis: Redis) {
  try {
    const sessionId = socket.data.sessionId;
    const userId = socket.data.user?.id;
    if (!sessionId || !userId) return;

    await socket.leave(sessionId);
    
    const room = await getOrCreateRoom(sessionId);
    room.removePeer(userId);

    await redis.srem(`session:${sessionId}:participants`, userId);
    await redis.hdel(`session:${sessionId}:state`, userId);
    await redis.del(`user:${userId}:session`);
    await redis.del(`user:${userId}:media`);

    socket.to(sessionId).emit('participant:left', { userId });
    logger.info(`User ${userId} left session ${sessionId}`);
    
    delete socket.data.sessionId;
  } catch (error) {
    logger.error(`Error in handleLeave: ${(error as Error).message}`);
  }
}

export async function handleDisconnect(io: Server, socket: Socket, redis: Redis) {
  const sessionId = socket.data.sessionId;
  const userId = socket.data.user?.id;
  
  if (sessionId && userId) {
    logger.info(`User ${userId} disconnected from session ${sessionId}. Starting grace period.`);
    // Start 60s timer
    await redis.setex(`user:${userId}:disconnect`, 60, sessionId);
    
    setTimeout(async () => {
      const isDisconnected = await redis.get(`user:${userId}:disconnect`);
      if (isDisconnected === sessionId) {
        logger.info(`User ${userId} grace period expired. Removing from session ${sessionId}.`);
        await handleLeave(io, socket, redis);
      }
    }, 60000);
  }
}
