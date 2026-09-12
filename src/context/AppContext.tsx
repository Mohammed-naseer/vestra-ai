import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ClothingItem, WeatherData, OutfitRecommendation, TripPlan } from '../types';
import { INITIAL_WARDROBE } from '../data/defaultWardrobe';
import { fetchLiveWeather, PRESET_CITIES } from '../services/weatherService';
import {
  DBStatus,
  checkHealth,
  initDemoUser,
  syncWardrobeToDB,
  addWardrobeItem,
  deleteWardrobeItem,
  getSavedLooks,
  saveLook,
  updateLook,
  deleteLook,
  getTrips,
  saveTrip,
} from '../services/api';

interface AppContextType {
  wardrobe: ClothingItem[];
  savedOutfits: OutfitRecommendation[];
  weather: WeatherData | null;
  loadingWeather: boolean;
  activeTab: 'style' | 'wardrobe' | 'saved' | 'trips';
  dbStatus: DBStatus;
  setActiveTab: (tab: 'style' | 'wardrobe' | 'saved' | 'trips') => void;
  addItemToWardrobe: (item: Omit<ClothingItem, 'id'>) => void;
  removeItemFromWardrobe: (id: string) => void;
  resetToDemoWardrobe: () => void;
  saveOutfit: (outfit: OutfitRecommendation) => void;
  removeSavedOutfit: (id: string) => void;
  rateSavedOutfit: (id: string, rating: number) => void;
  setCityWeather: (city: string, country?: string, lat?: number, lon?: number) => Promise<void>;
  useCurrentLocationWeather: () => Promise<void>;
  tripPlans: TripPlan[];
  saveTripPlan: (plan: TripPlan) => void;
  deleteTripPlan: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const WARDROBE_STORAGE_KEY = 'vesta_wardrobe_v1';
const SAVED_OUTFITS_STORAGE_KEY = 'vesta_saved_outfits_v1';
const TRIP_PLANS_STORAGE_KEY = 'vesta_trip_plans_v1';
const CITY_STORAGE_KEY = 'vesta_active_city_v1';

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'style' | 'wardrobe' | 'saved' | 'trips'>('style');
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [dbStatus, setDbStatus] = useState<DBStatus>('checking');

  // Initialize wardrobe with localStorage or seed data
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(() =>
    lsGet<ClothingItem[]>(WARDROBE_STORAGE_KEY, INITIAL_WARDROBE)
  );

  // Saved outfits
  const [savedOutfits, setSavedOutfits] = useState<OutfitRecommendation[]>(() =>
    lsGet<OutfitRecommendation[]>(SAVED_OUTFITS_STORAGE_KEY, [])
  );

  // Trip plans
  const [tripPlans, setTripPlans] = useState<TripPlan[]>(() =>
    lsGet<TripPlan[]>(TRIP_PLANS_STORAGE_KEY, [])
  );

  // ── LocalStorage Sync Effects (always runs as dual-write fallback) ─────────
  useEffect(() => { lsSet(WARDROBE_STORAGE_KEY, wardrobe); }, [wardrobe]);
  useEffect(() => { lsSet(SAVED_OUTFITS_STORAGE_KEY, savedOutfits); }, [savedOutfits]);
  useEffect(() => { lsSet(TRIP_PLANS_STORAGE_KEY, tripPlans); }, [tripPlans]);

  // ── MongoDB Startup Sync ──────────────────────────────────────────────────
  useEffect(() => {
    const syncFromDB = async () => {
      // 1. Ensure demo user exists in DB
      await initDemoUser();

      // 2. Sync wardrobe (DB → LS or LS → DB seed)
      const localWardrobeSnapshot = lsGet<ClothingItem[]>(WARDROBE_STORAGE_KEY, INITIAL_WARDROBE);
      const { wardrobe: syncedWardrobe, synced } = await syncWardrobeToDB(localWardrobeSnapshot);
      if (synced) {
        setWardrobe(syncedWardrobe);
        setDbStatus('synced');
      } else {
        setDbStatus('offline');
      }

      // 3. Load saved looks from DB (prefer over LocalStorage)
      const dbLooks = await getSavedLooks();
      if (dbLooks !== null && dbLooks.length > 0) {
        setSavedOutfits(dbLooks);
      }

      // 4. Load trips from DB (prefer over LocalStorage)
      const dbTrips = await getTrips();
      if (dbTrips !== null && dbTrips.length > 0) {
        setTripPlans(dbTrips);
      }

      // 5. Final authoritative health check
      const status = await checkHealth();
      setDbStatus(status);
    };

    syncFromDB();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Weather ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const initWeather = async () => {
      setLoadingWeather(true);
      try {
        const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
        const preset =
          PRESET_CITIES.find(
            (c) => c.city.toLowerCase() === (savedCity || 'milan').toLowerCase()
          ) || PRESET_CITIES[0];
        const data = await fetchLiveWeather(preset.lat, preset.lon, preset.city, preset.country);
        setWeather(data);
      } catch (err) {
        console.error('Initial weather fetch error:', err);
      } finally {
        setLoadingWeather(false);
      }
    };
    initWeather();
  }, []);

  const setCityWeather = async (
    cityName: string,
    countryName?: string,
    lat?: number,
    lon?: number
  ) => {
    setLoadingWeather(true);
    try {
      let finalLat = lat;
      let finalLon = lon;
      if (finalLat === undefined || finalLon === undefined) {
        const found = PRESET_CITIES.find((c) => c.city.toLowerCase() === cityName.toLowerCase());
        if (found) {
          finalLat = found.lat;
          finalLon = found.lon;
          countryName = found.country;
        } else {
          finalLat = 45.4642; // Milan fallback
          finalLon = 9.19;
        }
      }
      const data = await fetchLiveWeather(finalLat, finalLon, cityName, countryName);
      setWeather(data);
      localStorage.setItem(CITY_STORAGE_KEY, cityName);
    } finally {
      setLoadingWeather(false);
    }
  };

  const useCurrentLocationWeather = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const data = await fetchLiveWeather(lat, lon, 'Local Weather', 'Current Location');
        setWeather({ ...data, isCustomLocation: true });
        setLoadingWeather(false);
      },
      (err) => {
        console.warn('Geolocation denied/failed:', err);
        setLoadingWeather(false);
        alert('Could not access current location. Please choose a city from the list.');
      },
      { timeout: 8000 }
    );
  };

  // ── Wardrobe ──────────────────────────────────────────────────────────────

  const addItemToWardrobe = useCallback((itemData: Omit<ClothingItem, 'id'>) => {
    const newItem: ClothingItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustomUpload: true,
    };
    setWardrobe((prev) => [newItem, ...prev]);
    // Fire-and-forget DB sync
    addWardrobeItem(newItem).then((ok) => {
      if (!ok) setDbStatus('offline');
    });
  }, []);

  const removeItemFromWardrobe = useCallback((id: string) => {
    setWardrobe((prev) => prev.filter((i) => i.id !== id));
    deleteWardrobeItem(id).then((ok) => {
      if (!ok) setDbStatus('offline');
    });
  }, []);

  const resetToDemoWardrobe = useCallback(() => {
    setWardrobe(INITIAL_WARDROBE);
    lsSet(WARDROBE_STORAGE_KEY, INITIAL_WARDROBE);
    // Re-seed DB with demo capsule (upsert-safe)
    INITIAL_WARDROBE.forEach((item) => addWardrobeItem(item));
  }, []);

  // ── Saved Looks ───────────────────────────────────────────────────────────

  const saveOutfit = useCallback((outfit: OutfitRecommendation) => {
    setSavedOutfits((prev) => {
      const exists = prev.some((o) => o.id === outfit.id);
      if (exists) return prev;
      const enriched = {
        ...outfit,
        savedAt: new Date().toISOString(),
        rating: outfit.rating || 5,
      };
      // Fire-and-forget DB sync
      saveLook(enriched).then((ok) => {
        if (!ok) setDbStatus('offline');
      });
      return [enriched, ...prev];
    });
  }, []);

  const removeSavedOutfit = useCallback((id: string) => {
    setSavedOutfits((prev) => prev.filter((o) => o.id !== id));
    deleteLook(id).then((ok) => {
      if (!ok) setDbStatus('offline');
    });
  }, []);

  const rateSavedOutfit = useCallback((id: string, rating: number) => {
    setSavedOutfits((prev) => prev.map((o) => (o.id === id ? { ...o, rating } : o)));
    updateLook(id, { rating } as Partial<OutfitRecommendation>).then((ok) => {
      if (!ok) setDbStatus('offline');
    });
  }, []);

  // ── Trips ─────────────────────────────────────────────────────────────────

  const saveTripPlan = useCallback((plan: TripPlan) => {
    setTripPlans((prev) => [plan, ...prev]);
    saveTrip(plan).then((ok) => {
      if (!ok) setDbStatus('offline');
    });
  }, []);

  const deleteTripPlan = useCallback((id: string) => {
    setTripPlans((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        wardrobe,
        savedOutfits,
        weather,
        loadingWeather,
        activeTab,
        dbStatus,
        setActiveTab,
        addItemToWardrobe,
        removeItemFromWardrobe,
        resetToDemoWardrobe,
        saveOutfit,
        removeSavedOutfit,
        rateSavedOutfit,
        setCityWeather,
        useCurrentLocationWeather,
        tripPlans,
        saveTripPlan,
        deleteTripPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
