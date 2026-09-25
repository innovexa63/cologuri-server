import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    destination: { type: String, required: true },
    destinationName: { type: String, required: true },
    category: { type: String, default: 'standard' },
    route: { type: String, required: true },
    startDate: { type: String, required: true },
    duration: { type: String, required: true },
    operator: {
      name: { type: String, required: true },
      rating: { type: Number, default: 4.8 },
      trips: { type: Number, default: 50 },
    },
    price: { type: Number, required: true },
    seatsTotal: { type: Number, required: true, default: 40 },
    seatsBooked: { type: Number, default: 0 },
    bookedSeats: [{ type: String }],
    femaleSeats: [{ type: String }],
    isJointTour: { type: Boolean, default: false },
    tourType: { type: String, enum: ['own', 'combine'], default: 'own' },
    partnerGroups: [
      {
        groupId: { type: String, required: true },
        groupName: { type: String, required: true },
        groupSlug: { type: String, required: true },
        color: { type: String, default: '#166B47' },
        allocatedSeats: [{ type: String }],
        bookedSeats: [{ type: String }],
      },
    ],
    seatTransfers: [
      {
        seatNo: { type: String, required: true },
        fromGroupId: { type: String, required: true },
        fromGroupName: { type: String, required: true },
        toGroupId: { type: String, required: true },
        toGroupName: { type: String, required: true },
        transferredAt: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
    tag: { type: String, default: 'লাইভ ট্যুর' },
    tagColor: { type: String, default: '#166B47' },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    busInfo: {
      busName: String,
      busType: String,
      departureTime: String,
      departurePlace: String,
      dropOffPlace: String,
    },
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: [
      {
        day: Number,
        title: String,
        activities: [String],
        meals: String,
        stay: String,
      },
    ],
    guidelines: [String],
    version: { type: Number, default: 0 }, // For optimistic locking
  },
  { timestamps: true }
);

export const Tour = mongoose.models.Tour || mongoose.model('Tour', tourSchema);
