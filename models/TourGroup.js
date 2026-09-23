import mongoose from 'mongoose';

const tourGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    rating: { type: Number, default: 4.8 },
    totalTours: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    badge: { type: String, default: 'ভেরিফায়েড' },
    color: { type: String, default: '#166B47' },
    logo: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: {
      tradeLicense: { type: Boolean, default: false },
      nidVerified: { type: Boolean, default: false },
      safetyScore: { type: Number, default: 80 },
    },
  },
  { timestamps: true }
);

export const TourGroup = mongoose.models.TourGroup || mongoose.model('TourGroup', tourGroupSchema);
