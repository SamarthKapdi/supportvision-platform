import { PrismaClient } from '@prisma/client';
import { generateDownloadUrl } from '../config/minio';
import * as Minio from 'minio';
import { env } from '../config/env';
import { minioClient } from '../config/minio';

const prisma = new PrismaClient();

export const fileService = {
  uploadFile: async (sessionId: string, userId: string, file: Express.Multer.File) => {
    const allowedMimeTypes = [
      'application/pdf', 
      'image/png', 
      'image/jpeg', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Allowed: PDF, PNG, JPG, DOCX');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    const objectName = `sessions/${sessionId}/${Date.now()}_${file.originalname}`;
    
    await minioClient.putObject(env.minio.bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });
    
    const attachment = await prisma.fileAttachment.create({
      data: {
        sessionId,
        uploadedById: userId,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: objectName,
      }
    });

    const downloadUrl = await generateDownloadUrl(objectName);
    
    return {
      id: attachment.id,
      originalName: attachment.originalName,
      size: attachment.size,
      url: downloadUrl
    };
  },

  getFileDownloadUrl: async (fileId: string) => {
    const file = await prisma.fileAttachment.findUnique({ where: { id: fileId } });
    if (!file || !file.storagePath) throw new Error('File not found');
    return await generateDownloadUrl(file.storagePath);
  },

  getSessionFiles: async (sessionId: string) => {
    return await prisma.fileAttachment.findMany({ 
      where: { sessionId },
      orderBy: { createdAt: 'desc' }
    });
  },
};
