import dotenv from 'dotenv';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
dotenv.config();

import mongoose from 'mongoose';
import { User } from './models/User.js';
import { WardrobeItem } from './models/WardrobeItem.js';
import { StylePreference } from './models/StylePreference.js';
import { SavedLook } from './models/SavedLook.js';
import { Trip } from './models/Trip.js';
import { INITIAL_WARDROBE } from '../src/data/defaultWardrobe.js';

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment');
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected! Seeding default data for demo-user...');

  // 1. User
  await User.findOneAndUpdate(
    { userId: 'demo-user' },
    {
      userId: 'demo-user',
      name: 'Mohammed Naseer',
      email: 'demo@vesta.luxury',
      profile: {
        clothingPreference: 'unisex',
        fit: 'tailored',
        style: 'classic',
        colorPalette: 'neutral',
      },
    },
    { upsert: true, new: true }
  );
  console.log('✔ User profile seeded');

  // 2. Style Preferences
  await StylePreference.findOneAndUpdate(
    { userId: 'demo-user' },
    {
      userId: 'demo-user',
      preferredStyles: ['classic', 'minimal', 'elegant'],
      preferredColors: ['neutral', 'dark', 'earth'],
      preferredOccasions: ['Dinner', 'Business', 'Cocktail', 'Smart Casual'],
      preferredDressCodes: ['Smart Casual', 'Formal', 'Elevated Casual'],
    },
    { upsert: true, new: true }
  );
  console.log('✔ Style Preferences seeded');

  // 3. Wardrobe Items
  let wardrobeCount = 0;
  for (const item of INITIAL_WARDROBE) {
    await WardrobeItem.findOneAndUpdate(
      { userId: 'demo-user', itemId: item.id },
      {
        userId: 'demo-user',
        itemId: item.id,
        name: item.name,
        category: item.category.toLowerCase(),
        color: item.color,
        colorHex: item.colorHex || '#888888',
        fabric: item.fabric,
        type: item.type,
        warmthLevel: item.warmthLevel,
        formalityLevel: item.formalityLevel,
        imageUrl: item.imageUrl,
        tags: item.tags || [],
      },
      { upsert: true, new: true }
    );
    wardrobeCount++;
  }
  console.log(`✔ Seeded ${wardrobeCount} wardrobe items`);

  // 4. Sample Saved Look
  await SavedLook.findOneAndUpdate(
    { userId: 'demo-user', outfitId: 'curated-look-1' },
    {
      userId: 'demo-user',
      outfitId: 'curated-look-1',
      name: 'The Milanese Evening Ensemble',
      items: {
        top: INITIAL_WARDROBE.find((i) => i.id === 'top-2'),
        bottom: INITIAL_WARDROBE.find((i) => i.id === 'bottom-1'),
        outerwear: INITIAL_WARDROBE.find((i) => i.id === 'outer-1'),
        shoes: INITIAL_WARDROBE.find((i) => i.id === 'shoes-1'),
      },
      scores: { overall: 96, weather: 98, formality: 95, colorHarmony: 96 },
      occasion: 'Dinner',
      dressCode: 'Smart Casual',
      weather: { temperature: 24, condition: 'Clear', city: 'Hyderabad' },
      colorPalette: ['Camel Beige', 'Charcoal Wool', 'Espresso'],
      aiReasoning: {
        summary: 'A refined neutral palette pairing Italian tailored trousers with a double-breasted overcoat and cashmere knit.',
        whyItWorks: 'The warmth-to-breathability ratio matches evening dining conditions with effortless luxury.',
      },
      rating: 5,
      savedAt: new Date().toISOString(),
    },
    { upsert: true, new: true }
  );
  console.log('✔ Curated Saved Look seeded');

  // 5. Sample Trip Plan
  await Trip.findOneAndUpdate(
    { userId: 'demo-user', tripId: 'trip-demo-milan' },
    {
      userId: 'demo-user',
      tripId: 'trip-demo-milan',
      destination: 'Milan, Italy',
      days: 3,
      tripType: 'Fashion & Dining',
      schedule: [
        { day: 1, title: 'Arrival & Aperitivo in Brera', outfit: 'Italian Linen Oxford + Tailored Trousers' },
        { day: 2, title: 'Duomo & Galleria Vittorio Emanuele', outfit: 'Cashmere Knit + Double-Breasted Overcoat' },
        { day: 3, title: 'Private Dinner at Ristorante Cracco', outfit: 'Full Tailored Suit + Leather Loafers' },
      ],
      packingChecklist: {
        tops: 3,
        bottoms: 2,
        outerwear: 1,
        shoes: 2,
        accessories: 3,
      },
    },
    { upsert: true, new: true }
  );
  console.log('✔ Sample Trip seeded');

  const totalWardrobe = await WardrobeItem.countDocuments({ userId: 'demo-user' });
  const totalLooks = await SavedLook.countDocuments({ userId: 'demo-user' });
  const totalTrips = await Trip.countDocuments({ userId: 'demo-user' });

  console.log('\n=== MONGODB SEED SUMMARY ===');
  console.log('Total Wardrobe Items:', totalWardrobe);
  console.log('Total Saved Looks:', totalLooks);
  console.log('Total Trips:', totalTrips);
}

// Run standalone if invoked directly
if (import.meta.url.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
