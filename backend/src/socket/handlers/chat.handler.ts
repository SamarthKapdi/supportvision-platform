import { Socket, Server } from 'socket.io';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function registerChatHandlers(io: Server, socket: Socket, redis: Redis) {
  socket.on('chat:message', async (payload: { message: string }) => {
    try {
      const sessionId = socket.data.sessionId;
      const userId = socket.data.user.id;
      const userName = socket.data.user.name || 'Anonymous';
      
      if (!sessionId) {
        socket.emit('error', { message: 'Not in a session' });
        return;
      }

      // Store in DB
      const chatMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          senderId: userId,
          content: payload.message,
          type: 'TEXT',
        },
        include: { sender: true }
      });

      const messageObj = {
        id: chatMessage.id,
        sessionId,
        senderId: userId,
        senderName: userName,
        content: payload.message,
        timestamp: chatMessage.createdAt.toISOString()
      };

      io.to(sessionId).emit('chat:message', messageObj);
    } catch (error) {
      logger.error(`Error in chat:message: ${(error as Error).message}`);
    }
  });

  socket.on('chat:history', async () => {
    try {
      const sessionId = socket.data.sessionId;
      if (!sessionId) return;
      
      // Fetch from DB
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        include: { sender: true }
      });
      
      const history = messages.map(msg => ({
        id: msg.id,
        sessionId: msg.sessionId,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        content: msg.content,
        timestamp: msg.createdAt.toISOString()
      }));
      
      socket.emit('chat:history', history);
    } catch (error) {
      logger.error(`Error in chat:history: ${(error as Error).message}`);
    }
  });

  socket.on('chat:typing', (payload: { isTyping: boolean }) => {
    const sessionId = socket.data.sessionId;
    const userId = socket.data.user.id;
    if (!sessionId) return;

    socket.to(sessionId).emit('chat:typing', {
      userId,
      isTyping: payload.isTyping
    });
  });
}
