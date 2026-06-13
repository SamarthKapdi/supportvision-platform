import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { sessionService } from '../services/session.service';
import { recordingService } from '../services/recording.service';

const router = Router();

router.use(authenticate, authorize('ADMIN' as any));

router.get('/live', async (req, res, next) => {
  try {
    const sessions = await sessionService.getLiveSessions();
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const history = await prisma.session.findMany({ include: { participants: true } });
    res.json({ data: history, total: history.length, page: 1 });
  } catch (error) {
    next(error);
  }
});

router.post('/sessions/:id/force-end', async (req, res, next) => {
  try {
    const session = await sessionService.forceEndSession(req.params.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/recordings', async (req, res, next) => {
  try {
    const recordings = await recordingService.getRecordings();
    res.json(recordings);
  } catch (error) {
    next(error);
  }
});

export default router;
