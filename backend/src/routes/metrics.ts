import { Router } from 'express';
import { metricsService } from '../services/metrics.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.set('Content-Type', 'text/plain');
    res.send(await metricsService.getMetrics());
  } catch (error) {
    next(error);
  }
});

export default router;
