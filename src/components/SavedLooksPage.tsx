import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OutfitCard } from './OutfitCard';
import { Bookmark, Star, Filter, Sparkles } from 'lucide-react';

const OCCASION_FILTERS = ['All', 'Dinner', 'Date', 'Party', 'Formal', 'Casual', 'Travel'] as const;

export const SavedLooksPage: React.FC = () => {
  const { savedOutfits, setActiveTab } = useApp();
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [occasionFilter, setOccasionFilter] = useState<string>('All');

  // Filter outfits by both rating and occasion
  const filteredLooks = savedOutfits.filter(outfit => {
    const matchesRating = minRatingFilter === 0 || (outfit.rating || 5) >= minRatingFilter;
    const matchesOccasion = occasionFilter === 'All' || 
      outfit.name.toLowerCase().includes(occasionFilter.toLowerCase()) ||
      outfit.whyItWorks.toLowerCase().includes(occasionFilter.toLowerCase());
    return matchesRating && matchesOccasion;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-vesta-gold">
              Editorial Collection
            </span>
            <span className="text-vesta-border">•</span>
            <span className="text-[11px] text-vesta-muted">
              {savedOutfits.length} Curated Looks
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-vesta-cream">
            The Lookbook
          </h1>
          <p className="text-sm text-vesta-muted mt-1 max-w-xl">
            Your personal haute couture archive. Favorited and star-rated ensembles saved from the Atelier.
          </p>
        </div>

        {/* Filter Controls Bar */}
        {savedOutfits.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-vesta-card/80 p-2 rounded-2xl border border-white/5">
            {/* Occasion Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pr-2 border-r border-white/10">
              {OCCASION_FILTERS.map(occ => (
                <button
                  key={occ}
                  onClick={() => setOccasionFilter(occ)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                    occasionFilter === occ
                      ? 'bg-vesta-gold/25 text-vesta-goldLight border border-vesta-gold/40'
                      : 'text-vesta-muted hover:text-vesta-cream'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            {/* Star Rating Filter Buttons */}
            <div className="flex items-center gap-1 pl-1">
              <span className="text-xs text-vesta-muted flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5 text-vesta-gold" />
              </span>
              <button
                onClick={() => setMinRatingFilter(0)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors ${
                  minRatingFilter === 0 ? 'bg-vesta-surface text-vesta-goldLight' : 'text-vesta-muted'
                }`}
              >
                All ★
              </button>
              {[4, 5].map(stars => (
                <button
                  key={stars}
                  onClick={() => setMinRatingFilter(stars)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
                    minRatingFilter === stars ? 'bg-vesta-surface text-vesta-goldLight' : 'text-vesta-muted'
                  }`}
                >
                  {stars}
                  <Star className="w-3 h-3 fill-vesta-gold text-vesta-gold" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Looks Grid or Empty State */}
      {savedOutfits.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center max-w-md mx-auto border border-dashed border-white/10 my-12">
          <div className="w-14 h-14 rounded-2xl bg-vesta-surface flex items-center justify-center mx-auto mb-4 text-vesta-gold">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl text-vesta-cream font-medium mb-1">Your Lookbook is Empty</h3>
          <p className="text-xs text-vesta-muted mb-6 leading-relaxed">
            Generate customized climate-ready outfits using VESTA's Atelier and tap the heart icon to save your favorites here.
          </p>
          <button
            onClick={() => setActiveTab('style')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vesta-gold to-vesta-goldMuted text-black font-semibold text-xs inline-flex items-center gap-2 shadow-luxury-glow hover:opacity-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Go to Atelier
          </button>
        </div>
      ) : filteredLooks.length === 0 ? (
        <div className="text-center py-16 text-vesta-muted text-xs">
          No saved outfits match the selected filters ({occasionFilter} occasion, {minRatingFilter > 0 ? `${minRatingFilter}★` : 'all ratings'}).
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLooks.map(outfit => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}

    </div>
  );
};
