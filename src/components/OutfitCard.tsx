import React, { useState, useEffect, useRef } from 'react';
import { OutfitRecommendation } from '../types';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Share2, 
  RotateCw, 
  Star, 
  Sparkles, 
  Thermometer, 
  Palette, 
  ShieldCheck, 
  Check,
  MapPin
} from 'lucide-react';

interface OutfitCardProps {
  outfit: OutfitRecommendation;
  onRegenerate?: () => void;
}

// SVG circular score ring
const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 60 }) => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (animated ? clampedScore / 100 : 0) * circumference;

  // Determine color by score
  const strokeColor = clampedScore >= 85 ? '#D4AF37' : clampedScore >= 70 ? '#C39B77' : '#9496A8';

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="score-ring">
      <svg ref={ref} width={size} height={size} className="score-circle">
        <circle
          className="score-circle-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="6"
        />
        <circle
          className="score-circle-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="6"
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-sm font-bold" style={{ color: strokeColor }}>{score}</span>
        <span className="text-[8px] text-vesta-muted font-mono uppercase tracking-wider">/100</span>
      </div>
    </div>
  );
};

// Animated score bar
const ScoreBar: React.FC<{ label: string; score: number; color?: string }> = ({ label, score, color = '#D4AF37' }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-vesta-muted">{label}</span>
        <span className="font-mono text-vesta-cream font-medium">{score}</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}88 0%, ${color} 100%)` }}
        />
      </div>
    </div>
  );
};

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onRegenerate }) => {
  const { savedOutfits, saveOutfit, removeSavedOutfit, rateSavedOutfit } = useApp();
  const isSaved = savedOutfits.some(o => o.id === outfit.id);
  const [copied, setCopied] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const activeRating = outfit.rating || 5;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeSavedOutfit(outfit.id);
      triggerToast('Removed from Saved Lookbook');
    } else {
      saveOutfit(outfit);
      triggerToast('Look saved to Personal Lookbook ✓');
      try {
        confetti({
          particleCount: 40,
          spread: 65,
          origin: { y: 0.75 },
          colors: ['#D4AF37', '#F3E5AB', '#AA8C2C', '#FFFFFF', '#FFF8D6']
        });
      } catch { /* ignore */ }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `✦ VESTA Look: "${outfit.name}"\nFit Score: ${outfit.scores.overall}/100\n\nTop: ${outfit.items.top.name}\nBottom: ${outfit.items.bottom.name}\nShoes: ${outfit.items.shoes.name}${outfit.items.jacket ? `\nOuterwear: ${outfit.items.jacket.name}` : ''}\n\n"${outfit.whyItWorks}"`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      triggerToast('Outfit recipe copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleRate = (stars: number, e: React.MouseEvent) => {
    e.stopPropagation();
    rateSavedOutfit(outfit.id, stars);
    triggerToast(`Rated ${stars}★ — Style DNA updated`);
  };

  const allItems = [
    { label: 'Top', item: outfit.items.top },
    { label: 'Bottom', item: outfit.items.bottom },
    ...(outfit.items.jacket ? [{ label: 'Outerwear', item: outfit.items.jacket }] : []),
    { label: 'Footwear', item: outfit.items.shoes },
    ...(outfit.items.accessories && outfit.items.accessories.length > 0 ? [{ label: 'Accent', item: outfit.items.accessories[0] }] : []),
  ];

  const scoreColor = outfit.scores.overall >= 85 ? 'text-vesta-gold' : outfit.scores.overall >= 70 ? 'text-amber-400' : 'text-vesta-muted';

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/8 flex flex-col group transition-all duration-300 relative animate-fade-up">
      
      {/* Mini Toast */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-vesta-card/98 border border-vesta-gold/50 text-[11px] text-vesta-goldLight shadow-luxury-glow backdrop-blur-xl animate-in scale-in duration-150 whitespace-nowrap font-medium">
          ✦ {toastMessage}
        </div>
      )}

      {/* ── HEADER: Score Ring + Title + Actions ── */}
      <div className="p-5 border-b border-white/5 flex items-start gap-4">
        {/* Circular Score Ring */}
        <div className="shrink-0">
          <ScoreRing score={outfit.scores.overall} size={60} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono tracking-widest text-vesta-gold uppercase">
              VESTA · {outfit.items.top.type}
            </span>
          </div>
          <h3 className="font-serif text-base font-semibold text-vesta-cream tracking-wide group-hover:text-vesta-goldLight transition-colors leading-tight line-clamp-2">
            {outfit.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-mono font-semibold ${scoreColor}`}>
              {outfit.scores.overall >= 88 ? '★ Elite Pick' : outfit.scores.overall >= 78 ? '✦ Strong Match' : '○ Good Fit'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={handleSaveToggle}
            title={isSaved ? 'Saved' : 'Save look'}
            className={`p-2 rounded-xl transition-all ${
              isSaved
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 pulse-gold'
                : 'bg-vesta-surface/70 hover:bg-rose-500/10 text-vesta-muted hover:text-rose-400 border border-white/5'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            title="Copy outfit recipe"
            className="p-2 rounded-xl bg-vesta-surface/70 hover:bg-vesta-surface text-vesta-muted hover:text-vesta-goldLight border border-white/5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate this look"
              className="p-2 rounded-xl bg-vesta-surface/70 hover:bg-vesta-surface text-vesta-muted hover:text-vesta-gold border border-white/5 transition-all hover:rotate-180 duration-500"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── GARMENT COLLAGE ── */}
      <div className="p-3 bg-black/25">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(allItems.length, 4)}, 1fr)` }}>
          {allItems.map(({ label, item }) => (
            <div key={item.id} className="relative rounded-xl overflow-hidden aspect-[3/4] bg-vesta-surface border border-white/5 group/item">
              {!imgErrors.has(item.id) ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="item-card-img w-full h-full object-cover"
                  onError={() => setImgErrors(prev => new Set([...prev, item.id]))}
                />
              ) : (
                // Fallback color swatch
                <div
                  className="w-full h-full flex items-end p-2"
                  style={{
                    background: `linear-gradient(160deg, ${item.colorHex}40 0%, ${item.colorHex}90 100%)`
                  }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-2">
                <span className="text-[8px] uppercase tracking-wider text-vesta-gold font-mono leading-none">{label}</span>
                <p className="text-[10px] font-medium text-white/95 line-clamp-1 mt-0.5">{item.name}</p>
                <span className="flex items-center gap-1 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full border border-white/25 shrink-0"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-[9px] text-vesta-muted">{item.color}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLOR HARMONY BAR ── */}
      <div className="px-4 py-2.5 bg-vesta-surface/30 border-y border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-vesta-gold" />
          <span className="text-[11px] text-vesta-muted">Palette Harmony</span>
          <span className="text-[11px] font-mono font-semibold text-vesta-goldLight">{outfit.scores.colorHarmony}/100</span>
        </div>
        <div className="flex items-center gap-1">
          {outfit.palette.map((hex, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border border-white/20 shadow-sm transition-all duration-300 hover:scale-125 cursor-default"
              style={{ backgroundColor: hex }}
              title={hex}
            />
          ))}
        </div>
      </div>

      {/* ── SCORE BREAKDOWN & REASONING ── */}
      <div className="p-4 space-y-4">
        {/* Animated Score Bars */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-vesta-muted">Fit Breakdown</span>
          <ScoreBar label="Weather Fit" score={outfit.scores.weather} color="#F97316" />
          <ScoreBar label="Dress Code" score={outfit.scores.dressCode} color="#D4AF37" />
          <ScoreBar label="Color Match" score={outfit.scores.colorHarmony} color="#A78BFA" />
          <ScoreBar label="Occasion" score={outfit.scores.occasion} color="#34D399" />
        </div>

        {/* ── WHY VESTA CHOSE THIS: AI Reasoning or Local Editorial ── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-vesta-muted uppercase">
              Why VESTA Chose This
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-vesta-gold/15 text-vesta-goldLight border border-vesta-gold/30">
              <Sparkles className="w-2.5 h-2.5 text-vesta-gold" />
              {outfit.aiReasoning ? '✦ VESTA AI STYLING' : '✦ VESTA STYLIST'}
            </span>
          </div>

          {/* Editorial Summary / Directive */}
          <div className="p-3 rounded-xl bg-vesta-surface/50 border border-white/5 text-[11px] text-vesta-muted leading-relaxed">
            <span className="text-vesta-gold font-mono uppercase tracking-widest text-[9px] block mb-1">
              {outfit.aiReasoning ? "✦ VESTA'S TAKE" : "✦ STYLING DIRECTIVE"}
            </span>
            "{outfit.aiReasoning?.summary || outfit.whyItWorks}"
          </div>

          {/* 4-Axis Reasoning Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-vesta-surface/40 border border-white/5 flex items-start gap-2">
              <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white/90 text-[10px] block uppercase tracking-wide">🌡 Weather</span>
                <p className="text-vesta-muted text-[10px] leading-snug mt-0.5">
                  {outfit.aiReasoning?.weatherReason || outfit.reasonPoints.weather}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-vesta-surface/40 border border-white/5 flex items-start gap-2">
              <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white/90 text-[10px] block uppercase tracking-wide">🎨 Color</span>
                <p className="text-vesta-muted text-[10px] leading-snug mt-0.5">
                  {outfit.aiReasoning?.colorReason || outfit.reasonPoints.color}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-vesta-surface/40 border border-white/5 flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white/90 text-[10px] block uppercase tracking-wide">👔 Dress Code</span>
                <p className="text-vesta-muted text-[10px] leading-snug mt-0.5">
                  {outfit.aiReasoning?.dressCodeReason || outfit.reasonPoints.dressCode}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-vesta-surface/40 border border-white/5 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-white/90 text-[10px] block uppercase tracking-wide">✨ Occasion</span>
                <p className="text-vesta-muted text-[10px] leading-snug mt-0.5">
                  {outfit.aiReasoning?.occasionReason || outfit.reasonPoints.occasion}
                </p>
              </div>
            </div>
          </div>

          {/* Stylist Tip if available from AI */}
          {outfit.aiReasoning?.stylistTip && (
            <div className="p-2.5 rounded-lg bg-vesta-gold/10 border border-vesta-gold/20 text-[10px] text-vesta-goldLight flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-vesta-gold shrink-0" />
              <span><strong>STYLIST TIP:</strong> {outfit.aiReasoning.stylistTip}</span>
            </div>
          )}
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-[11px] text-vesta-muted">Rate this look</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={(e) => handleRate(star, e)}
                className="p-1 focus:outline-none transition-all hover:scale-130"
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    (hoverRating !== null ? star <= hoverRating : star <= activeRating)
                      ? 'text-vesta-gold fill-vesta-gold'
                      : 'text-vesta-border'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
