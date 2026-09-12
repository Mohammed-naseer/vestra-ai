import { Router, Request, Response } from 'express';
import { WardrobeItem } from '../models/WardrobeItem.js';
import { getDBStatus } from '../config/db.js';

export const wardrobeRouter = Router();

// GET /api/wardrobe/:userId
wardrobeRouter.get('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const items = await WardrobeItem.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(items);
  } catch (err: any) {
    console.error('[VESTA] GET /api/wardrobe error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/wardrobe  — upsert by userId+itemId to prevent duplicates
wardrobeRouter.post('/', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId, itemId, name, category } = req.body;
    if (!userId || !itemId || !name || !category) {
      return res.status(400).json({ error: 'userId, itemId, name, and category are required' });
    }

    const item = await WardrobeItem.findOneAndUpdate(
      { userId, itemId },
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(item);
  } catch (err: any) {
    console.error('[VESTA] POST /api/wardrobe error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// PUT /api/wardrobe/:itemId  — update by itemId (client-side ID)
wardrobeRouter.put('/:itemId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const item = await WardrobeItem.findOneAndUpdate(
      { itemId: req.params.itemId, userId },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!item) return res.status(404).json({ error: 'Item not found' });
    return res.status(200).json(item);
  } catch (err: any) {
    console.error('[VESTA] PUT /api/wardrobe error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// DELETE /api/wardrobe/:itemId
wardrobeRouter.delete('/:itemId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId } = req.query as { userId: string };
    if (!userId) return res.status(400).json({ error: 'userId query param is required' });

    await WardrobeItem.deleteOne({ itemId: req.params.itemId, userId });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[VESTA] DELETE /api/wardrobe error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
