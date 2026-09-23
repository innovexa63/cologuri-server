import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true },
    tourId: { type: String, required: true },
    tourTitle: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerGender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
    seats: [{ type: String, required: true }],
    boardingPoint: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'cash', 'sslcommerz'], default: 'bkash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    referralCode: { type: String, default: null },
  },
  { timestamps: true }
);

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
