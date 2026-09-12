import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  userId: string;
  tripId: string; // original client-generated ID for deduplication
  destination: string;
  days: number;
  tripType: string;
  schedule: Record<string, any>[];
  packingChecklist: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    userId: { type: String, required: true, index: true },
    tripId: { type: String, required: true },
    destination: { type: String, required: true },
    days: { type: Number, required: true },
    tripType: { type: String, default: 'leisure' },
    schedule: { type: [Schema.Types.Mixed], default: [] },
    packingChecklist: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ userId: 1, tripId: 1 }, { unique: true }); // prevent duplicate saves

export const Trip =
  mongoose.models.Trip ||
  mongoose.model<ITrip>('Trip', TripSchema);
