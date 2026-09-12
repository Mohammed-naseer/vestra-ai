import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StyleMeDashboard } from './components/StyleMeDashboard';
import { WardrobePage } from './components/WardrobePage';
import { SavedLooksPage } from './components/SavedLooksPage';
import { TripPackerPage } from './components/TripPackerPage';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-vesta-bg text-vesta-cream flex flex-col selection:bg-vesta-gold/25 selection:text-vesta-cream">
      
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-12" key={activeTab}>
        {activeTab === 'style'    && <StyleMeDashboard />}
        {activeTab === 'wardrobe' && <WardrobePage />}
        {activeTab === 'saved'    && <SavedLooksPage />}
        {activeTab === 'trips'    && <TripPackerPage />}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-white/5 py-10 px-4 lg:px-8 bg-black/40">
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-vesta-goldLight via-vesta-gold to-vesta-goldMuted flex items-center justify-center">
                <span className="font-serif text-base font-bold text-black">V</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg tracking-[0.2em] font-semibold text-vesta-cream">VESTA</span>
                  <span className="text-[9px] font-mono tracking-widest text-vesta-gold px-1.5 py-0.5 rounded bg-vesta-gold/10 border border-vesta-gold/20 uppercase">AI</span>
                </div>
                <p className="text-[10px] tracking-widest uppercase text-vesta-muted font-light">Haute Couture Wardrobe Stylist</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[11px] text-vesta-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Open-Meteo Live Weather
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-vesta-gold animate-pulse" />
                5-Factor AI Scoring
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                LocalStorage Persistence
              </span>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-vesta-muted font-mono">
              "Your wardrobe. Your weather. Your style." — Built for the Vibe-Coding Challenge.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-vesta-muted">
              <Sparkles className="w-3 h-3 text-vesta-gold" />
              <span className="text-vesta-gold font-mono">VESTA</span>
              <span>· Vibe-Coding Edition · React + TypeScript + Vite</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
