export interface OutfitReasoning {
  outfitId: string;
  summary: string;
  weatherReason: string;
  colorReason: string;
  dressCodeReason: string;
  occasionReason: string;
  stylistTip: string;
}

export interface StyleRequestItem {
  name: string;
  category: string;
  color: string;
  warmthLevel: number;
  formalityLevel: number;
}

export interface StyleRequestOutfit {
  id: string;
  name: string;
  items: StyleRequestItem[];
  scores: {
    overall: number;
    weather: number;
    dressCode: number;
    colorHarmony: number;
    occasion: number;
  };
}

export interface StyleRequestBody {
  weather: {
    city: string;
    temperature: number;
    feelsLike?: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  preferences: {
    occasion: string;
    dressCode: string;
    stylePreference: string;
    colorPreference: string;
  };
  outfits: StyleRequestOutfit[];
}

export interface StyleResponseBody {
  outfits: OutfitReasoning[];
  source?: 'ai' | 'fallback';
}
