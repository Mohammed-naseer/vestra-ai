import mongoose, { Schema, Document } from 'mongoose';

export interface IWardrobeItem extends Document {
  userId: string;
  itemId: string; // Client-side generated ID for deduplication
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  colorHex?: string;
  secondaryColor?: string;
  material?: string;
  fabric?: string;
  season?: string;
  occasion?: string;
  dressCode?: string;
  imageUrl?: string;
  tags?: string[];
  warmthLevel: number;
  formalityLevel: number;
  type?: string;
  isCustomUpload?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WardrobeItemSchema = new Schema<IWardrobeItem>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: String, required: true }, // original client ID
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    color: { type: String, default: '' },
    colorHex: { type: String, default: '#888888' },
    secondaryColor: String,
    material: String,
    fabric: String,
    season: String,
    occasion: String,
    dressCode: String,
    imageUrl: { type: String, default: '' },
    tags: [String],
    warmthLevel: { type: Number, default: 2 },
    formalityLevel: { type: Number, default: 2 },
    type: String,
    isCustomUpload: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for efficient querying
WardrobeItemSchema.index({ userId: 1, category: 1 });
WardrobeItemSchema.index({ userId: 1, itemId: 1 }, { unique: true }); // prevent duplicates

export const WardrobeItem =
  mongoose.models.WardrobeItem ||
  mongoose.model<IWardrobeItem>('WardrobeItem', WardrobeItemSchema);
