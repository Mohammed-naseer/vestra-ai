import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

const AnimatedBar: React.FC<{ label: string; pct: number; delay?: number }> = ({ label, pct, delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-vesta-cream font-medium">{label}</span>
        <span className="font-mono text-vesta-goldLight">{pct}%</span>
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export const StyleDNAWidget: React.FC = () => {
  const { savedOutfits } = useApp();

  const hasHistory = savedOutfits.length > 0;

  let minimalPct = 84;
  let classicPct = 78;
  let elegantPct = 72;
  let streetwearPct = 54;
  let formalPct = 68;

  const colorFrequency: Record<string, number> = {
    'Navy': 4, 'White': 5, 'Beige': 3, 'Black': 4, 'Grey': 2, 'Olive': 1,
  };

  if (hasHistory) {
    savedOutfits.forEach(outfit => {
      const allText = `${outfit.name} ${outfit.whyItWorks} ${outfit.items.top.name} ${outfit.items.bottom.name}`.toLowerCase();
      if (allText.includes('minimal')) minimalPct = Math.min(98, minimalPct + 4);
      if (allText.includes('classic') || allText.includes('sartorial')) classicPct = Math.min(98, classicPct + 5);
      if (allText.includes('elegant') || allText.includes('blazer')) elegantPct = Math.min(98, elegantPct + 5);
      if (allText.includes('street') || allText.includes('denim')) streetwearPct = Math.min(98, streetwearPct + 6);
      if (allText.includes('formal') || allText.includes('trousers')) formalPct = Math.min(98, formalPct + 4);

      const colors = [outfit.items.top.color, outfit.items.bottom.color, outfit.items.shoes.color];
      colors.forEach(c => {
        const key = c.split(' ')[0];
        colorFrequency[key] = (colorFrequency[key] || 0) + 1;
      });
    });
  }

  const sortedColors = Object.entries(colorFrequency).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const COLOR_HEX_MAP: Record<string, string> = {
    'Navy': '#1A2438', 'White': '#FFFFFF', 'Beige': '#D9C8B4', 'Black': '#111111',
    'Grey': '#383E45', 'Olive': '#708238', 'Midnight': '#1A2438', 'Camel': '#C39B77',
    'Pure': '#F5F5F7', 'Obsidian': '#1A1A1A',
  };

  // Derive dominant archetype
  const archetypeMap = [
    { name: 'Minimal', pct: minimalPct },
    { name: 'Classic', pct: classicPct },
    { name: 'Elegant', pct: elegantPct },
    { name: 'Streetwear', pct: streetwearPct },
    { name: 'Formal', pct: formalPct },
  ];
  const dominant = archetypeMap.sort((a, b) => b.pct - a.pct)[0];

  const archetypesOrdered = [...archetypeMap].sort((a, b) => b.pct - a.pct);

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 border border-vesta-gold/15 shadow-luxury space-y-6 animate-fade-up">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-vesta-gold">
              Aesthetic Profile
            </span>
            <span className="text-vesta-border">•</span>
            <span className="text-[10px] text-vesta-muted flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Real-Time Behavioral Synthesis
            </span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-vesta-cream">Your Style DNA</h3>
        </div>

        {hasHistory ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-vesta-gold/10 border border-vesta-gold/20 text-vesta-goldLight font-mono text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-vesta-gold" />
            VESTA is learning your preferences ({savedOutfits.length} looks)
          </span>
        ) : (
          <span className="text-[11px] text-vesta-muted italic px-3 py-1.5 rounded-full bg-vesta-surface/40 border border-white/5">
            Rate a few looks and VESTA will learn your style.
          </span>
        )}
      </div>

      {/* Dominant Archetype Badge */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-vesta-gold/10 to-transparent border border-vesta-gold/15">
        <div className="w-10 h-10 rounded-xl bg-vesta-gold/15 border border-vesta-gold/25 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-vesta-gold" />
        </div>
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-vesta-muted block">Dominant Archetype</span>
          <span className="font-serif text-xl font-semibold text-gold-gradient">{dominant.name}</span>
        </div>
        <div className="ml-auto text-right">
          <span className="text-[9px] font-mono text-vesta-muted block">Affinity Score</span>
          <span className="font-mono text-2xl font-bold text-vesta-goldLight">{dominant.pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Style Archetype Bars */}
        <div className="space-y-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-vesta-muted block">
            Archetype Affinity Matrix
          </span>
          <div className="space-y-3">
            {archetypesOrdered.map((a, i) => (
              <AnimatedBar key={a.name} label={a.name} pct={a.pct} delay={i * 80} />
            ))}
          </div>
        </div>

        {/* Palette + Philosophy */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-vesta-surface/40 border border-white/5 space-y-4">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-vesta-muted block mb-3">
                Preferred Palette Distribution
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sortedColors.map(([name, count]) => {
                  const hex = COLOR_HEX_MAP[name] || '#333333';
                  return (
                    <div key={name} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 hover-lift">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-xs font-medium text-vesta-cream">{name}</span>
                      <span className="text-[10px] text-vesta-muted font-mono ml-auto">×{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <span className="text-vesta-goldLight font-medium block mb-1.5 text-[10px] font-mono uppercase tracking-widest">
                ✦ WARDROBE PHILOSOPHY
              </span>
              <p className="text-[11px] text-vesta-muted leading-relaxed italic">
                "VESTA does not tell you to buy more clothes. VESTA helps you make better outfits from what you already own."
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-vesta-surface/40 border border-white/5 text-center">
              <span className="font-mono text-xl font-bold text-vesta-goldLight block">{savedOutfits.length}</span>
              <span className="text-[10px] text-vesta-muted">Saved Looks</span>
            </div>
            <div className="p-3 rounded-xl bg-vesta-surface/40 border border-white/5 text-center">
              <span className="font-mono text-xl font-bold text-vesta-goldLight block">
                {savedOutfits.length > 0 ? (savedOutfits.reduce((s, o) => s + (o.rating || 5), 0) / savedOutfits.length).toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-vesta-muted">Avg Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
