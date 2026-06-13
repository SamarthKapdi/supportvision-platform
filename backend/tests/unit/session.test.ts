import * as sessionService from '../../src/services/session.service';
import { prismaMock, createMockSession, createMockUser } from '../setup';

describe('Session Service', () => {
  describe('createSession', () => {
    it('Should create a new session', async () => {
      const mockSession = createMockSession();
      prismaMock.session.create.mockResolvedValue(mockSession);

      const result = await sessionService.createSession('user-uuid-1234', 'Test Topic');
      
      expect(prismaMock.session.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', mockSession.id);
      expect(result).toHaveProperty('topic', 'Test Topic');
    });

    it('Should not allow customer to create session', async () => {
      // In service implementation, this logic is often handled by a wrapper or controller,
      // but if in service, we test it. Mocking behavior:
      const attemptCreate = () => sessionService.createSession('customer-id', 'Topic', 'CUSTOMER');
      await expect(attemptCreate()).rejects.toThrow('Unauthorized role');
    });
  });

  describe('joinSession', () => {
    it('Should join a session', async () => {
      const mockSession = createMockSession();
      prismaMock.session.findUnique.mockResolvedValue(mockSession);
      prismaMock.participant.create.mockResolvedValue({} as any);

      const result = await sessionService.joinSession(mockSession.id, 'user-uuid-9999');
      
      expect(result).toHaveProperty('status', 'ACTIVE');
      expect(prismaMock.participant.create).toHaveBeenCalled();
    });
  });

  describe('endSession', () => {
    it('Should end a session', async () => {
      const mockSession = createMockSession();
      prismaMock.session.update.mockResolvedValue({ ...mockSession, status: 'COMPLETED', endTime: new Date() });

      const result = await sessionService.endSession(mockSession.id);
      expect(result.status).toBe('COMPLETED');
      expect(result.endTime).not.toBeNull();
    });
  });

  describe('Session Analytics', () => {
    it('Should calculate session duration', async () => {
      const startTime = new Date('2026-06-13T10:00:00Z');
      const endTime = new Date('2026-06-13T10:30:00Z');
      
      const duration = sessionService.calculateDuration(startTime, endTime);
      expect(duration).toBe(1800); // 30 minutes in seconds
    });

    it('Should get session history', async () => {
      prismaMock.session.findMany.mockResolvedValue([createMockSession()]);
      
      const history = await sessionService.getSessionHistory('user-uuid-1234');
      expect(history.length).toBe(1);
    });

    it('Should get session by invite token', async () => {
      const mockSession = createMockSession();
      prismaMock.session.findFirst.mockResolvedValue(mockSession);
      
      const session = await sessionService.getSessionByToken('valid-invite-token');
      expect(session).toBeDefined();
      expect(session?.id).toBe(mockSession.id);
    });
  });
});
