import mongoose, { Schema, Document } from 'mongoose';

export interface IStylePreference extends Document {
  userId: string;
  preferredStyles: string[];
  preferredColors: string[];
  preferredOccasions: string[];
  preferredDressCodes: string[];
  updatedAt: Date;
}

const StylePreferenceSchema = new Schema<IStylePreference>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    preferredStyles: { type: [String], default: [] },
    preferredColors: { type: [String], default: [] },
    preferredOccasions: { type: [String], default: [] },
    preferredDressCodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const StylePreference =
  mongoose.models.StylePreference ||
  mongoose.model<IStylePreference>('StylePreference', StylePreferenceSchema);
