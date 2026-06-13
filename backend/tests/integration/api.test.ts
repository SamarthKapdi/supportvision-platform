import request from 'supertest';
import app from '../../src/app'; // assuming express app is exported here
import { prismaMock, createMockUser, createMockSession } from '../setup';
import jwt from 'jsonwebtoken';

describe('API Integration Tests', () => {
  const adminToken = jwt.sign({ id: 'admin-id', role: 'ADMIN' }, 'test-secret');
  const agentToken = jwt.sign({ id: 'agent-id', role: 'AGENT' }, 'test-secret');
  const customerToken = jwt.sign({ id: 'customer-id', role: 'CUSTOMER' }, 'test-secret');

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Auth API', () => {
    it('POST /api/auth/login - Should login and return token', async () => {
      prismaMock.user.findUnique.mockResolvedValue(createMockUser());
      // Bypass bcrypt for integration test by mocking it globally or relying on test DB
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@supportvision.com', password: 'password' });
      
      // Assuming mocked service or real endpoint behavior
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('Session API', () => {
    it('POST /api/session/create - Agent can create session', async () => {
      prismaMock.session.create.mockResolvedValue(createMockSession());
      
      const res = await request(app)
        .post('/api/session/create')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({ topic: 'Help' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('sessionId');
    });

    it('POST /api/session/:id/join - Anyone can join active session', async () => {
      prismaMock.session.findUnique.mockResolvedValue(createMockSession());
      prismaMock.participant.create.mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/session/sess-123/join')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ACTIVE');
    });

    it('POST /api/session/:id/end - Agent can end session', async () => {
      prismaMock.session.update.mockResolvedValue(createMockSession({ status: 'COMPLETED' }));

      const res = await request(app)
        .post('/api/session/sess-123/end')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
    });

    it('GET /api/session/history - Returns user history', async () => {
      prismaMock.session.findMany.mockResolvedValue([createMockSession()]);

      const res = await request(app)
        .get('/api/session/history')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Admin API & Protection', () => {
    it('GET /api/admin/live - Admin can access', async () => {
      const res = await request(app)
        .get('/api/admin/live')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('RBAC authorization tests - Agent cannot access admin live', async () => {
      const res = await request(app)
        .get('/api/admin/live')
        .set('Authorization', `Bearer ${agentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Rate Limiting', () => {
    it('Rate limiting test - Should limit excessive requests', async () => {
      // Simulate multiple fast requests
      const promises = Array(15).fill(0).map(() => 
        request(app).post('/api/auth/login').send({ email: 'x', password: 'y' })
      );
      
      const responses = await Promise.all(promises);
      const hasRateLimitStatus = responses.some(r => r.status === 429);
      expect(hasRateLimitStatus).toBe(true);
    });
  });
});
