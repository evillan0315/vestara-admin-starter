import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';

const router = Router();

// Mount feature routes
router.use(healthRouter);

// Auth routes
router.use('/auth', authRouter);

// Future:
// router.use('/users', usersRouter);
// router.use('/settings', settingsRouter);
// router.use('/audit-logs', auditRouter);

export default router;
