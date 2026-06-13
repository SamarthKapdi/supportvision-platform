import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './utils/errors';
import { env } from './config/env';

import authRoutes from './routes/auth';
import sessionRoutes from './routes/session';
import recordingRoutes from './routes/recording';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import metricsRoutes from './routes/metrics';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.cors.origin }));
app.use(express.json());
app.use(apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/recording', recordingRoutes);
app.use('/api', uploadRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/metrics', metricsRoutes);

app.use(globalErrorHandler);

export default app;
