import { PrismaClient, Role } from '@prisma/client';
import { generateInviteToken } from '../utils/token';

const prisma = new PrismaClient();

export const sessionService = {
  createSession: async (userId: string, title: string) => {
    const inviteToken = generateInviteToken();
    const session = await prisma.session.create({
      data: {
        title,
        inviteToken,
        status: 'WAITING',
      },
    });

    return session;
  },

  joinSession: async (sessionId: string, userId: string, role: Role) => {
    const participant = await prisma.participant.create({
      data: {
        sessionId,
        userId,
        role,
        joinedAt: new Date(),
      },
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ACTIVE' },
    });

    return participant;
  },

  leaveSession: async (sessionId: string, userId: string) => {
    const participant = await prisma.participant.findFirst({
      where: { sessionId, userId, leftAt: null },
      orderBy: { joinedAt: 'desc' },
    });

    if (participant) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: { leftAt: new Date() },
      });
    }
  },

  endSession: async (sessionId: string, userId: string) => {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session) return null;

    const endedAt = new Date();
    const duration = session.createdAt ? Math.floor((endedAt.getTime() - session.createdAt.getTime()) / 1000) : 0;

    await prisma.participant.updateMany({
      where: { sessionId, leftAt: null },
      data: { leftAt: endedAt },
    });

    return await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ENDED', endedAt, duration },
    });
  },

  getSessionHistory: async (userId: string) => {
    return await prisma.session.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: { 
        participants: true,
        _count: {
          select: {
            chatMessages: true,
            fileAttachments: true,
            recordings: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  getSessionByInviteToken: async (token: string) => {
    return await prisma.session.findUnique({
      where: { inviteToken: token },
    });
  },

  getLiveSessions: async () => {
    return await prisma.session.findMany({
      where: {
        status: { in: ['ACTIVE', 'WAITING'] },
      },
      include: { participants: true },
    });
  },

  forceEndSession: async (sessionId: string) => {
    const endedAt = new Date();
    
    await prisma.participant.updateMany({
      where: { sessionId, leftAt: null },
      data: { leftAt: endedAt },
    });

    return await prisma.session.update({
      where: { id: sessionId },
      data: { status: 'ENDED', endedAt },
    });
  },
};
