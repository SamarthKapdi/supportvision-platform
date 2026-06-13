import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validation';
import { authService } from '../services/auth.service';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
