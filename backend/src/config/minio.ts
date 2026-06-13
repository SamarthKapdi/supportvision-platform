import * as Minio from 'minio';
import { env } from './env';

export const minioClient = new Minio.Client({
  endPoint: env.minio.endpoint,
  port: env.minio.port,
  useSSL: env.minio.useSSL,
  accessKey: env.minio.accessKey,
  secretKey: env.minio.secretKey,
});

export const initMinio = async () => {
  const exists = await minioClient.bucketExists(env.minio.bucket);
  if (!exists) {
    await minioClient.makeBucket(env.minio.bucket, 'us-east-1');
  }
};

export const generateUploadUrl = async (objectName: string) => {
  return await minioClient.presignedPutObject(env.minio.bucket, objectName, 3600);
};

export const generateDownloadUrl = async (objectName: string) => {
  return await minioClient.presignedGetObject(env.minio.bucket, objectName, 3600);
};
