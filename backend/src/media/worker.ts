import * as mediasoup from 'mediasoup';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import os from 'os';

const workers: mediasoup.types.Worker[] = [];
let nextWorkerIdx = 0;

export async function createWorkers(): Promise<void> {
  const numWorkers = Math.min(os.cpus().length, 4); // Max 4 workers
  logger.info(`Creating ${numWorkers} mediasoup workers...`);

  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      rtcMinPort: config.mediasoup.minPort,
      rtcMaxPort: config.mediasoup.maxPort,
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
    });

    worker.on('died', () => {
      logger.error(`mediasoup worker ${worker.pid} died, exiting...`);
      setTimeout(() => process.exit(1), 2000);
    });

    workers.push(worker);
    logger.info(`mediasoup worker ${worker.pid} created`);
  }
}

export function getNextWorker(): mediasoup.types.Worker {
  const worker = workers[nextWorkerIdx];
  nextWorkerIdx = (nextWorkerIdx + 1) % workers.length;
  return worker;
}

export function getWorkerCount(): number {
  return workers.length;
}
