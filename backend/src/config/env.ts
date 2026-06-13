import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default(''),
  REDIS_URL: z.string().default(''),
  JWT_SECRET: z.string().default('secret'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().default('9000'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('supportvision'),
  MINIO_USE_SSL: z.string().transform((val) => val === 'true').default('false'),
  MEDIASOUP_LISTEN_IP: z.string().default('0.0.0.0'),
  MEDIASOUP_ANNOUNCED_IP: z.string().optional(),
  MEDIASOUP_MIN_PORT: z.string().default('10000'),
  MEDIASOUP_MAX_PORT: z.string().default('10100'),
  CORS_ORIGIN: z.string().default('*'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = {
  port: parseInt(_env.data.PORT, 10),
  nodeEnv: _env.data.NODE_ENV,
  database: {
    url: _env.data.DATABASE_URL,
  },
  redis: {
    url: _env.data.REDIS_URL,
  },
  jwt: {
    secret: _env.data.JWT_SECRET,
    expiresIn: _env.data.JWT_EXPIRES_IN,
  },
  minio: {
    endpoint: _env.data.MINIO_ENDPOINT,
    port: parseInt(_env.data.MINIO_PORT, 10),
    accessKey: _env.data.MINIO_ACCESS_KEY,
    secretKey: _env.data.MINIO_SECRET_KEY,
    bucket: _env.data.MINIO_BUCKET,
    useSSL: _env.data.MINIO_USE_SSL,
  },
  mediasoup: {
    listenIp: _env.data.MEDIASOUP_LISTEN_IP,
    announcedIp: _env.data.MEDIASOUP_ANNOUNCED_IP,
    minPort: parseInt(_env.data.MEDIASOUP_MIN_PORT, 10),
    maxPort: parseInt(_env.data.MEDIASOUP_MAX_PORT, 10),
  },
  cors: {
    origin: _env.data.CORS_ORIGIN,
  },
};
