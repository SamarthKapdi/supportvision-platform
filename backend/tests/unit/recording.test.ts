import * as recordingService from '../../src/services/recording.service';
import { prismaMock } from '../setup';

jest.mock('child_process', () => ({
  spawn: jest.fn().mockReturnValue({
    on: jest.fn(),
    kill: jest.fn(),
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() }
  })
}));

describe('Recording Service', () => {
  describe('Start/Stop Recording', () => {
    it('Should start recording', async () => {
      prismaMock.recording.create.mockResolvedValue({
        id: 'rec-123',
        sessionId: 'sess-123',
        status: 'RECORDING',
        s3Key: null,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await recordingService.startRecording('sess-123');
      expect(result.status).toBe('RECORDING');
      expect(prismaMock.recording.create).toHaveBeenCalled();
    });

    it('Should stop recording', async () => {
      prismaMock.recording.update.mockResolvedValue({
        id: 'rec-123',
        sessionId: 'sess-123',
        status: 'PROCESSING',
        s3Key: null,
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await recordingService.stopRecording('sess-123');
      expect(result.status).toBe('PROCESSING');
      // Verify ffmpeg kill logic in actual implementation
    });
  });

  describe('Recording Management', () => {
    it('Should update recording status', async () => {
      prismaMock.recording.update.mockResolvedValue({
        id: 'rec-123',
        sessionId: 'sess-123',
        status: 'COMPLETED',
        s3Key: 'videos/sess-123.webm',
        duration: 1200,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await recordingService.updateStatus('rec-123', 'COMPLETED', 'videos/sess-123.webm');
      expect(result.status).toBe('COMPLETED');
      expect(result.s3Key).toBe('videos/sess-123.webm');
    });

    it('Should get recordings for session', async () => {
      prismaMock.recording.findMany.mockResolvedValue([
        {
          id: 'rec-123',
          sessionId: 'sess-123',
          status: 'COMPLETED',
          s3Key: 'key',
          duration: 120,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      const records = await recordingService.getRecordings('sess-123');
      expect(records.length).toBe(1);
      expect(records[0].id).toBe('rec-123');
    });
  });
});
