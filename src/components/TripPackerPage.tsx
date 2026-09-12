import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TripPlan, TripPlanDay } from '../types';
import { generateOutfitRecommendations } from '../services/stylistEngine';
import { fetchLiveWeather, searchCityCoordinates } from '../services/weatherService';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Compass, 
  CheckSquare, 
  Sparkles, 
  Luggage,
  Recycle,
  CheckCircle2,
  Share2,
  Check
} from 'lucide-react';

const TRIP_TYPES = [
  'Weekend Getaway',
  'Business',
  'Tropical',
  'European City Break'
];

export const TripPackerPage: React.FC = () => {
  const { wardrobe, weather: globalWeather, tripPlans, saveTripPlan } = useApp();
  
  const [destination, setDestination] = useState('Paris, France');
  const [days, setDays] = useState(3);
  const [tripType, setTripType] = useState('European City Break');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(tripPlans[0] || null);
  const [copiedChecklist, setCopiedChecklist] = useState(false);

  // Sync currentPlan when tripPlans loads from DB / LocalStorage
  useEffect(() => {
    if (!currentPlan && tripPlans && tripPlans.length > 0) {
      setCurrentPlan(tripPlans[0]);
    }
  }, [tripPlans, currentPlan]);

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Look up destination weather if possible
      const coords = await searchCityCoordinates(destination);
      const tripWeather = coords 
        ? await fetchLiveWeather(coords.lat, coords.lon, coords.city, coords.country)
        : globalWeather || {
            city: destination,
            temperature: 20,
            apparentTemperature: 19,
            humidity: 50,
            windSpeed: 10,
            weatherCode: 1,
            conditionText: 'Clear',
            weatherThermal: 'Mild' as const,
            stylingTip: 'Versatile layering',
            lat: 48.85,
            lon: 2.35
          };

      // Generate day-by-day outfits
      const occasions = ['Casual', 'Dinner', 'Travel', 'Party', 'Casual', 'Date', 'Casual'] as const;
      const daysCount = Math.min(Math.max(1, days), 7);
      const schedule: TripPlanDay[] = [];
      const usedItemsSet = new Set<string>();

      for (let d = 1; d <= daysCount; d++) {
        const occ = occasions[(d - 1) % occasions.length];
        const dressCode = occ === 'Dinner' || occ === 'Date' ? 'Smart Casual' : occ === 'Party' ? 'Trendy' : 'Casual';
        
        const recs = generateOutfitRecommendations(
          wardrobe,
          tripWeather,
          occ as any,
          dressCode as any,
          'Classic',
          'Neutral',
          1
        );

        const outfit = recs[0];
        if (outfit && outfit.items) {
          schedule.push({
            dayNumber: d,
            activityTitle: d === 1 ? 'Arrival & Cultural Walking Tour' : d === daysCount ? 'Departure & Transit Comfort' : `Day ${d} Curated Itinerary`,
            vibe: `${occ} · ${dressCode}`,
            outfit
          });

          if (outfit.items.top?.id) usedItemsSet.add(outfit.items.top.id);
          if (outfit.items.bottom?.id) usedItemsSet.add(outfit.items.bottom.id);
          if (outfit.items.shoes?.id) usedItemsSet.add(outfit.items.shoes.id);
          if (outfit.items.jacket?.id) usedItemsSet.add(outfit.items.jacket.id);
          if (outfit.items.accessories && outfit.items.accessories[0]?.id) {
            usedItemsSet.add(outfit.items.accessories[0].id);
          }
        }
      }

      // Calculate minimal packing checklist from used items (case-insensitive safe)
      const uniquePieces = wardrobe.filter(i => usedItemsSet.has(i.id));
      const topsCount = uniquePieces.filter(i => i.category?.toLowerCase() === 'tops').length;
      const bottomsCount = uniquePieces.filter(i => i.category?.toLowerCase() === 'bottoms').length;
      const shoesCount = uniquePieces.filter(i => i.category?.toLowerCase() === 'shoes').length;
      const jacketsCount = uniquePieces.filter(i => i.category?.toLowerCase() === 'jackets').length;
      const accessoriesCount = uniquePieces.filter(i => i.category?.toLowerCase() === 'accessories').length;

      const newPlan: TripPlan = {
        id: `trip-${Date.now()}`,
        destination,
        days: daysCount,
        tripType,
        schedule,
        packingChecklist: {
          tops: topsCount,
          bottoms: bottomsCount,
          shoes: shoesCount,
          jackets: jacketsCount,
          accessories: accessoriesCount,
          uniquePieces
        },
        createdAt: new Date().toLocaleDateString()
      };

      saveTripPlan(newPlan);
      setCurrentPlan(newPlan);

    } finally {
      setIsGenerating(false);
    }
  };

  const copyPackingList = () => {
    if (!currentPlan) return;
    const text = `VESTA Smart Packing List: ${currentPlan.destination} (${currentPlan.days} Days)\n` +
      `- Tops: ${currentPlan.packingChecklist.tops} items\n` +
      `- Bottoms: ${currentPlan.packingChecklist.bottoms} items\n` +
      `- Footwear: ${currentPlan.packingChecklist.shoes} items\n` +
      `- Outerwear: ${currentPlan.packingChecklist.jackets} items\n` +
      `- Total Capsule: ${currentPlan.packingChecklist.uniquePieces.length} items (Zero Excess Luggage)`;
    navigator.clipboard.writeText(text);
    setCopiedChecklist(true);
    setTimeout(() => setCopiedChecklist(false), 2200);
  };

  // Calculate items saved by smart reuse
  const totalWornPieces = (currentPlan?.schedule?.length || 0) * 3.5;
  const uniqueItemsCount = currentPlan?.packingChecklist?.uniquePieces?.length || 0;
  const itemsSaved = Math.max(1, Math.round(totalWornPieces - uniqueItemsCount));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-vesta-gold">
              The Capsule
            </span>
            <span className="text-vesta-border">•</span>
            <span className="text-[11px] text-vesta-muted">
              Intelligent Multi-Day Optimization
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-vesta-cream">
            The Capsule · Trip Packer
          </h1>
          <p className="text-sm text-vesta-muted mt-1 max-w-xl">
            Input your destination to synthesize a day-by-day itinerary and a carry-on approved packing checklist engineered for item reuse.
          </p>
        </div>
      </div>

      {/* Configuration Form Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 border border-vesta-gold/20 shadow-luxury">
        <form onSubmit={handleGenerateTrip} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-vesta-gold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Destination
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France or Tokyo"
              className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3.5 py-2.5 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
            />
          </div>

          {/* Number of Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-vesta-gold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Duration
            </label>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3.5 py-2.5 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
            >
              {[2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>{num} Days Capsule</option>
              ))}
            </select>
          </div>

          {/* Trip Vibe */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-vesta-gold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Trip Vibe
            </label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3.5 py-2.5 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
            >
              {TRIP_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-2.5 px-5 rounded-xl bg-gradient-to-r from-vesta-gold via-vesta-goldLight to-vesta-goldMuted text-black font-semibold text-xs tracking-wide shadow-luxury-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Synthesizing Capsule...' : 'Generate Trip Plan'}
          </button>

        </form>
      </div>

      {/* Active Trip Plan View */}
      {currentPlan ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Smart Capsule Summary & Packing Checklist Bar */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-vesta-gold">
                  Smart Capsule Analysis
                </span>
                <h2 className="font-serif text-2xl font-semibold text-vesta-cream mt-0.5">
                  {currentPlan.destination} · {currentPlan.days} Days Itinerary
                </h2>
                <p className="text-xs text-vesta-muted mt-1">
                  Vibe: <strong>{currentPlan.tripType}</strong> • Optimized to avoid duplicate and redundant pieces.
                </p>
              </div>

              {/* Luggage Efficiency Badge */}
              <div className="flex items-center gap-4 bg-vesta-surface/80 p-3.5 rounded-2xl border border-white/5">
                <Luggage className="w-7 h-7 text-vesta-gold shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-vesta-cream block">Carry-On Approved</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      High Efficiency
                    </span>
                  </div>
                  <p className="text-[11px] text-vesta-muted mt-0.5">
                    VESTA reused <strong>{itemsSaved} pieces</strong> across {currentPlan.days} looks, reducing unnecessary packing.
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist Counts */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-vesta-gold flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  SMART PACKING LIST ({currentPlan.packingChecklist.uniquePieces.length} Items Total)
                </h3>
                <button
                  onClick={copyPackingList}
                  className="text-xs text-vesta-muted hover:text-vesta-goldLight flex items-center gap-1 transition-colors"
                >
                  {copiedChecklist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  {copiedChecklist ? 'Checklist Copied' : 'Copy Checklist'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-vesta-surface/60 border border-white/5 text-center">
                  <span className="block text-2xl font-bold font-mono text-vesta-goldLight">
                    {currentPlan.packingChecklist.tops}
                  </span>
                  <span className="text-[11px] text-vesta-muted uppercase font-medium">Tops</span>
                </div>
                <div className="p-3.5 rounded-xl bg-vesta-surface/60 border border-white/5 text-center">
                  <span className="block text-2xl font-bold font-mono text-vesta-goldLight">
                    {currentPlan.packingChecklist.bottoms}
                  </span>
                  <span className="text-[11px] text-vesta-muted uppercase font-medium">Bottoms</span>
                </div>
                <div className="p-3.5 rounded-xl bg-vesta-surface/60 border border-white/5 text-center">
                  <span className="block text-2xl font-bold font-mono text-vesta-goldLight">
                    {currentPlan.packingChecklist.shoes}
                  </span>
                  <span className="text-[11px] text-vesta-muted uppercase font-medium">Footwear</span>
                </div>
                <div className="p-3.5 rounded-xl bg-vesta-surface/60 border border-white/5 text-center">
                  <span className="block text-2xl font-bold font-mono text-vesta-goldLight">
                    {currentPlan.packingChecklist.jackets}
                  </span>
                  <span className="text-[11px] text-vesta-muted uppercase font-medium">Outerwear</span>
                </div>
                <div className="p-3.5 rounded-xl bg-vesta-surface/60 border border-white/5 text-center">
                  <span className="block text-2xl font-bold font-mono text-vesta-goldLight">
                    {currentPlan.packingChecklist.accessories}
                  </span>
                  <span className="text-[11px] text-vesta-muted uppercase font-medium">Accessories</span>
                </div>
              </div>

              {/* Unique pieces thumbnail row */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-[11px] text-vesta-muted whitespace-nowrap mr-2">Luggage Contents:</span>
                {(currentPlan.packingChecklist?.uniquePieces || []).map(piece => (
                  <div 
                    key={piece.id}
                    title={`${piece.name} (${piece.category})`}
                    className="w-11 h-14 rounded-lg bg-vesta-surface overflow-hidden border border-white/10 shrink-0 relative group"
                  >
                    <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Day by Day Outfit Schedule */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-vesta-cream mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-vesta-gold" />
              Day-by-Day Outfit Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPlan.schedule.map(day => (
                <div
                  key={day.dayNumber}
                  className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-vesta-gold uppercase block">
                        DAY 0{day.dayNumber}
                      </span>
                      <h4 className="font-serif text-base font-semibold text-vesta-cream mt-0.5">
                        {day.vibe}
                      </h4>
                    </div>
                    <span className="text-[10px] text-vesta-muted bg-vesta-surface px-2 py-0.5 rounded-md border border-white/5 font-mono">
                      {day.outfit.scores.overall}% Fit
                    </span>
                  </div>

                  {/* Collage */}
                  <div className="p-3 bg-black/20 grid grid-cols-3 gap-2">
                    <div className="rounded-xl overflow-hidden aspect-[4/5] bg-vesta-surface relative">
                      <img src={day.outfit.items?.top?.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80'} alt="top" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[9px] text-white truncate">
                        {day.outfit.items?.top?.name || 'Top'}
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-[4/5] bg-vesta-surface relative">
                      <img src={day.outfit.items?.bottom?.imageUrl || 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80'} alt="bottom" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[9px] text-white truncate">
                        {day.outfit.items?.bottom?.name || 'Bottom'}
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden aspect-[4/5] bg-vesta-surface relative">
                      <img src={day.outfit.items?.shoes?.imageUrl || 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=700&q=80'} alt="shoes" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 p-1 text-[9px] text-white truncate">
                        {day.outfit.items?.shoes?.name || 'Footwear'}
                      </div>
                    </div>
                  </div>

                  {/* Short Reason */}
                  <div className="p-4 bg-vesta-surface/30 text-xs text-vesta-muted leading-relaxed">
                    <span className="text-[10px] uppercase font-mono text-vesta-goldLight block mb-0.5">Styling Directive</span>
                    <p className="line-clamp-2">"{day.outfit.whyItWorks}"</p>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-16 text-center max-w-md mx-auto border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-vesta-surface flex items-center justify-center mx-auto mb-4 text-vesta-gold">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-vesta-cream font-medium mb-1">Plan Your Next Voyage</h3>
          <p className="text-xs text-vesta-muted mb-4">
            Select your destination and duration above to build a streamlined, climate-matched capsule wardrobe.
          </p>
        </div>
      )}

    </div>
  );
};
