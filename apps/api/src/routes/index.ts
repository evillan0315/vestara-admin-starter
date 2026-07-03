import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

// Mount feature routes
router.use(healthRouter);

// Future:
// router.use('/auth', authRouter);
// router.use('/users', usersRouter);
// router.use('/settings', settingsRouter);
// router.use('/audit-logs', auditRouter);

export default router;
