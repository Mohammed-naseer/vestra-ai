import { WeatherData, Occasion, DressCode, StylePreference, ColorPreference, OutfitRecommendation, AIOutfitReasoning } from '../types';

export interface StyleAPIResponse {
  outfits: AIOutfitReasoning[];
  source?: 'ai' | 'fallback';
  error?: string;
}

/**
 * Sends candidate outfits and context to the secure backend POST /api/style.
 * Operates non-blockingly and returns AI reasoning or null if request fails.
 */
export async function fetchAIStylistReasoning(
  outfits: OutfitRecommendation[],
  weather: WeatherData,
  occasion: Occasion,
  dressCode: DressCode,
  stylePreference: StylePreference,
  colorPreference: ColorPreference
): Promise<Map<string, AIOutfitReasoning> | null> {
  try {
    const payload = {
      weather: {
        city: weather.city,
        temperature: Math.round(weather.temperature),
        feelsLike: Math.round(weather.apparentTemperature),
        humidity: Math.round(weather.humidity),
        windSpeed: Math.round(weather.windSpeed),
        condition: weather.conditionText,
      },
      preferences: {
        occasion,
        dressCode,
        stylePreference,
        colorPreference,
      },
      outfits: outfits.map(o => ({
        id: o.id,
        name: o.name,
        items: [
          {
            name: o.items.top.name,
            category: o.items.top.category,
            color: o.items.top.color,
            warmthLevel: o.items.top.warmthLevel,
            formalityLevel: o.items.top.formalityLevel,
          },
          {
            name: o.items.bottom.name,
            category: o.items.bottom.category,
            color: o.items.bottom.color,
            warmthLevel: o.items.bottom.warmthLevel,
            formalityLevel: o.items.bottom.formalityLevel,
          },
          {
            name: o.items.shoes.name,
            category: o.items.shoes.category,
            color: o.items.shoes.color,
            warmthLevel: o.items.shoes.warmthLevel,
            formalityLevel: o.items.shoes.formalityLevel,
          },
          ...(o.items.jacket ? [{
            name: o.items.jacket.name,
            category: o.items.jacket.category,
            color: o.items.jacket.color,
            warmthLevel: o.items.jacket.warmthLevel,
            formalityLevel: o.items.jacket.formalityLevel,
          }] : []),
        ],
        scores: {
          overall: o.scores.overall,
          weather: o.scores.weather,
          dressCode: o.scores.dressCode,
          colorHarmony: o.scores.colorHarmony,
          occasion: o.scores.occasion,
        },
      })),
    };

    const res = await fetch('/api/style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn(`[VESTA API] /api/style HTTP ${res.status}`);
      return null;
    }

    const data = (await res.json()) as StyleAPIResponse;

    if (data && Array.isArray(data.outfits) && data.outfits.length > 0) {
      const reasoningMap = new Map<string, AIOutfitReasoning>();
      data.outfits.forEach(o => {
        if (o.outfitId) {
          reasoningMap.set(o.outfitId, o);
        }
      });
      return reasoningMap;
    }

    return null;
  } catch (err) {
    console.warn('[VESTA Client] AI reasoning background request gracefully skipped:', err);
    return null;
  }
}
