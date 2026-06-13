import { Socket, Server } from 'socket.io';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

// In a real implementation you would interface with a recording service
// e.g., GStreamer, FFmpeg, or an external cloud recorder API

const recordingStates: Map<string, { isRecording: boolean, startedAt?: Date }> = new Map();

export function registerRecordingHandlers(io: Server, socket: Socket, redis: Redis) {
  socket.on('recording:start', async (callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const role = socket.data.user.role;
      if (!sessionId) throw new Error('Not in a session');
      
      if (role !== 'AGENT' && role !== 'ADMIN') {
        throw new Error('Unauthorized: Only agents can start recording');
      }

      // Logic to start recording goes here
      recordingStates.set(sessionId, { isRecording: true, startedAt: new Date() });

      io.to(sessionId).emit('recording:status', {
        isRecording: true,
        startedBy: socket.data.user.id,
        timestamp: new Date().toISOString()
      });

      if (callback) callback({ success: true });
      logger.info(`Recording started for session ${sessionId}`);
    } catch (error) {
      logger.error(`Error in recording:start: ${(error as Error).message}`);
      if (callback) callback({ error: (error as Error).message });
    }
  });

  socket.on('recording:stop', async (callback) => {
    try {
      const sessionId = socket.data.sessionId;
      const role = socket.data.user.role;
      if (!sessionId) throw new Error('Not in a session');
      
      if (role !== 'AGENT' && role !== 'ADMIN') {
        throw new Error('Unauthorized: Only agents can stop recording');
      }

      // Logic to stop recording goes here
      recordingStates.set(sessionId, { isRecording: false });

      io.to(sessionId).emit('recording:status', {
        isRecording: false,
        stoppedBy: socket.data.user.id,
        timestamp: new Date().toISOString()
      });

      if (callback) callback({ success: true });
      logger.info(`Recording stopped for session ${sessionId}`);
    } catch (error) {
      logger.error(`Error in recording:stop: ${(error as Error).message}`);
      if (callback) callback({ error: (error as Error).message });
    }
  });

  socket.on('recording:status', (callback) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) {
       if (callback) callback({ error: 'Not in a session' });
       return;
    }
    const state = recordingStates.get(sessionId) || { isRecording: false };
    if (callback) callback(state);
  });
}
