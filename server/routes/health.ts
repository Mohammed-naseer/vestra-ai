import { Router, Request, Response } from 'express';
import { getDBStatus } from '../config/db.js';

export const healthRouter = Router();

// GET /api/health
healthRouter.get('/', (_req: Request, res: Response) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'VESTA API',
    version: '2.0',
    database: dbStatus,
  });
});
