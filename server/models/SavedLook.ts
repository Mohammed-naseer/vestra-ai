import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedLook extends Document {
  userId: string;
  outfitId: string; // original client outfit ID for deduplication
  name: string;
  items: Record<string, any>; // full outfit items as stored in frontend
  scores: Record<string, number>;
  occasion?: string;
  dressCode?: string;
  weather?: Record<string, any>;
  colorPalette?: string[];
  aiReasoning?: Record<string, any>;
  rating?: number;
  savedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedLookSchema = new Schema<ISavedLook>(
  {
    userId: { type: String, required: true, index: true },
    outfitId: { type: String, required: true },
    name: { type: String, required: true },
    items: { type: Schema.Types.Mixed, default: {} },
    scores: { type: Schema.Types.Mixed, default: {} },
    occasion: String,
    dressCode: String,
    weather: { type: Schema.Types.Mixed },
    colorPalette: [String],
    aiReasoning: { type: Schema.Types.Mixed },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    savedAt: String,
  },
  { timestamps: true }
);

// Compound indexes for performance
SavedLookSchema.index({ userId: 1, createdAt: -1 });
SavedLookSchema.index({ userId: 1, outfitId: 1 }, { unique: true }); // prevent duplicate saves

export const SavedLook =
  mongoose.models.SavedLook ||
  mongoose.model<ISavedLook>('SavedLook', SavedLookSchema);
