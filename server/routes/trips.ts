import { Router, Request, Response } from 'express';
import { Trip } from '../models/Trip.js';
import { getDBStatus } from '../config/db.js';

export const tripsRouter = Router();

// GET /api/trips/:userId
tripsRouter.get('/:userId', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(trips);
  } catch (err: any) {
    console.error('[VESTA] GET /api/trips error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// POST /api/trips — upsert by userId+tripId
tripsRouter.post('/', async (req: Request, res: Response) => {
  if (getDBStatus() !== 'connected') {
    return res.status(503).json({ error: 'Database unavailable' });
  }
  try {
    const { userId, tripId, destination, days } = req.body;
    if (!userId || !tripId || !destination || !days) {
      return res.status(400).json({ error: 'userId, tripId, destination, and days are required' });
    }

    const trip = await Trip.findOneAndUpdate(
      { userId, tripId },
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(201).json(trip);
  } catch (err: any) {
    console.error('[VESTA] POST /api/trips error:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
});
