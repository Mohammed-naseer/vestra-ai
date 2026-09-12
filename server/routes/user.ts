import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';

export const userRouter = Router();

// GET /api/user/:userId
userRouter.get('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const user = await User.findOne({ userId: req.params.userId }).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (err: any) {
    console.error('[VESTA] GET /api/user error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/user  — upsert (create or update)
userRouter.post('/', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId, name, email, profile } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findOneAndUpdate(
      { userId },
      { $set: { name, email, profile } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json(user);
  } catch (err: any) {
    console.error('[VESTA] POST /api/user error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// PUT /api/user/:userId
userRouter.put('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { new: true }
    ).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (err: any) {
    console.error('[VESTA] PUT /api/user error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
