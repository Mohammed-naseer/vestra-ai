import { ClothingItem, Occasion, DressCode, StylePreference, ColorPreference, WeatherData, OutfitRecommendation, OutfitScores, RecommendationReasonPoints } from '../types';

// Map DressCode to expected formality score target (1 to 5)
const DRESS_CODE_TARGETS: Record<DressCode, number> = {
  'Casual': 1.5,
  'Smart Casual': 2.8,
  'Business Casual': 3.6,
  'Formal': 4.6,
  'Traditional': 4.2,
};

// Map Occasion to ideal formality and silhouette expectations
const OCCASION_FORMALITY: Record<Occasion, { target: number; priority: string }> = {
  'College': { target: 1.6, priority: 'effortless comfort, durability, and practical everyday movement' },
  'Casual': { target: 1.5, priority: 'relaxed weekend ease with clean understated lines' },
  'Date': { target: 3.2, priority: 'refined charm, alluring textures, and flattering tailored structure' },
  'Interview': { target: 4.4, priority: 'executive poise, crisp professionalism, and confident authority' },
  'Party': { target: 3.2, priority: 'magnetic contemporary presence, statement accents, and nocturnal flair' },
  'Wedding': { target: 4.8, priority: 'ceremonial grandeur, impeccable tailoring, and elevated high-fashion decorum' },
  'Travel': { target: 1.8, priority: 'thermal adaptability, wrinkle-resistant movement, and transit ease' },
  'Dinner': { target: 3.5, priority: 'sophisticated evening ambiance without feeling overly stiff or overdressed' },
  'Beach': { target: 1.2, priority: 'sun-soaked coastal ease, ultra-breathable linen, and airy mobility' },
};

// Map StylePreference to item tag affinity
const STYLE_AFFINITY_KEYWORDS: Record<StylePreference, string[]> = {
  'Minimal': ['minimal', 'clean', 'breathable', 'versatile', 'simple'],
  'Classic': ['classic', 'tailored', 'sartorial', 'luxury', 'executive', 'oxford'],
  'Streetwear': ['streetwear', 'raw', 'denim', 'casual', 'boots', 'oversized'],
  'Elegant': ['formal', 'elegant', 'tailored', 'cashmere', 'silk', 'bespoke'],
  'Trendy': ['trendy', 'date', 'summer', 'vacation', 'elevated', 'chic'],
};

// Color compatibility evaluation
export function evaluateColorHarmony(colors: string[], colorPref: ColorPreference): { score: number; rationale: string } {
  const lowerColors = colors.map(c => c.toLowerCase());
  const hasBlack = lowerColors.some(c => c.includes('black') || c.includes('obsidian'));
  const hasWhite = lowerColors.some(c => c.includes('white') || c.includes('cream'));
  const hasNavy = lowerColors.some(c => c.includes('navy') || c.includes('blue') || c.includes('indigo'));
  const hasBeige = lowerColors.some(c => c.includes('beige') || c.includes('sand') || c.includes('tan') || c.includes('camel'));
  const hasGrey = lowerColors.some(c => c.includes('grey') || c.includes('gray') || c.includes('charcoal') || c.includes('silver'));
  const hasOlive = lowerColors.some(c => c.includes('olive') || c.includes('sage') || c.includes('green'));
  const hasBrown = lowerColors.some(c => c.includes('brown') || c.includes('cognac') || c.includes('tobacco'));

  let score = 88;
  let rationale = 'Balanced multi-tone harmony maintaining clean visual contrast and versatility.';

  if (hasNavy && (hasWhite || hasBeige)) {
    score = 98;
    rationale = 'Navy and neutral sand/white create timeless nautical contrast with clean visual lines.';
  } else if (hasBlack && hasWhite) {
    score = 97;
    rationale = 'Monochrome black and white produces high-contrast, razor-sharp architectural minimalism.';
  } else if (hasBeige && (hasBrown || hasOlive)) {
    score = 96;
    rationale = 'Earth-tone synergy: warm tobacco and foliage olive establish rich quiet-luxury cohesion.';
  } else if (hasNavy && hasGrey) {
    score = 95;
    rationale = 'Subtle slate grey and deep navy lend understated executive sophistication.';
  } else if (hasBlack && (hasBeige || hasBrown || hasGrey)) {
    score = 94;
    rationale = 'Dark architectural foundation grounded with warm neutral highlights.';
  }

  // Bonus/penalty based on user's selected Color Preference
  if (colorPref === 'Neutral') {
    if ((hasWhite || hasBeige || hasGrey) && !hasOlive) {
      score = Math.min(100, score + 3);
      rationale += ' Aligns smoothly with your neutral color preference.';
    }
  } else if (colorPref === 'Dark') {
    if (hasBlack || hasNavy) {
      score = Math.min(100, score + 3);
      rationale += ' Seamlessly embraces your dark palette preference.';
    }
  } else if (colorPref === 'Earth tones') {
    if (hasBeige || hasBrown || hasOlive) {
      score = Math.min(100, score + 4);
      rationale += ' Perfectly embodies your curated earth-tone aesthetic.';
    }
  } else if (colorPref === 'Bright') {
    score = Math.max(82, score - 2); // Wardrobe is luxury muted, adjust gently
  }

  return { score, rationale };
}

// Compute individual outfit candidate
export function scoreOutfitCandidate(
  top: ClothingItem,
  bottom: ClothingItem,
  shoes: ClothingItem,
  jacket: ClothingItem | undefined,
  acc: ClothingItem | undefined,
  weather: WeatherData,
  occasion: Occasion,
  dressCode: DressCode,
  stylePref: StylePreference,
  colorPref: ColorPreference
): { scores: OutfitScores; reasonPoints: RecommendationReasonPoints; whyItWorks: string } {
  const activeItems = [top, bottom, shoes, jacket, acc].filter(Boolean) as ClothingItem[];

  // 1. Weather Fit (Weight: 25%)
  // Thermal targets: 30°C+ -> 1.2, 20°C -> 2.2, 14°C -> 3.2, <10°C -> 4.5
  let targetWarmth = 2.5;
  if (weather.temperature >= 28) targetWarmth = 1.3;
  else if (weather.temperature >= 22) targetWarmth = 2.0;
  else if (weather.temperature >= 15) targetWarmth = 3.0;
  else if (weather.temperature >= 8) targetWarmth = 4.0;
  else targetWarmth = 4.8;

  const avgWarmth = jacket 
    ? (top.warmthLevel * 0.35 + bottom.warmthLevel * 0.25 + jacket.warmthLevel * 0.40)
    : (top.warmthLevel * 0.55 + bottom.warmthLevel * 0.45);
  
  const warmthDelta = Math.abs(avgWarmth - targetWarmth);
  let weatherScore = Math.max(55, Math.min(100, Math.round(99 - warmthDelta * 18)));

  // Strict climate realities
  if (weather.temperature <= 14 && !jacket) {
    weatherScore = Math.max(45, weatherScore - 26);
  }
  if (weather.temperature >= 26 && jacket && jacket.warmthLevel >= 3) {
    weatherScore = Math.max(45, weatherScore - 30);
  }
  if (weather.temperature >= 28 && (top.warmthLevel >= 4 || bottom.warmthLevel >= 4)) {
    weatherScore = Math.max(40, weatherScore - 25);
  }

  // 2. Dress Code Fit (Weight: 25%)
  const targetFormality = DRESS_CODE_TARGETS[dressCode];
  const itemsFormality = (top.formalityLevel + bottom.formalityLevel + shoes.formalityLevel + (jacket ? jacket.formalityLevel : bottom.formalityLevel)) / (jacket ? 4 : 3);
  const formalityDelta = Math.abs(itemsFormality - targetFormality);
  let dressCodeScore = Math.max(50, Math.min(100, Math.round(99 - formalityDelta * 18)));

  if (dressCode === 'Formal') {
    if (shoes.formalityLevel < 3) {
      dressCodeScore = Math.max(45, dressCodeScore - 28); // Sneakers in Formal is heavily penalized
    }
    if (top.formalityLevel < 2) {
      dressCodeScore = Math.max(40, dressCodeScore - 30); // T-Shirt in Formal is penalized
    }
    if (itemsFormality < 3.2) {
      dressCodeScore = Math.max(45, dressCodeScore - 22);
    }
  }
  if (dressCode === 'Casual' && itemsFormality > 3.8) {
    dressCodeScore = Math.max(55, dressCodeScore - 18);
  }

  // 3. Occasion Fit (Weight: 20%)
  const occMeta = OCCASION_FORMALITY[occasion];
  const occasionDelta = Math.abs(itemsFormality - occMeta.target);
  let occasionScore = Math.max(55, Math.min(100, Math.round(98 - occasionDelta * 15)));

  if (occasion === 'Wedding') {
    if (dressCode === 'Formal' && itemsFormality >= 3.4) {
      occasionScore = 98;
    }
    if (shoes.formalityLevel < 3) {
      occasionScore = Math.max(45, occasionScore - 25);
    }
  }
  if (occasion === 'Interview') {
    if (itemsFormality >= 3.3 && shoes.formalityLevel >= 3) {
      occasionScore = Math.min(100, occasionScore + 6);
    }
    if (shoes.formalityLevel < 3) {
      occasionScore = Math.max(48, occasionScore - 24);
    }
  }
  if (occasion === 'Beach') {
    if (top.warmthLevel <= 2 && bottom.warmthLevel <= 2 && !jacket) {
      occasionScore = Math.min(100, occasionScore + 5);
    }
    if (jacket) {
      occasionScore = Math.max(45, occasionScore - 30);
    }
  }
  if (occasion === 'Travel' && shoes.type.includes('Sneakers')) {
    occasionScore = Math.min(100, occasionScore + 6);
  }

  // 4. Color Harmony (Weight: 20%)
  const itemColors = activeItems.map(i => i.color);
  const { score: colorScore, rationale: colorRationale } = evaluateColorHarmony(itemColors, colorPref);

  // 5. Style Preference (Weight: 10%)
  const targetKeywords = STYLE_AFFINITY_KEYWORDS[stylePref] || [];
  let styleMatches = 0;
  activeItems.forEach(item => {
    const text = `${item.name} ${item.type} ${(item.tags || []).join(' ')}`.toLowerCase();
    if (targetKeywords.some(kw => text.includes(kw))) {
      styleMatches += 1;
    }
  });
  let stylePreferenceScore = Math.min(100, 75 + styleMatches * 8);

  // Exact Transparent Scoring Model:
  // Weather Fit: 25% | Dress Code Fit: 25% | Occasion Fit: 20% | Color Harmony: 20% | Style Preference: 10%
  const overall = Math.round(
    (weatherScore * 0.25) +
    (dressCodeScore * 0.25) +
    (occasionScore * 0.20) +
    (colorScore * 0.20) +
    (stylePreferenceScore * 0.10)
  );

  // Dynamic Stylist Reasoning Generation based on specific inputs
  let weatherReason = '';
  if (weather.temperature >= 27) {
    weatherReason = `At ${weather.temperature}°C, lightweight ${top.fabric || 'breathable fabrics'} ensure effortless ventilation while avoiding thermal distress.`;
  } else if (weather.temperature <= 14) {
    weatherReason = `With ${weather.temperature}°C chill, ${jacket ? jacket.name : 'layering'} provides thermal shielding without bulk.`;
  } else {
    weatherReason = `The ${weather.temperature}°C ambient climate is harmoniously answered by versatile transitional layers.`;
  }

  const dressCodeReason = `${top.type} paired with ${bottom.type} and ${shoes.type} cleanly satisfies ${dressCode} expectations.`;
  const occasionReason = `Engineered for ${occasion.toLowerCase()}: delivers ${occMeta.priority}.`;

  const whyItWorks = `At ${weather.temperature}°C, VESTA paired the ${top.color.toLowerCase()} ${top.type} with ${bottom.color.toLowerCase()} ${bottom.type} to keep the silhouette polished for ${occasion.toLowerCase()} without feeling overdressed.`;

  return {
    scores: {
      overall,
      weather: weatherScore,
      dressCode: dressCodeScore,
      colorHarmony: colorScore,
      occasion: occasionScore,
      stylePreference: stylePreferenceScore,
    },
    reasonPoints: {
      weather: weatherReason,
      color: colorRationale,
      dressCode: dressCodeReason,
      occasion: occasionReason,
    },
    whyItWorks,
  };
}

// Editorial Name Generation
function generateEditorialName(occasion: Occasion, style: StylePreference, top: ClothingItem, jacket?: ClothingItem): string {
  const prefixes: Record<StylePreference, string[]> = {
    'Minimal': ['Nordic Minimalist', 'The Monolith', 'Quiet Luxury', 'Architectural Ease', 'Clean Lines'],
    'Classic': ['Heritage Sartorial', 'The Gentleman', 'Metropolitan Classic', 'Savile Silhouette', 'Bespoke Spirit'],
    'Streetwear': ['Urban Pulse', 'SoHo Contemporary', 'High-Street Atelier', 'Subversive Casual', 'Downtown Drift'],
    'Elegant': ['Riviera Sovereign', 'Nocturne Elegance', 'The Diplomat', 'Golden Hour Grandeur', 'St. Moritz Chic'],
    'Trendy': ['Atelier Neo', 'Curated Wave', 'Avant-Garde Sharp', 'Post-Modern Luxe', 'The Tastemaker'],
  };

  const list = prefixes[style] || prefixes['Classic'];
  const base = list[Math.floor(Math.random() * list.length)];
  return `${base} · ${occasion}`;
}

export function generateOutfitRecommendations(
  wardrobe: ClothingItem[],
  weather: WeatherData,
  occasion: Occasion,
  dressCode: DressCode,
  stylePref: StylePreference,
  colorPref: ColorPreference,
  count: number = 3
): OutfitRecommendation[] {
  const tops = wardrobe.filter(i => i.category === 'Tops');
  const bottoms = wardrobe.filter(i => i.category === 'Bottoms');
  const shoes = wardrobe.filter(i => i.category === 'Shoes');
  const jackets = wardrobe.filter(i => i.category === 'Jackets');
  const accessories = wardrobe.filter(i => i.category === 'Accessories');

  const safeTops = tops.length ? tops : wardrobe;
  const safeBottoms = bottoms.length ? bottoms : wardrobe;
  const safeShoes = shoes.length ? shoes : wardrobe;

  const candidates: OutfitRecommendation[] = [];

  for (const top of safeTops) {
    for (const bottom of safeBottoms) {
      for (const shoe of safeShoes) {
        // Evaluate with and without jacket
        const needsJacket = weather.temperature < 20 || dressCode === 'Formal' || dressCode === 'Business Casual';
        const possibleJackets = needsJacket && jackets.length ? [undefined, ...jackets] : [undefined];

        for (const jacket of possibleJackets) {
          const acc = accessories.length ? accessories[Math.floor(Math.random() * accessories.length)] : undefined;
          
          const { scores, reasonPoints, whyItWorks } = scoreOutfitCandidate(
            top,
            bottom,
            shoe,
            jacket,
            acc,
            weather,
            occasion,
            dressCode,
            stylePref,
            colorPref
          );

          const palette = [
            top.colorHex,
            bottom.colorHex,
            shoe.colorHex,
            jacket?.colorHex,
            acc?.colorHex
          ].filter(Boolean) as string[];

          candidates.push({
            id: `rec-${top.id}-${bottom.id}-${shoe.id}-${jacket?.id || 'none'}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            name: generateEditorialName(occasion, stylePref, top, jacket),
            items: {
              top,
              bottom,
              shoes: shoe,
              jacket,
              accessories: acc ? [acc] : [],
            },
            palette,
            whyItWorks,
            reasonPoints,
            scores,
          });
        }
      }
    }
  }

  // Sort by overall score descending
  candidates.sort((a, b) => b.scores.overall - a.scores.overall);

  // Return distinct top N recommendations with unique tops and bottoms
  const results: OutfitRecommendation[] = [];
  const usedTops = new Set<string>();
  const usedBottoms = new Set<string>();

  for (const cand of candidates) {
    if (!usedTops.has(cand.items.top.id) || results.length < count) {
      results.push(cand);
      usedTops.add(cand.items.top.id);
      usedBottoms.add(cand.items.bottom.id);
    }
    if (results.length >= count) break;
  }

  while (results.length < count && candidates[results.length]) {
    results.push(candidates[results.length]);
  }

  return results;
}
