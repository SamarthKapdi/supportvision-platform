import * as authService from '../../src/services/auth.service';
import { prismaMock, createMockUser } from '../setup';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  describe('login', () => {
    it('Should login with valid credentials', async () => {
      const mockUser = createMockUser();
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('valid_token');

      const result = await authService.login('test@supportvision.com', 'password123');

      expect(result).toHaveProperty('token', 'valid_token');
      expect(result.user).toHaveProperty('email', 'test@supportvision.com');
    });

    it('Should reject invalid password', async () => {
      const mockUser = createMockUser();
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login('test@supportvision.com', 'wrongpass'))
        .rejects.toThrow('Invalid credentials');
    });

    it('Should reject non-existent user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login('unknown@test.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('JWT functionality', () => {
    it('Should generate valid JWT', () => {
      (jwt.sign as jest.Mock).mockReturnValue('mocked_jwt');
      const token = authService.generateToken({ id: '123', role: 'AGENT' });
      expect(token).toBe('mocked_jwt');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123', role: 'AGENT' },
        expect.any(String),
        { expiresIn: '24h' }
      );
    });

    it('Should verify valid JWT', () => {
      const payload = { id: '123', role: 'AGENT' };
      (jwt.verify as jest.Mock).mockReturnValue(payload);
      
      const result = authService.verifyToken('valid_token');
      expect(result).toEqual(payload);
    });

    it('Should reject expired JWT', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => authService.verifyToken('expired_token')).toThrow('Token expired');
    });
  });
});
