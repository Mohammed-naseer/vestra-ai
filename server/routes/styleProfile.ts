import { Router, Request, Response } from 'express';
import { StylePreference } from '../models/StylePreference.js';
import { getDBStatus } from '../config/db.js';

export const styleProfileRouter = Router();

// GET /api/style-profile/:userId
styleProfileRouter.get('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const profile = await StylePreference.findOne({ userId: req.params.userId }).lean();
    if (!profile) return res.status(404).json({ error: 'Style profile not found' });
    return res.status(200).json(profile);
  } catch (err: any) {
    console.error('[VESTA] GET /api/style-profile error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// PUT /api/style-profile/:userId — upsert
styleProfileRouter.put('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const profile = await StylePreference.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { ...req.body, userId: req.params.userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return res.status(200).json(profile);
  } catch (err: any) {
    console.error('[VESTA] PUT /api/style-profile error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
