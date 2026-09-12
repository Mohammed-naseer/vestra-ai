import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClothingItem, Category } from '../types';
import { Plus, Trash2, SlidersHorizontal, Image as ImageIcon, Sparkles, RefreshCw, X } from 'lucide-react';

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Shoes', 'Jackets', 'Accessories'];

export const WardrobePage: React.FC = () => {
  const { wardrobe, addItemToWardrobe, removeItemFromWardrobe, resetToDemoWardrobe } = useApp();
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for new item
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Tops');
  const [color, setColor] = useState('Midnight Black');
  const [colorHex, setColorHex] = useState('#121212');
  const [type, setType] = useState('');
  const [fabric, setFabric] = useState('');
  const [warmthLevel, setWarmthLevel] = useState(2);
  const [formalityLevel, setFormalityLevel] = useState(3);
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Quick category filters
  const filteredItems = activeCategory === 'All'
    ? wardrobe
    : wardrobe.filter(item => item.category === activeCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a piece name.');
      return;
    }

    const fallbackImages: Record<Category, string> = {
      'Tops': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
      'Bottoms': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
      'Shoes': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=700&q=80',
      'Jackets': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
      'Accessories': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80'
    };

    addItemToWardrobe({
      name: name.trim(),
      category,
      color,
      colorHex,
      type: type.trim() || `${category} Piece`,
      fabric: fabric.trim() || 'Premium Blend',
      warmthLevel,
      formalityLevel,
      imageUrl: imageUrl.trim() || fallbackImages[category],
    });

    // Reset Form
    setName('');
    setType('');
    setFabric('');
    setImageUrl('');
    setPreviewImage(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-vesta-gold">
              Digital Vault
            </span>
            <span className="text-vesta-border">•</span>
            <span className="text-[11px] text-vesta-muted">
              {wardrobe.length} Curated Items
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-vesta-cream">
            The Wardrobe Archive
          </h1>
          <p className="text-sm text-vesta-muted mt-1 max-w-xl">
            Manage your personal garment collection. VESTA crafts real-time climate recommendations directly from the items cataloged here.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDemoWardrobe}
            title="Reset to 14 curated high-fashion starter items"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-vesta-card hover:bg-vesta-cardHover border border-white/10 hover:border-vesta-gold/30 text-xs font-medium text-vesta-muted hover:text-vesta-gold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Capsule
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-vesta-gold to-vesta-goldMuted text-black font-semibold text-xs tracking-wide shadow-luxury-glow hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Garment
          </button>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
            activeCategory === 'All'
              ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/40 shadow-sm'
              : 'bg-vesta-card/60 text-vesta-muted hover:text-vesta-cream border border-white/5'
          }`}
        >
          All Pieces ({wardrobe.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = wardrobe.filter(i => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-vesta-gold/20 text-vesta-goldLight border border-vesta-gold/40 shadow-sm'
                  : 'bg-vesta-card/60 text-vesta-muted hover:text-vesta-cream border border-white/5'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Wardrobe Garments Grid */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md mx-auto border border-dashed border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-vesta-surface flex items-center justify-center mx-auto mb-4 text-vesta-gold">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg text-vesta-cream font-medium mb-1">No garments in {activeCategory}</h3>
          <p className="text-xs text-vesta-muted mb-6">
            Upload or add your clothing pieces so VESTA can synthesize personalized outfits.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-vesta-gold text-black font-semibold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Piece
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col justify-between border border-white/5 relative"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-vesta-surface overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.3';
                  }}
                />

                {/* Category & Custom badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-vesta-goldLight border border-white/10">
                    {item.category}
                  </span>
                  {item.isCustomUpload && (
                    <span className="text-[9px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/30 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      User
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Remove "${item.name}" from your wardrobe?`)) {
                      removeItemFromWardrobe(item.id);
                    }
                  }}
                  title="Remove piece"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Garment Details */}
              <div className="p-3.5 flex flex-col gap-1.5">
                <h4 className="text-xs font-semibold text-vesta-cream line-clamp-1 group-hover:text-vesta-goldLight transition-colors">
                  {item.name}
                </h4>
                <p className="text-[11px] text-vesta-muted line-clamp-1">
                  {item.type} {item.fabric ? `• ${item.fabric}` : ''}
                </p>

                {/* Color & Thermal Indicators */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: item.colorHex }}
                    />
                    <span className="text-vesta-muted">{item.color}</span>
                  </div>
                  <span className="text-vesta-gold font-mono">
                    W:{item.warmthLevel} F:{item.formalityLevel}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-vesta-card border border-vesta-gold/30 shadow-luxury overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-vesta-cream">
                  Add to Wardrobe Archive
                </h3>
                <p className="text-xs text-vesta-muted">Catalog a new garment with thermal and styling metadata.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-vesta-surface text-vesta-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-6 overflow-y-auto space-y-4">
              
              {/* Photo Upload or URL */}
              <div>
                <label className="block text-xs font-medium text-vesta-gold uppercase tracking-wider mb-2">
                  Garment Visual
                </label>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-vesta-border rounded-xl cursor-pointer hover:border-vesta-gold/50 bg-vesta-surface/50 transition-colors">
                    <ImageIcon className="w-6 h-6 text-vesta-muted mb-1" />
                    <span className="text-xs text-vesta-cream font-medium">Upload Photo</span>
                    <span className="text-[10px] text-vesta-muted">Local file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  {previewImage || imageUrl ? (
                    <div className="relative h-24 rounded-xl overflow-hidden border border-white/10 bg-black">
                      <img src={previewImage || imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="text-[11px] text-vesta-muted p-2 bg-vesta-surface/30 rounded-xl border border-white/5">
                      Or paste a high-res image URL below for direct web linking.
                    </div>
                  )}
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewImage(null);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full mt-2 bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                />
              </div>

              {/* Name & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Silk Knit Polo"
                    className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Garment Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Button-Down, Trousers"
                    className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                  />
                </div>
              </div>

              {/* Category & Fabric */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. 100% Cashmere, Linen"
                    className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                  />
                </div>
              </div>

              {/* Color Name & Color Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Color Name</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Charcoal Grey"
                    className="w-full bg-vesta-surface border border-vesta-border rounded-xl px-3 py-2 text-xs text-vesta-cream focus:outline-none focus:border-vesta-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vesta-muted mb-1">Color Shade</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-9 h-9 rounded-xl bg-transparent border border-vesta-border cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-vesta-muted">{colorHex}</span>
                  </div>
                </div>
              </div>

              {/* Warmth & Formality Sliders */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-vesta-muted">Warmth Level (1=Breezy Summer, 5=Heavy Winter)</span>
                    <span className="font-mono text-vesta-gold font-semibold">{warmthLevel}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={warmthLevel}
                    onChange={(e) => setWarmthLevel(parseInt(e.target.value))}
                    className="w-full accent-vesta-gold cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-vesta-muted">Formality Level (1=Casual Streetwear, 5=Black Tie)</span>
                    <span className="font-mono text-vesta-gold font-semibold">{formalityLevel}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(parseInt(e.target.value))}
                    className="w-full accent-vesta-gold cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-vesta-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-vesta-gold to-vesta-goldMuted text-black font-semibold text-xs tracking-wide shadow-luxury"
                >
                  Save to Wardrobe
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
