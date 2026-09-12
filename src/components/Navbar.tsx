import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_CITIES, searchCityCoordinates } from '../services/weatherService';
import { 
  Sparkles, 
  CloudSun, 
  MapPin, 
  Navigation, 
  Search, 
  Thermometer, 
  Wind, 
  Droplets,
  Bookmark,
  Briefcase,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    weather, 
    loadingWeather, 
    activeTab, 
    setActiveTab, 
    setCityWeather, 
    useCurrentLocationWeather,
    savedOutfits,
    wardrobe,
    dbStatus,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleCitySelect = async (cityName: string, country?: string, lat?: number, lon?: number) => {
    setShowCityDropdown(false);
    await setCityWeather(cityName, country, lat, lon);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await searchCityCoordinates(searchQuery.trim());
    setIsSearching(false);
    if (result) {
      setShowCityDropdown(false);
      await setCityWeather(result.city, result.country, result.lat, result.lon);
      setSearchQuery('');
    } else {
      alert(`City "${searchQuery}" not found. Please try another location.`);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/5 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Editorial Monogram */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab('style')}
            className="cursor-pointer group flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-vesta-goldLight via-vesta-gold to-vesta-goldMuted flex items-center justify-center text-black font-bold shadow-luxury-glow transition-transform group-hover:scale-105">
              <span className="font-serif text-lg tracking-wider">V</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl tracking-[0.2em] font-semibold text-vesta-cream">VESTA</span>
                <span className="text-[10px] tracking-widest font-mono text-vesta-gold uppercase px-1.5 py-0.5 rounded bg-vesta-gold/10 border border-vesta-gold/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-vesta-muted font-light -mt-0.5 hidden sm:block">
                Haute Couture Stylist
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-vesta-card/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('style')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activeTab === 'style'
                  ? 'bg-vesta-surface text-vesta-goldLight shadow-sm border border-vesta-gold/20'
                  : 'text-vesta-muted hover:text-vesta-cream'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-vesta-gold" />
              Style Me
            </button>

            <button
              onClick={() => setActiveTab('wardrobe')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activeTab === 'wardrobe'
                  ? 'bg-vesta-surface text-vesta-goldLight shadow-sm border border-vesta-gold/20'
                  : 'text-vesta-muted hover:text-vesta-cream'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-vesta-gold" />
              My Wardrobe
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vesta-border text-vesta-muted">
                {wardrobe.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activeTab === 'saved'
                  ? 'bg-vesta-surface text-vesta-goldLight shadow-sm border border-vesta-gold/20'
                  : 'text-vesta-muted hover:text-vesta-cream'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-vesta-gold" />
              Saved Looks
              {savedOutfits.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-vesta-gold/20 text-vesta-goldLight font-bold">
                  {savedOutfits.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                activeTab === 'trips'
                  ? 'bg-vesta-surface text-vesta-goldLight shadow-sm border border-vesta-gold/20'
                  : 'text-vesta-muted hover:text-vesta-cream'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-vesta-gold" />
              Trip Packer
            </button>
          </nav>
        </div>

        {/* Live Weather Widget & Location Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-vesta-card hover:bg-vesta-cardHover border border-vesta-border hover:border-vesta-gold/40 transition-all text-xs"
            >
              <CloudSun className="w-4 h-4 text-vesta-gold" />
              {loadingWeather ? (
                <span className="text-vesta-muted animate-pulse">Syncing satellite...</span>
              ) : weather ? (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-vesta-cream">{weather.city}</span>
                  <span className="text-vesta-gold font-mono font-medium">{weather.temperature}°C</span>
                  <span className="hidden lg:inline text-[11px] text-vesta-muted border-l border-white/10 pl-2">
                    {weather.conditionText}
                  </span>
                </div>
              ) : (
                <span className="text-vesta-muted">Weather Offline</span>
              )}
              <ChevronDown className="w-3 h-3 text-vesta-muted ml-0.5" />
            </button>

            {/* Weather & Location Dropdown Modal */}
            {showCityDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-vesta-card/95 backdrop-blur-xl border border-vesta-gold/20 shadow-luxury p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-vesta-goldLight">
                    <MapPin className="w-3.5 h-3.5 text-vesta-gold" />
                    Fashion Capitals & Live Weather
                  </div>
                  <button
                    onClick={() => {
                      setShowCityDropdown(false);
                      useCurrentLocationWeather();
                    }}
                    title="Use GPS Geolocation"
                    className="p-1.5 rounded-lg bg-vesta-surface hover:bg-vesta-gold/20 text-vesta-gold transition-colors text-[11px] flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    GPS
                  </button>
                </div>

                {/* City Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any global city..."
                    className="w-full bg-vesta-surface border border-vesta-border rounded-lg py-1.5 pl-8 pr-3 text-xs text-vesta-cream placeholder:text-vesta-muted focus:outline-none focus:border-vesta-gold"
                  />
                  <Search className="w-3.5 h-3.5 text-vesta-muted absolute left-2.5 top-2.5" />
                  {isSearching && (
                    <span className="absolute right-2.5 top-2 text-[10px] text-vesta-gold animate-spin">
                      ⏳
                    </span>
                  )}
                </form>

                {/* Weather Breakdown (if active) */}
                {weather && (
                  <div className="mb-3 p-2.5 rounded-xl bg-vesta-surface/80 border border-white/5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-vesta-muted font-light">Condition</span>
                      <span className="font-medium text-vesta-cream">{weather.conditionText}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-[11px]">
                      <div className="flex items-center gap-1 text-vesta-muted">
                        <Thermometer className="w-3 h-3 text-vesta-gold" />
                        <span>Feels {weather.apparentTemperature}°</span>
                      </div>
                      <div className="flex items-center gap-1 text-vesta-muted">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        <span>{weather.humidity}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-vesta-muted">
                        <Wind className="w-3 h-3 text-teal-400" />
                        <span>{weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Popular Fashion Hub Presets */}
                <p className="text-[10px] uppercase font-mono tracking-wider text-vesta-muted mb-2">
                  Curated Fashion Hubs
                </p>
                <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {PRESET_CITIES.map((c) => (
                    <button
                      key={c.city}
                      onClick={() => handleCitySelect(c.city, c.country, c.lat, c.lon)}
                      className={`text-left px-2 py-1.5 rounded-lg text-xs transition-colors truncate ${
                        weather?.city.toLowerCase() === c.city.toLowerCase()
                          ? 'bg-vesta-gold/20 text-vesta-goldLight font-semibold'
                          : 'hover:bg-vesta-surface text-vesta-cream/80'
                      }`}
                    >
                      {c.city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DB Sync Status Indicator */}
          {dbStatus !== 'checking' && (
            <div
              title={dbStatus === 'synced' ? 'Cloud synced via MongoDB' : 'Saved locally — sync unavailable'}
              className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-2 py-1 rounded-lg bg-vesta-surface/60 border border-white/5"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  dbStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className={dbStatus === 'synced' ? 'text-emerald-400' : 'text-amber-400'}>
                {dbStatus === 'synced' ? 'Synced' : 'Offline'}
              </span>
            </div>
          )}

          {/* User Profile Monogram Badge */}
          <div className="w-8 h-8 rounded-full ring-1 ring-vesta-gold/30 bg-vesta-surface flex items-center justify-center text-xs font-serif text-vesta-gold font-medium">
            VIP
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('style')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'style' ? 'text-vesta-gold font-semibold' : 'text-vesta-muted'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Style Me
        </button>
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'wardrobe' ? 'text-vesta-gold font-semibold' : 'text-vesta-muted'
          }`}
        >
          <Layers className="w-4 h-4" />
          Wardrobe ({wardrobe.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'saved' ? 'text-vesta-gold font-semibold' : 'text-vesta-muted'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved ({savedOutfits.length})
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'trips' ? 'text-vesta-gold font-semibold' : 'text-vesta-muted'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Trips
        </button>
      </div>
    </header>
  );
};
