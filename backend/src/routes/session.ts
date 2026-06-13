import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { sessionService } from '../services/session.service';
import { z } from 'zod';
import { validate } from '../middleware/validation';

const router = Router();

router.use(authenticate);

const createSessionSchema = z.object({
  title: z.string().min(1),
});

router.post('/create', authorize('AGENT', 'ADMIN'), validate(createSessionSchema), async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.user!.id, req.body.title);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

const joinSessionSchema = z.object({
  role: z.enum(['AGENT', 'CUSTOMER', 'ADMIN'] as any),
});

router.post('/:id/join', validate(joinSessionSchema), async (req, res, next) => {
  try {
    const participant = await sessionService.joinSession(req.params.id, req.user!.id, req.body.role);
    res.json(participant);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/leave', async (req, res, next) => {
  try {
    await sessionService.leaveSession(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/end', authorize('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const session = await sessionService.endSession(req.params.id, req.user!.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

router.get('/history', async (req, res, next) => {
  try {
    const history = await sessionService.getSessionHistory(req.user!.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
});

router.get('/invite/:token', async (req, res, next) => {
  try {
    const session = await sessionService.getSessionByInviteToken(req.params.token);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

export default router;
