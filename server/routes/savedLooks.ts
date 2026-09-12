import { Router, Request, Response } from 'express';
import { SavedLook } from '../models/SavedLook.js';
import { getDBStatus } from '../config/db.js';

export const savedLooksRouter = Router();

// GET /api/saved-looks/:userId
savedLooksRouter.get('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const looks = await SavedLook.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(looks);
  } catch (err: any) {
    console.error('[VESTA] GET /api/saved-looks error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/saved-looks — upsert by userId+outfitId
savedLooksRouter.post('/', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId, outfitId, name } = req.body;
    if (!userId || !outfitId || !name) {
      return res.status(400).json({ error: 'userId, outfitId, and name are required' });
    }

    const look = await SavedLook.findOneAndUpdate(
      { userId, outfitId },
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(look);
  } catch (err: any) {
    console.error('[VESTA] POST /api/saved-looks error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// PUT /api/saved-looks/:lookId — update rating and other fields
savedLooksRouter.put('/:lookId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const look = await SavedLook.findOneAndUpdate(
      { outfitId: req.params.lookId, userId },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!look) return res.status(404).json({ error: 'Saved look not found' });
    return res.status(200).json(look);
  } catch (err: any) {
    console.error('[VESTA] PUT /api/saved-looks error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// DELETE /api/saved-looks/:lookId
savedLooksRouter.delete('/:lookId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId } = req.query as { userId: string };
    if (!userId) return res.status(400).json({ error: 'userId query param is required' });

    await SavedLook.deleteOne({ outfitId: req.params.lookId, userId });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[VESTA] DELETE /api/saved-looks error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
