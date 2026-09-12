import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config();

import { connectDB } from './config/db.js';
import { healthRouter } from './routes/health.js';
import { styleRouter } from './routes/style.js';
import { userRouter } from './routes/user.js';
import { wardrobeRouter } from './routes/wardrobe.js';
import { savedLooksRouter } from './routes/savedLooks.js';
import { styleProfileRouter } from './routes/styleProfile.js';
import { tripsRouter } from './routes/trips.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB (non-blocking — server boots regardless)
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow Vite frontend during development
}));
app.use(express.json({ limit: '2mb' })); // Slightly larger for trip/wardrobe payloads

// Existing routes (preserved, unchanged)
app.use('/api/health', healthRouter);
app.use('/api/style', styleRouter);

// New MongoDB-backed data routes
app.use('/api/user', userRouter);
app.use('/api/wardrobe', wardrobeRouter);
app.use('/api/saved-looks', savedLooksRouter);
app.use('/api/style-profile', styleProfileRouter);
app.use('/api/trips', tripsRouter);

// Global safe error handler - Never expose server stack traces to client
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[VESTA Server Error]:', err?.message || err);
  res.status(500).json({
    status: 'error',
    message: 'An internal error occurred. Please try again.',
  });
});

app.listen(PORT, () => {
  console.log(`✦ VESTA Backend API running on http://localhost:${PORT}`);
  console.log(`  - Health:        GET  http://localhost:${PORT}/api/health`);
  console.log(`  - Style AI:      POST http://localhost:${PORT}/api/style`);
  console.log(`  - User:          GET  http://localhost:${PORT}/api/user/:userId`);
  console.log(`  - Wardrobe:      GET  http://localhost:${PORT}/api/wardrobe/:userId`);
  console.log(`  - Saved Looks:   GET  http://localhost:${PORT}/api/saved-looks/:userId`);
  console.log(`  - Style Profile: GET  http://localhost:${PORT}/api/style-profile/:userId`);
  console.log(`  - Trips:         GET  http://localhost:${PORT}/api/trips/:userId`);
});

