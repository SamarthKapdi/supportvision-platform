import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Mock Prisma
jest.mock('../../src/utils/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

import prisma from '../../src/utils/prisma';

// Mock Redis
jest.mock('../../src/utils/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    sMembers: jest.fn(),
    publish: jest.fn(),
  },
}));

// Mock MinIO
jest.mock('../../src/utils/minio', () => ({
  minioClient: {
    putObject: jest.fn(),
    presignedGetObject: jest.fn().mockResolvedValue('https://mock-minio-url/file'),
  },
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  jest.clearAllMocks();
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-uuid-1234',
  email: 'test@supportvision.com',
  password_hash: 'hashed_password',
  role: 'AGENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: 'session-uuid-5678',
  hostId: 'user-uuid-1234',
  startTime: new Date(),
  endTime: null,
  status: 'ACTIVE',
  topic: 'Test Session',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

afterAll(async () => {
  // Clean up routines
});
