import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Occasion, DressCode, StylePreference, ColorPreference, OutfitRecommendation } from '../types';
import { generateOutfitRecommendations } from '../services/stylistEngine';
import { OutfitCard } from './OutfitCard';
import { StyleDNAWidget } from './StyleDNAWidget';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CloudSun, 
  Droplets, 
  Wind, 
  RotateCw, 
  SlidersHorizontal,
  Shirt,
  Compass,
  Palette,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Thermometer,
  Eye
} from 'lucide-react';

const OCCASIONS: Occasion[] = ['Dinner','Date','Party','Interview','Wedding','Casual','College','Travel','Beach'];
const DRESS_CODES: DressCode[] = ['Smart Casual','Casual','Business Casual','Formal','Traditional'];
const STYLE_PREFERENCES: StylePreference[] = ['Classic','Minimal','Elegant','Streetwear','Trendy'];
const COLOR_PREFERENCES: ColorPreference[] = ['Neutral','Dark','Earth tones','Any','Bright'];

// Occasion icons for visual richness
const OCCASION_EMOJI: Record<string, string> = {
  'Dinner': '🍽', 'Date': '💫', 'Party': '🎉', 'Interview': '💼',
  'Wedding': '💍', 'Casual': '🌿', 'College': '📚', 'Travel': '✈️',
  'Beach': '🏖',
};

// Floating particle dots for hero background
const HeroParticles: React.FC = () => {
  const particles = [
    { top: '15%', left: '8%', size: 4, delay: '0s', dur: '6s', color: '#D4AF3760' },
    { top: '60%', left: '5%', size: 3, delay: '1.5s', dur: '7s', color: '#D4AF3740' },
    { top: '30%', right: '10%', size: 5, delay: '0.5s', dur: '8s', color: '#D4AF3750' },
    { top: '75%', right: '15%', size: 3, delay: '2s', dur: '6.5s', color: '#D4AF3735' },
    { top: '50%', left: '50%', size: 2, delay: '1s', dur: '9s', color: '#FFFFFF30' },
    { top: '20%', left: '40%', size: 4, delay: '3s', dur: '7s', color: '#D4AF3745' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: 'left' in p ? p.left : undefined,
            right: 'right' in p ? (p as { right: string }).right : undefined,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationName: 'breathe',
            animationDuration: p.dur,
            animationDelay: p.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
};

// Marquee strip with fashion keywords
const MarqueeStrip: React.FC = () => {
  const items = [
    '✦ VESTA AI WARDROBE', '• Open-Meteo Live Weather', '• 5-Factor Algorithm',
    '• Zero Hallucinations', '• Your Own Garments Only', '• Real-Time Styling Matrix',
    '• Occasion Intelligence', '• Color Harmony Engine', '• Trip Capsule Packer',
    '✦ VESTA AI WARDROBE', '• Open-Meteo Live Weather', '• 5-Factor Algorithm',
    '• Zero Hallucinations', '• Your Own Garments Only', '• Real-Time Styling Matrix',
    '• Occasion Intelligence', '• Color Harmony Engine', '• Trip Capsule Packer',
  ];

  return (
    <div className="marquee-wrap border-y border-white/5 py-2 bg-black/20 overflow-hidden">
      <div className="marquee-inner">
        {items.map((item, i) => (
          <span key={i} className="text-[10px] font-mono tracking-widest text-vesta-muted mr-8 uppercase">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

import { fetchAIStylistReasoning } from '../services/apiService';

export const StyleMeDashboard: React.FC = () => {
  const { wardrobe, weather, loadingWeather, setActiveTab } = useApp();

  const [occasion, setOccasion] = useState<Occasion>('Dinner');
  const [dressCode, setDressCode] = useState<DressCode>('Smart Casual');
  const [stylePreference, setStylePreference] = useState<StylePreference>('Classic');
  const [colorPreference, setColorPreference] = useState<ColorPreference>('Neutral');
  const [recommendations, setRecommendations] = useState<OutfitRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiStyling, setIsAiStyling] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('✦ VESTA IS CURATING YOUR LOOK...');
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-generate on weather load
  useEffect(() => {
    if (weather && wardrobe.length > 0 && !hasGeneratedOnce) {
      handleGenerateOutfits(false);
      setHasGeneratedOnce(true);
    }
  }, [weather, wardrobe.length]);

  const handleGenerateOutfits = (triggerConfetti = true) => {
    if (!weather) return;
    setIsGenerating(true);

    // 1. Generate local outfit candidates immediately (deterministic recommendation engine)
    setTimeout(() => {
      const recs = generateOutfitRecommendations(
        wardrobe, weather, occasion, dressCode, stylePreference, colorPreference, 3
      );
      setRecommendations(recs);
      setIsGenerating(false);

      if (triggerConfetti) {
        try {
          confetti({
            particleCount: 30,
            spread: 55,
            origin: { y: 0.72 },
            colors: ['#E6C280', '#D4AF37', '#F3E8D0', '#FFFFFF', '#FFF8D6']
          });
        } catch { /* ignore */ }

        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }

      // 2. Non-blocking AI styling enhancement in background
      setIsAiStyling(true);
      setAiStatusMessage('✦ VESTA IS CURATING YOUR LOOK...');

      const timer1 = setTimeout(() => {
        setAiStatusMessage('✦ ANALYZING WEATHER & TEMPERATURE...');
      }, 700);

      const timer2 = setTimeout(() => {
        setAiStatusMessage('✦ BALANCING COLORS & REFINING YOUR LOOK...');
      }, 1400);

      fetchAIStylistReasoning(recs, weather, occasion, dressCode, stylePreference, colorPreference)
        .then(aiMap => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          if (aiMap && aiMap.size > 0) {
            setRecommendations(prev =>
              prev.map(item => {
                const aiData = aiMap.get(item.id);
                return aiData ? { ...item, aiReasoning: aiData } : item;
              })
            );
          }
        })
        .catch(err => {
          console.warn('[VESTA AI] Non-blocking fallback preserved:', err);
        })
        .finally(() => {
          setIsAiStyling(false);
        });
    }, 600);
  };

  const handleRegenerateSingle = (index: number) => {
    if (!weather) return;
    const freshBatch = generateOutfitRecommendations(
      wardrobe, weather, occasion, dressCode, stylePreference, colorPreference, 8
    );
    const currentIds = new Set(recommendations.map(r => r.id));
    const alternative = freshBatch.find(r => !currentIds.has(r.id)) || freshBatch[0];
    if (alternative) {
      setRecommendations(prev => {
        const copy = [...prev];
        copy[index] = alternative;
        return copy;
      });

      // Enrich newly regenerated outfit
      fetchAIStylistReasoning([alternative], weather, occasion, dressCode, stylePreference, colorPreference)
        .then(aiMap => {
          if (aiMap && aiMap.has(alternative.id)) {
            const aiData = aiMap.get(alternative.id);
            setRecommendations(prev => {
              const copy = [...prev];
              if (copy[index]?.id === alternative.id) {
                copy[index] = { ...copy[index], aiReasoning: aiData };
              }
              return copy;
            });
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      
      {/* Marquee Strip */}
      <MarqueeStrip />

      {/* ── 1. HERO SECTION ── */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-vesta-gold/15 shadow-luxury gold-shimmer-border">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-vesta-gold/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-600/4 rounded-full blur-[80px] pointer-events-none" />
        
        <HeroParticles />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          
          {/* Brand Statement */}
          <div className="space-y-5 max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/50 border border-vesta-gold/25 text-vesta-gold text-[10px] font-mono tracking-[0.25em] uppercase">
              <Sparkles className="w-3 h-3" />
              VESTA AI WARDROBE ATELIER
              <span className="w-1.5 h-1.5 rounded-full bg-vesta-gold animate-pulse" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-vesta-cream leading-[1.08]">
              Your wardrobe.<br />
              <span className="text-shimmer font-semibold italic">Your weather.</span> Your style.
            </h1>

            <p className="text-base sm:text-lg text-vesta-muted font-light leading-relaxed">
              Get intelligent outfit recommendations built around what you already own —
              scored against live weather data.
            </p>

            {/* Philosophy badge */}
            <div className="inline-flex items-start gap-3 p-3.5 rounded-2xl bg-black/45 border border-vesta-gold/12 max-w-lg">
              <span className="text-vesta-gold text-lg mt-0.5">✦</span>
              <p className="text-xs text-vesta-cream/85 leading-relaxed">
                <strong className="text-vesta-goldLight">VESTA Principle:</strong> We help you make better outfits from what you already own — zero unnecessary purchases.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-vesta-muted">
              {[
                ['CheckCircle2', 'Live Open-Meteo Integration'],
                ['CheckCircle2', 'Zero Hallucinations (Own Garments)'],
                ['CheckCircle2', '5-Factor Transparent Scoring'],
              ].map(([, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-vesta-gold" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Live Weather Card */}
          {weather ? (
            <div className="w-full lg:w-80 animate-fade-up animate-fade-up-delay-2">
              <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-luxury hover-lift">
                <div className="flex items-center justify-between pb-3 border-b border-white/6">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.2em] text-vesta-gold uppercase block mb-0.5">
                      Atmospheric Telemetry
                    </span>
                    <span className="font-serif text-xl font-semibold text-vesta-cream">
                      {weather.city}{weather.country ? `, ${weather.country}` : ''}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-vesta-gold/15 border border-vesta-gold/25 flex items-center justify-center">
                    <CloudSun className="w-5 h-5 text-vesta-gold" />
                  </div>
                </div>

                <div className="py-4 flex items-baseline justify-between">
                  <div>
                    <span className="font-mono text-5xl font-bold text-gold-gradient">
                      {weather.temperature}°
                    </span>
                    <span className="text-xs text-vesta-muted block mt-1">{weather.conditionText}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-vesta-muted block">Feels like</span>
                    <span className="font-mono text-lg font-semibold text-vesta-goldLight">
                      {weather.apparentTemperature}°C
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/6 text-[10px] text-vesta-muted">
                  <div className="flex flex-col items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" />
                    <span>{weather.humidity}%</span>
                    <span className="text-[9px]">Humidity</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>{weather.windSpeed}</span>
                    <span className="text-[9px]">km/h Wind</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span>{weather.apparentTemperature}°</span>
                    <span className="text-[9px]">Apparent</span>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-vesta-surface/70 border border-white/5 text-[10px] text-vesta-goldLight/90 leading-relaxed">
                  🌡 <span className="text-vesta-cream/85">{weather.stylingTip}</span>
                </div>
              </div>
            </div>
          ) : loadingWeather && (
            <div className="w-full lg:w-80 glass-card rounded-2xl p-5 border border-white/10 animate-pulse">
              <div className="h-4 bg-vesta-surface rounded w-2/3 mb-3" />
              <div className="h-10 bg-vesta-surface rounded w-1/2 mb-2" />
              <div className="h-3 bg-vesta-surface rounded w-full" />
            </div>
          )}
        </div>
      </div>

      {/* ── 2. THE ATELIER: Styling Controls ── */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-vesta-gold/15 shadow-luxury space-y-7 animate-fade-up animate-fade-up-delay-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-vesta-gold">
                The Atelier
              </span>
              <span className="text-vesta-border">•</span>
              <span className="text-[10px] text-vesta-muted">Step-by-Step Styling Workflow</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-vesta-cream">
              Curate Your Ensemble
            </h2>
          </div>
          <div className="text-xs font-mono text-vesta-muted bg-vesta-surface/50 px-3 py-1.5 rounded-lg border border-white/5">
            Matching from <span className="text-vesta-gold font-bold">{wardrobe.length}</span> items in your Vault
          </div>
        </div>

        {/* Visual Workflow Steps */}
        <div className="hidden lg:flex items-center justify-between px-5 py-3 rounded-2xl bg-black/35 border border-white/5 text-xs">
          {[
            { num: '1', label: `WEATHER · ${weather?.city || 'Milan'} ${weather?.temperature || '--'}°C`, active: true },
            { num: '2', label: `OCCASION · ${occasion}`, active: true },
            { num: '3', label: `DRESS CODE · ${dressCode}`, active: true },
            { num: '4', label: 'STYLE & PALETTE', active: true },
          ].map((step, i) => (
            <React.Fragment key={step.num}>
              {i > 0 && <ArrowRight className="w-3.5 h-3.5 text-white/15 shrink-0" />}
              <div className="flex items-center gap-2 text-vesta-cream font-medium">
                <span className="w-5 h-5 rounded-full bg-vesta-gold/20 text-vesta-gold flex items-center justify-center font-mono text-[9px] shrink-0">
                  {step.num}
                </span>
                <span className="text-[11px]">{step.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* 4-Way Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Occasion */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-vesta-gold flex items-center gap-1.5">
              <Compass className="w-3 h-3" />
              1. Occasion
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {OCCASIONS.map(occ => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occ)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all flex items-center gap-1.5 ${
                    occasion === occ
                      ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/45 shadow-sm'
                      : 'bg-vesta-surface/50 text-vesta-muted hover:text-vesta-cream border border-white/5 hover:border-white/15'
                  }`}
                >
                  <span className="text-sm">{OCCASION_EMOJI[occ]}</span>
                  <span className="truncate">{occ}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dress Code */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-vesta-gold flex items-center gap-1.5">
              <Shirt className="w-3 h-3" />
              2. Dress Code
            </label>
            <div className="flex flex-col gap-1.5">
              {DRESS_CODES.map(code => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setDressCode(code)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    dressCode === code
                      ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/45 shadow-sm'
                      : 'bg-vesta-surface/50 text-vesta-muted hover:text-vesta-cream border border-white/5 hover:border-white/15'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Style Preference */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-vesta-gold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3" />
              3. Style Preference
            </label>
            <div className="flex flex-col gap-1.5">
              {STYLE_PREFERENCES.map(pref => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setStylePreference(pref)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    stylePreference === pref
                      ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/45 shadow-sm'
                      : 'bg-vesta-surface/50 text-vesta-muted hover:text-vesta-cream border border-white/5 hover:border-white/15'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Color Preference */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-mono uppercase tracking-widest text-vesta-gold flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              4. Color Palette
            </label>
            <div className="flex flex-col gap-1.5">
              {COLOR_PREFERENCES.map(cp => (
                <button
                  key={cp}
                  type="button"
                  onClick={() => setColorPreference(cp)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
                    colorPreference === cp
                      ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/45 shadow-sm'
                      : 'bg-vesta-surface/50 text-vesta-muted hover:text-vesta-cream border border-white/5 hover:border-white/15'
                  }`}
                >
                  {cp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Algorithm Info + Generate CTA */}
        <div className="pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setShowScoreInfo(!showScoreInfo)}
            className="flex items-center gap-2 text-[11px] text-vesta-muted hover:text-vesta-goldLight transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              <strong>5-Factor Algorithm:</strong> Weather (25%) · Dress Code (25%) · Occasion (20%) · Colors (20%) · Style (10%)
            </span>
          </button>

          <button
            onClick={() => handleGenerateOutfits(true)}
            disabled={isGenerating || loadingWeather}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-vesta-goldMuted via-vesta-gold to-vesta-goldLight text-black font-bold text-sm tracking-widest shadow-luxury-glow hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Curating Your Look...' : 'Generate Outfits'}
          </button>
        </div>
      </div>

      {/* ── 3. GENERATED RECOMMENDATIONS ── */}
      <div ref={resultsRef} className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-vesta-gold">
                Curated Recommendations
              </span>
              <span className="text-vesta-border">•</span>
              <span className="text-[10px] text-vesta-muted">3 Distinct Combinations</span>
              {isAiStyling && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-vesta-gold/15 text-vesta-goldLight border border-vesta-gold/30 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-vesta-gold animate-spin" />
                  {aiStatusMessage}
                </span>
              )}
            </div>
            <h2 className="font-serif text-3xl font-semibold text-vesta-cream">
              The Stylist's Selection
            </h2>
          </div>

          {recommendations.length > 0 && (
            <button
              onClick={() => handleGenerateOutfits(true)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-vesta-card hover:bg-vesta-cardHover border border-white/8 text-xs font-medium text-vesta-muted hover:text-vesta-goldLight transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate All
            </button>
          )}
        </div>

        {/* Loading Skeletons */}
        {isGenerating ? (
          <div className="space-y-6">
            <div className="text-center py-6">
              <span className="text-sm font-serif tracking-widest text-vesta-goldLight animate-pulse">
                ✦ VESTA IS CURATING YOUR LOOK...
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-vesta-surface" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-vesta-surface rounded w-2/3" />
                      <div className="h-4 bg-vesta-surface rounded w-4/5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-[3/4] bg-vesta-surface rounded-xl" />
                    <div className="aspect-[3/4] bg-vesta-surface rounded-xl" />
                    <div className="aspect-[3/4] bg-vesta-surface rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-vesta-surface rounded w-full" />
                    <div className="h-3 bg-vesta-surface rounded w-4/5" />
                    <div className="h-3 bg-vesta-surface rounded w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-16 text-center max-w-md mx-auto border border-dashed border-white/12">
            <div className="w-16 h-16 rounded-2xl bg-vesta-gold/10 border border-vesta-gold/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-vesta-gold" />
            </div>
            <h3 className="font-serif text-xl text-vesta-cream mb-2">Ready to Style</h3>
            <p className="text-xs text-vesta-muted mb-6 leading-relaxed">
              Select your parameters in The Atelier and tap "GENERATE OUTFITS" to begin your curated styling experience.
            </p>
            <button
              onClick={() => handleGenerateOutfits(true)}
              disabled={loadingWeather || !weather}
              className="px-8 py-3 rounded-xl bg-vesta-gold/20 border border-vesta-gold/30 text-vesta-goldLight text-sm font-medium hover:bg-vesta-gold/30 transition-all disabled:opacity-40"
            >
              Begin Styling →
            </button>
          </div>
        ) : (
          /* Recommendation Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((outfit, idx) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onRegenerate={() => handleRegenerateSingle(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 4. STYLE DNA ── */}
      <StyleDNAWidget />

      {/* ── 5. QUICK LINKS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { tab: 'wardrobe' as const, icon: '👗', title: 'My Wardrobe Vault', desc: `${wardrobe.length} garments digitized and scored` },
          { tab: 'saved' as const, icon: '🔖', title: 'Saved Lookbook', desc: 'Your personally curated looks' },
          { tab: 'trips' as const, icon: '✈️', title: 'Trip Capsule Packer', desc: 'Efficient multi-day travel packing' },
        ].map(({ tab, icon, title, desc }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="glass-card rounded-2xl p-5 border border-white/5 text-left hover-lift group"
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-serif text-base font-semibold text-vesta-cream group-hover:text-vesta-goldLight transition-colors">{title}</div>
            <p className="text-[11px] text-vesta-muted mt-1">{desc}</p>
            <div className="mt-3 text-vesta-gold text-[11px] font-mono tracking-wide group-hover:gap-2 transition-all flex items-center gap-1">
              Explore <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
};
