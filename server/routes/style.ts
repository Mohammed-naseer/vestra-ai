import { Router, Request, Response } from 'express';
import { StyleRequestBody } from '../types.js';
import { generateOutfitAIReasoning } from '../services/aiService.js';

export const styleRouter = Router();

// POST /api/style
styleRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as StyleRequestBody;

    // Validate request structure
    if (!body || !body.weather || !body.preferences || !Array.isArray(body.outfits)) {
      return res.status(400).json({
        error: 'Invalid request format. Required fields: weather, preferences, outfits array.',
      });
    }

    if (body.outfits.length === 0) {
      return res.status(400).json({
        error: 'At least one outfit candidate is required.',
      });
    }

    // Call isolated AI service
    const result = await generateOutfitAIReasoning(body);

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[VESTA API] /api/style unexpected error:', err?.message || err);
    // Never expose stack trace or raw 500 in a way that breaks client
    return res.status(200).json({
      outfits: [],
      source: 'fallback',
      error: 'Graceful recovery: stylist engine used.',
    });
  }
});
