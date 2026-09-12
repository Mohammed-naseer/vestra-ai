import { ClothingItem } from '../types';

export const INITIAL_WARDROBE: ClothingItem[] = [
  // TOPS
  {
    id: 'top-1',
    name: 'Italian Linen Oxford Shirt',
    category: 'Tops',
    color: 'White',
    colorHex: '#FFFFFF',
    type: 'Button-Down Shirt',
    warmthLevel: 2,
    formalityLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    fabric: '100% Breathable Linen',
    tags: ['classic', 'minimal', 'breathable']
  },
  {
    id: 'top-2',
    name: 'Cashmere Ribbed Knit',
    category: 'Tops',
    color: 'Camel Beige',
    colorHex: '#C39B77',
    type: 'Crewneck Sweater',
    warmthLevel: 4,
    formalityLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80',
    fabric: 'Fine Grade Cashmere',
    tags: ['luxury', 'warm', 'classic']
  },
  {
    id: 'top-3',
    name: 'Heavyweight Supima Cotton Tee',
    category: 'Tops',
    color: 'Charcoal Black',
    colorHex: '#1C1C1E',
    type: 'T-Shirt',
    warmthLevel: 2,
    formalityLevel: 1,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
    fabric: '280gsm Supima Cotton',
    tags: ['streetwear', 'minimal', 'everyday']
  },
  {
    id: 'top-4',
    name: 'Silky Structured Camp Collar Shirt',
    category: 'Tops',
    color: 'Sage Olive',
    colorHex: '#708238',
    type: 'Camp Collar Shirt',
    warmthLevel: 2,
    formalityLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80',
    fabric: 'Tencel Lyocell',
    tags: ['trendy', 'summer', 'vacation']
  },

  // BOTTOMS
  {
    id: 'bottom-1',
    name: 'Pleated Wool-Blend Trousers',
    category: 'Bottoms',
    color: 'Midnight Navy',
    colorHex: '#1A2438',
    type: 'Tailored Trousers',
    warmthLevel: 3,
    formalityLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=700&q=80',
    fabric: 'Worsted Wool Blend',
    tags: ['formal', 'elegant', 'tailored']
  },
  {
    id: 'bottom-2',
    name: 'Slim Fit Japanese Selvedge Chinos',
    category: 'Bottoms',
    color: 'Sand Beige',
    colorHex: '#D9C8B4',
    type: 'Chinos',
    warmthLevel: 2,
    formalityLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=700&q=80',
    fabric: '100% Organic Twill',
    tags: ['smart-casual', 'versatile']
  },
  {
    id: 'bottom-3',
    name: 'Straight Leg Raw Indigo Denim',
    category: 'Bottoms',
    color: 'Deep Blue',
    colorHex: '#1B2A4A',
    type: 'Denim Jeans',
    warmthLevel: 3,
    formalityLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=700&q=80',
    fabric: '13.5oz Raw Selvedge',
    tags: ['streetwear', 'classic', 'durable']
  },

  // JACKETS / OUTERWEAR
  {
    id: 'jacket-1',
    name: 'Unstructured Double-Breasted Blazer',
    category: 'Jackets',
    color: 'Charcoal Grey',
    colorHex: '#383E45',
    type: 'Tailored Blazer',
    warmthLevel: 3,
    formalityLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=700&q=80',
    fabric: 'Flannel Wool',
    tags: ['formal', 'executive', 'dinner']
  },
  {
    id: 'jacket-2',
    name: 'Minimalist Suede Bomber Jacket',
    category: 'Jackets',
    color: 'Tobacco Tan',
    colorHex: '#8C5835',
    type: 'Leather & Suede Jacket',
    warmthLevel: 3,
    formalityLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80',
    fabric: 'Goat Suede Leather',
    tags: ['trendy', 'date-night', 'elevated']
  },
  {
    id: 'jacket-3',
    name: 'Bonded Wool Overcoat',
    category: 'Jackets',
    color: 'Jet Black',
    colorHex: '#111111',
    type: 'Long Overcoat',
    warmthLevel: 5,
    formalityLevel: 5,
    imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=700&q=80',
    fabric: 'Heavy Melton Wool',
    tags: ['cold-weather', 'gala', 'editorial']
  },

  // SHOES
  {
    id: 'shoes-1',
    name: 'Burnished Calfskin Penny Loafers',
    category: 'Shoes',
    color: 'Cognac Brown',
    colorHex: '#663B14',
    type: 'Loafers',
    warmthLevel: 2,
    formalityLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=700&q=80',
    fabric: 'Full-Grain Calf Leather',
    tags: ['classic', 'smart-casual', 'luxury']
  },
  {
    id: 'shoes-2',
    name: 'Low-Top Minimalist Court Sneakers',
    category: 'Shoes',
    color: 'Pure White',
    colorHex: '#F5F5F7',
    type: 'Leather Sneakers',
    warmthLevel: 2,
    formalityLevel: 2,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80',
    fabric: 'Nappa Leather & Margom Sole',
    tags: ['versatile', 'minimal', 'clean']
  },
  {
    id: 'shoes-3',
    name: 'Chelsea Boots with Goodyear Welt',
    category: 'Shoes',
    color: 'Obsidian Black',
    colorHex: '#1A1A1A',
    type: 'Boots',
    warmthLevel: 3,
    formalityLevel: 3,
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=700&q=80',
    fabric: 'Italian Leather',
    tags: ['date', 'rock-chic', 'sleek']
  },

  // ACCESSORIES
  {
    id: 'acc-1',
    name: 'Heritage Chronograph Watch with Alligator Strap',
    category: 'Accessories',
    color: 'Silver & Black',
    colorHex: '#C0C0C0',
    type: 'Luxury Timepiece',
    warmthLevel: 1,
    formalityLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80',
    fabric: 'Sapphire & Steel',
    tags: ['statement', 'executive']
  },
  {
    id: 'acc-2',
    name: 'Handwoven Mulberry Silk Scarf',
    category: 'Accessories',
    color: 'Emerald & Gold',
    colorHex: '#0E4D3E',
    type: 'Silk Scarf',
    warmthLevel: 2,
    formalityLevel: 4,
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=700&q=80',
    fabric: '100% Twill Silk',
    tags: ['chic', 'accent', 'gala']
  }
];
