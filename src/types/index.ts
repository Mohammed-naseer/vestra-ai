export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Jackets' | 'Accessories';

export type Occasion = 
  | 'College'
  | 'Casual'
  | 'Date'
  | 'Interview'
  | 'Party'
  | 'Wedding'
  | 'Travel'
  | 'Dinner'
  | 'Beach';

export type DressCode = 
  | 'Casual'
  | 'Smart Casual'
  | 'Business Casual'
  | 'Formal'
  | 'Traditional';

export type StylePreference = 
  | 'Minimal'
  | 'Classic'
  | 'Streetwear'
  | 'Elegant'
  | 'Trendy';

export type ColorPreference = 
  | 'Any'
  | 'Neutral'
  | 'Dark'
  | 'Bright'
  | 'Earth tones';

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  colorHex: string;
  type: string; // e.g., "Oxford Shirt", "Pleated Trousers", "Chelsea Boots"
  warmthLevel: number; // 1 (Ultra light / summer) to 5 (Heavy winter coat)
  formalityLevel: number; // 1 (Ultra casual streetwear) to 5 (Black tie / Gala)
  imageUrl: string;
  tags?: string[];
  fabric?: string;
  isCustomUpload?: boolean;
}

export interface WeatherData {
  city: string;
  country?: string;
  lat: number;
  lon: number;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  weatherThermal: 'Hot' | 'Warm' | 'Mild' | 'Cool' | 'Cold';
  stylingTip: string;
  isCustomLocation?: boolean;
}

export interface OutfitScores {
  overall: number;
  weather: number;
  dressCode: number;
  colorHarmony: number;
  occasion: number;
  stylePreference: number;
}

export interface RecommendationReasonPoints {
  weather: string;
  color: string;
  dressCode: string;
  occasion: string;
}

export interface AIOutfitReasoning {
  outfitId: string;
  summary: string;
  weatherReason: string;
  colorReason: string;
  dressCodeReason: string;
  occasionReason: string;
  stylistTip: string;
}

export interface OutfitRecommendation {
  id: string;
  name: string;
  items: {
    top: ClothingItem;
    bottom: ClothingItem;
    shoes: ClothingItem;
    jacket?: ClothingItem;
    accessories?: ClothingItem[];
  };
  palette: string[]; // hex codes for color palette display
  whyItWorks: string;
  reasonPoints: RecommendationReasonPoints;
  scores: OutfitScores;
  aiReasoning?: AIOutfitReasoning;
  rating?: number; // 1 to 5 stars
  savedAt?: string;
}

export interface TripPlanDay {
  dayNumber: number;
  activityTitle: string;
  vibe: string;
  outfit: OutfitRecommendation;
}

export interface TripPlan {
  id: string;
  destination: string;
  days: number;
  tripType: string;
  schedule: TripPlanDay[];
  packingChecklist: {
    tops: number;
    bottoms: number;
    shoes: number;
    jackets: number;
    accessories: number;
    uniquePieces: ClothingItem[];
  };
  createdAt: string;
}
