/**
 * VESTA — MongoDB API Service Layer
 *
 * All operations have graceful LocalStorage fallback.
 * MongoDB connection errors are silently handled — the app always works.
 */

import type { ClothingItem, Category, OutfitRecommendation, TripPlan } from '../types';

// ─── Constants ──────────────────────────────────────────────────────────────

export const DEMO_USER_ID = 'demo-user';
const API_BASE = '/api';

// LocalStorage keys (kept in sync as fallback)
const LS_WARDROBE = 'vesta_wardrobe_v1';
const LS_SAVED_OUTFITS = 'vesta_saved_outfits_v1';
const LS_TRIP_PLANS = 'vesta_trip_plans_v1';
const LS_STYLE_PROFILE = 'vesta_style_profile_v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DBStatus = 'synced' | 'offline' | 'checking';

export interface StyleProfileData {
  preferredStyles: string[];
  preferredColors: string[];
  preferredOccasions: string[];
  preferredDressCodes: string[];
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  timeoutMs = 5000
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      // 404 is a "not found" — return null, not an error
      if (res.status === 404) return null;
      console.warn(`[VESTA API] ${options?.method || 'GET'} ${path} → HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name !== 'AbortError') {
      console.warn(`[VESTA API] ${path} unreachable — using LocalStorage fallback.`);
    }
    return null;
  }
}

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded — silently skip
  }
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<DBStatus> {
  const result = await apiFetch<{ status: string; database: string }>('/health');
  if (!result) return 'offline';
  return result.database === 'connected' ? 'synced' : 'offline';
}

// ─── User / Demo Initialization ──────────────────────────────────────────────

export async function initDemoUser(): Promise<void> {
  await apiFetch(`/user`, {
    method: 'POST',
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      name: 'VESTA Demo',
    }),
  });
}

// ─── Wardrobe ────────────────────────────────────────────────────────────────

export async function getWardrobe(): Promise<ClothingItem[] | null> {
  const result = await apiFetch<any[]>(`/wardrobe/${DEMO_USER_ID}`);
  if (!result) return null;

  // Helper to normalize category casing (e.g. 'tops' -> 'Tops')
  const normalizeCategory = (cat: string): Category => {
    if (!cat) return 'Tops';
    const lower = cat.toLowerCase();
    if (lower === 'tops') return 'Tops';
    if (lower === 'bottoms') return 'Bottoms';
    if (lower === 'shoes') return 'Shoes';
    if (lower === 'jackets') return 'Jackets';
    if (lower === 'accessories') return 'Accessories';
    return (cat.charAt(0).toUpperCase() + cat.slice(1)) as Category;
  };

  // Map DB documents back to ClothingItem shape
  return result.map((doc) => ({
    id: doc.itemId || doc._id,
    name: doc.name,
    category: normalizeCategory(doc.category),
    color: doc.color || '',
    colorHex: doc.colorHex || '#888888',
    type: doc.type || doc.subcategory || '',
    warmthLevel: doc.warmthLevel ?? 2,
    formalityLevel: doc.formalityLevel ?? 2,
    imageUrl: doc.imageUrl || '',
    tags: doc.tags || [],
    fabric: doc.fabric,
    isCustomUpload: doc.isCustomUpload || false,
  }));
}

export async function addWardrobeItem(item: ClothingItem): Promise<boolean> {
  const result = await apiFetch(`/wardrobe`, {
    method: 'POST',
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      itemId: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      colorHex: item.colorHex,
      type: item.type,
      warmthLevel: item.warmthLevel,
      formalityLevel: item.formalityLevel,
      imageUrl: item.imageUrl,
      tags: item.tags || [],
      fabric: item.fabric,
      isCustomUpload: item.isCustomUpload || false,
    }),
  });
  return result !== null;
}

export async function deleteWardrobeItem(itemId: string): Promise<boolean> {
  const result = await apiFetch(`/wardrobe/${itemId}?userId=${DEMO_USER_ID}`, {
    method: 'DELETE',
  });
  return result !== null;
}

/**
 * Seeds wardrobe to MongoDB if DB is empty but LocalStorage has items.
 * Returns the canonical wardrobe to use (DB or LS).
 */
export async function syncWardrobeToDB(localWardrobe: ClothingItem[]): Promise<{
  wardrobe: ClothingItem[];
  synced: boolean;
}> {
  const dbWardrobe = await getWardrobe();

  if (dbWardrobe === null) {
    // DB unavailable — use local
    return { wardrobe: lsGet<ClothingItem[]>(LS_WARDROBE, localWardrobe), synced: false };
  }

  if (dbWardrobe.length > 0) {
    // DB has data — use it as source of truth, update LocalStorage
    lsSet(LS_WARDROBE, dbWardrobe);
    return { wardrobe: dbWardrobe, synced: true };
  }

  // DB is empty — seed from LocalStorage (one-time migration)
  if (localWardrobe.length > 0) {
    console.log(`[VESTA] Seeding ${localWardrobe.length} wardrobe items to MongoDB...`);
    await Promise.all(localWardrobe.map((item) => addWardrobeItem(item)));
    return { wardrobe: localWardrobe, synced: true };
  }

  return { wardrobe: [], synced: true };
}

// ─── Saved Looks ─────────────────────────────────────────────────────────────

export async function getSavedLooks(): Promise<OutfitRecommendation[] | null> {
  const result = await apiFetch<any[]>(`/saved-looks/${DEMO_USER_ID}`);
  if (!result) return null;

  // Reconstruct OutfitRecommendation from DB doc
  return result.map((doc) => ({
    id: doc.outfitId || doc._id,
    name: doc.name,
    items: doc.items || {},
    palette: doc.colorPalette || [],
    whyItWorks: doc.items?.whyItWorks || '',
    reasonPoints: doc.items?.reasonPoints || {},
    scores: doc.scores || {},
    aiReasoning: doc.aiReasoning,
    rating: doc.rating ?? 5,
    savedAt: doc.savedAt || doc.createdAt,
  }));
}

export async function saveLook(outfit: OutfitRecommendation): Promise<boolean> {
  const result = await apiFetch(`/saved-looks`, {
    method: 'POST',
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      outfitId: outfit.id,
      name: outfit.name,
      items: outfit.items,
      scores: outfit.scores,
      colorPalette: outfit.palette || [],
      aiReasoning: outfit.aiReasoning || null,
      rating: outfit.rating ?? 5,
      savedAt: outfit.savedAt || new Date().toISOString(),
    }),
  });
  return result !== null;
}

export async function updateLook(
  outfitId: string,
  updates: Partial<OutfitRecommendation>
): Promise<boolean> {
  const result = await apiFetch(`/saved-looks/${outfitId}`, {
    method: 'PUT',
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      ...updates,
      rating: updates.rating,
    }),
  });
  return result !== null;
}

export async function deleteLook(outfitId: string): Promise<boolean> {
  const result = await apiFetch(`/saved-looks/${outfitId}?userId=${DEMO_USER_ID}`, {
    method: 'DELETE',
  });
  return result !== null;
}

// ─── Style Profile ────────────────────────────────────────────────────────────

export async function getStyleProfile(): Promise<StyleProfileData | null> {
  const result = await apiFetch<StyleProfileData>(`/style-profile/${DEMO_USER_ID}`);
  return result;
}

export async function updateStyleProfile(data: StyleProfileData): Promise<boolean> {
  // Always persist to LocalStorage immediately
  lsSet(LS_STYLE_PROFILE, data);

  const result = await apiFetch(`/style-profile/${DEMO_USER_ID}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result !== null;
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function getTrips(): Promise<TripPlan[] | null> {
  const result = await apiFetch<any[]>(`/trips/${DEMO_USER_ID}`);
  if (!result) return null;

  return result.map((doc) => ({
    id: doc.tripId || doc._id,
    destination: doc.destination,
    days: doc.days,
    tripType: doc.tripType || 'leisure',
    schedule: doc.schedule || [],
    packingChecklist: doc.packingChecklist || {},
    createdAt: doc.createdAt || new Date().toISOString(),
  }));
}

export async function saveTrip(plan: TripPlan): Promise<boolean> {
  // Always persist to LocalStorage immediately
  const localTrips = lsGet<TripPlan[]>(LS_TRIP_PLANS, []);
  const existing = localTrips.findIndex((t) => t.id === plan.id);
  if (existing === -1) {
    lsSet(LS_TRIP_PLANS, [plan, ...localTrips]);
  }

  const result = await apiFetch(`/trips`, {
    method: 'POST',
    body: JSON.stringify({
      userId: DEMO_USER_ID,
      tripId: plan.id,
      destination: plan.destination,
      days: plan.days,
      tripType: plan.tripType,
      schedule: plan.schedule,
      packingChecklist: plan.packingChecklist,
    }),
  });
  return result !== null;
}
