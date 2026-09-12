import mongoose from 'mongoose';
import dns from 'dns';

// Ensure SRV records can be resolved reliably across ISPs / local DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if not permitted
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[VESTA DB] MONGODB_URI is not set — database features will be unavailable.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✦ VESTA MongoDB connected successfully.');

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[VESTA DB] MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[VESTA DB] MongoDB reconnected.');
    });
  } catch (err: any) {
    isConnected = false;
    console.error('[VESTA DB] MongoDB connection failed:', err?.message || err);
    // Don't throw — allow server to boot without DB
  }
}

export function getDBStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
