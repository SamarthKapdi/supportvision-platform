import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initMinio } from './config/minio';
import Redis from 'ioredis';
import { Server as SocketIOServer } from 'socket.io';
import * as mediasoup from 'mediasoup';
import { mediasoupConfig } from './config/mediasoup';

const startServer = async () => {
  try {
    await initMinio();
    logger.info('MinIO initialized');

    const redisClient = new Redis(env.redis.url);
    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis error', err));

    const workers: mediasoup.types.Worker[] = [];
    for (let i = 0; i < mediasoupConfig.numWorkers; i++) {
      const worker = await mediasoup.createWorker(mediasoupConfig.worker);
      worker.on('died', () => {
        logger.error(`mediasoup worker died, exiting in 2 seconds... [pid:${worker.pid}]`);
        setTimeout(() => process.exit(1), 2000);
      });
      workers.push(worker);
    }
    logger.info(`Mediasoup initialized with ${workers.length} workers`);

    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: env.cors.origin,
        methods: ['GET', 'POST'],
      },
    });
    
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    server.listen(env.port, () => {
      logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
    });

    const shutdown = async () => {
      logger.info('Shutting down...');
      server.close(() => {
        logger.info('HTTP server closed');
      });
      redisClient.quit();
      workers.forEach((w) => w.close());
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
