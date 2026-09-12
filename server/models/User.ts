import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  name: string;
  email?: string;
  profile: {
    clothingPreference: 'menswear' | 'womenswear' | 'unisex';
    fit: 'relaxed' | 'regular' | 'tailored';
    style: 'minimal' | 'classic' | 'elegant' | 'streetwear' | 'trendy';
    colorPalette: 'neutral' | 'dark' | 'bright' | 'earth' | 'any';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'VESTA User' },
    email: { type: String },
    profile: {
      clothingPreference: {
        type: String,
        enum: ['menswear', 'womenswear', 'unisex'],
        default: 'unisex',
      },
      fit: {
        type: String,
        enum: ['relaxed', 'regular', 'tailored'],
        default: 'regular',
      },
      style: {
        type: String,
        enum: ['minimal', 'classic', 'elegant', 'streetwear', 'trendy'],
        default: 'classic',
      },
      colorPalette: {
        type: String,
        enum: ['neutral', 'dark', 'bright', 'earth', 'any'],
        default: 'any',
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
