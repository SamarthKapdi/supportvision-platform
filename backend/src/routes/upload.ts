import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { fileService } from '../services/file.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required in body' });
    }
    const result = await fileService.uploadFile(sessionId, req.user!.id, req.file);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/files/:sessionId', async (req, res, next) => {
  try {
    const files = await fileService.getSessionFiles(req.params.sessionId);
    res.json(files);
  } catch (error) {
    next(error);
  }
});

router.get('/files/:id/download', async (req, res, next) => {
  try {
    const url = await fileService.getFileDownloadUrl(req.params.id);
    res.json({ url });
  } catch (error) {
    next(error);
  }
});

export default router;
