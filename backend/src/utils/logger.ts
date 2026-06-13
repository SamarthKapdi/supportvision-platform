import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const logger = winston.createLogger({
  level: env.nodeEnv === 'development' ? 'debug' : 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
