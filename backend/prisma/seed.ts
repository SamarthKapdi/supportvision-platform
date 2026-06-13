import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.sessionEvent.deleteMany();
  await prisma.fileAttachment.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const agentHash = await bcrypt.hash('Agent@123', 12);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@supportvision.io',
      passwordHash,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create Agents
  const agent1 = await prisma.user.create({
    data: {
      email: 'agent1@supportvision.io',
      passwordHash: agentHash,
      name: 'Sarah Johnson',
      role: Role.AGENT,
    },
  });
  console.log(`✅ Agent created: ${agent1.email}`);

  const agent2 = await prisma.user.create({
    data: {
      email: 'agent2@supportvision.io',
      passwordHash: agentHash,
      name: 'Mike Chen',
      role: Role.AGENT,
    },
  });
  console.log(`✅ Agent created: ${agent2.email}`);

  // Create sample sessions
  const session1 = await prisma.session.create({
    data: {
      title: 'Technical Support - Login Issue',
      status: 'ENDED',
      createdById: agent1.id,
      startedAt: new Date(Date.now() - 3600000),
      endedAt: new Date(Date.now() - 1800000),
      duration: 1800,
    },
  });

  const session2 = await prisma.session.create({
    data: {
      title: 'Billing Inquiry',
      status: 'ENDED',
      createdById: agent2.id,
      startedAt: new Date(Date.now() - 7200000),
      endedAt: new Date(Date.now() - 5400000),
      duration: 1800,
    },
  });

  // Create session events
  await prisma.sessionEvent.createMany({
    data: [
      { sessionId: session1.id, userId: agent1.id, type: 'CREATED' },
      { sessionId: session1.id, userId: agent1.id, type: 'JOINED' },
      { sessionId: session1.id, userId: agent1.id, type: 'ENDED' },
      { sessionId: session2.id, userId: agent2.id, type: 'CREATED' },
      { sessionId: session2.id, userId: agent2.id, type: 'JOINED' },
      { sessionId: session2.id, userId: agent2.id, type: 'ENDED' },
    ],
  });

  console.log('✅ Sample sessions created');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('──────────────────────────────');
  console.log('Admin:  admin@supportvision.io / Admin@123');
  console.log('Agent1: agent1@supportvision.io / Agent@123');
  console.log('Agent2: agent2@supportvision.io / Agent@123');
  console.log('──────────────────────────────');
  console.log('');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
