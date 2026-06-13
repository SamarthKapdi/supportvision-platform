import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { recordingService } from '../services/recording.service';

const router = Router();

router.use(authenticate);

router.post('/:sessionId/start', authorize('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const recording = await recordingService.startRecording(req.params.sessionId, req.user!.id);
    res.json(recording);
  } catch (error) {
    next(error);
  }
});

router.post('/:sessionId/stop', authorize('AGENT', 'ADMIN'), async (req, res, next) => {
  try {
    const recordingId = req.body.recordingId; 
    const recording = await recordingService.stopRecording(recordingId);
    res.json(recording);
  } catch (error) {
    next(error);
  }
});

router.get('/:sessionId', async (req, res, next) => {
  try {
    const recordings = await recordingService.getRecordings(req.params.sessionId);
    res.json(recordings);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/download', async (req, res, next) => {
  try {
    const url = await recordingService.getRecordingDownloadUrl(req.params.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

export default router;
