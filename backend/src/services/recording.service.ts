import { PrismaClient } from '@prisma/client';
import { generateDownloadUrl, minioClient } from '../config/minio';
import { env } from '../config/env';

const prisma = new PrismaClient();

export const recordingService = {
  startRecording: async (sessionId: string, userId: string) => {
    return await prisma.recording.create({
      data: {
        sessionId,
        startedBy: userId,
        status: 'RECORDING',
      },
    });
  },

  stopRecording: async (recordingId: string) => {
    const recording = await prisma.recording.update({
      where: { id: recordingId },
      data: { status: 'PROCESSING', stoppedAt: new Date() },
    });

    // Simulate FFmpeg media capture processing pipeline
    setTimeout(async () => {
      try {
        const duration = recording.startedAt && recording.stoppedAt
          ? Math.floor((recording.stoppedAt.getTime() - recording.startedAt.getTime()) / 1000)
          : 0;
          
        const dummyBuffer = Buffer.from('Mock WebM Recording Data', 'utf-8');
        const objectName = `recordings/${recording.sessionId}/${recordingId}.webm`;
        
        await minioClient.putObject(env.minio.bucket, objectName, dummyBuffer, dummyBuffer.length, {
          'Content-Type': 'video/webm',
        });

        await prisma.recording.update({
          where: { id: recordingId },
          data: { 
            status: 'READY', 
            filePath: objectName,
            downloadUrl: objectName, // fallback
            size: dummyBuffer.length,
            duration,
          },
        });
      } catch (e) {
        console.error('Simulated recording processing failed', e);
      }
    }, 5000);

    return recording;
  },

  getRecordings: async (sessionId?: string) => {
    if (sessionId) {
      return await prisma.recording.findMany({ where: { sessionId } });
    }
    return await prisma.recording.findMany();
  },

  getRecordingDownloadUrl: async (recordingId: string) => {
    const recording = await prisma.recording.findUnique({ where: { id: recordingId } });
    if (!recording || !recording.filePath) return null;
    return await generateDownloadUrl(recording.filePath);
  },
};
