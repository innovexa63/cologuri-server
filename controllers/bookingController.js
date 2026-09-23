import { Booking } from '../models/Booking.js';
import { Tour } from '../models/Tour.js';
import { seatLockService } from '../services/seatLockService.js';
import { notificationService } from '../services/notificationService.js';
import { allToursData } from '../../src/data/toursData.js';

export const lockSeats = async (req, res) => {
  try {
    const { tourId, seats, userId } = req.body;

    if (!tourId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'সঠিক ট্যুর আইডি এবং সিট নম্বর প্রদান করুন।' });
    }

    // Check if seats already permanently booked in DB or mock data
    const tour = allToursData[tourId];
    if (tour && tour.busInfo && tour.busInfo.bookedSeats) {
      const alreadyBooked = seats.find((s) => tour.busInfo.bookedSeats.includes(s));
      if (alreadyBooked) {
        return res.status(409).json({
          success: false,
          conflictSeat: alreadyBooked,
          message: `সিট ${alreadyBooked} ইতিমধ্যে অন্য একজন বুক করে ফেলেছেন।`,
        });
      }
    }

    // Attempt atomic lock
    const lockResult = seatLockService.acquireSeatsLock(tourId, seats, userId || 'guest');
    if (!lockResult.success) {
      return res.status(409).json(lockResult);
    }

    // Emit live socket event to all clients if io instance available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('seats:updated', {
        tourId,
        lockedSeats: seatLockService.getActiveLockedSeats(tourId),
      });
    }

    res.json({
      success: true,
      message: 'সিট সফলভাবে লক করা হয়েছে। ১০ মিনিটের মধ্যে পেমেন্ট সম্পন্ন করুন।',
      lockedSeats: lockResult.lockedSeats,
      expiresAt: lockResult.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const {
      tourId,
      customerName,
      customerPhone,
      customerGender,
      seats,
      boardingPoint,
      paymentMethod,
    } = req.body;

    if (!tourId || !seats || seats.length === 0 || !customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: 'সকল প্রয়োজনীয় তথ্য প্রদান করুন।' });
    }

    const tour = allToursData[tourId] || allToursData['sajek-1'];
    const totalAmount = seats.length * (tour ? tour.price : 4800);
    const bookingReference = 'GB-' + Math.floor(100000 + Math.random() * 900000);

    // Release temporary locks since booking is now confirmed
    seatLockService.releaseSeatsLock(tourId, seats);

    let booking;
    try {
      booking = await Booking.create({
        bookingReference,
        tourId,
        tourTitle: tour ? tour.title : 'ট্যুর প্যাকেজ',
        customerName,
        customerPhone,
        customerGender: customerGender || 'male',
        seats,
        boardingPoint: boardingPoint || 'আরামবাগ বাস টার্মিনাল',
        totalAmount,
        paymentMethod: paymentMethod || 'bkash',
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      });
    } catch (e) {
      // Offline fallback
      booking = {
        bookingReference,
        tourId,
        tourTitle: tour ? tour.title : 'ট্যুর প্যাকেজ',
        customerName,
        customerPhone,
        seats,
        boardingPoint,
        totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      };
    }

    // Update in-memory tour booked seats
    if (tour && tour.busInfo && Array.isArray(tour.busInfo.bookedSeats)) {
      tour.busInfo.bookedSeats = [...new Set([...tour.busInfo.bookedSeats, ...seats])];
      tour.seatsBooked = tour.busInfo.bookedSeats.length;
    }

    // Send SMS notification
    notificationService.sendBookingConfirmationSMS(customerPhone, {
      tourTitle: tour.title,
      seats,
      bookingReference,
      totalAmount,
    });

    // Notify connected clients via Socket.io
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('seat:booked', {
        tourId,
        seats,
        newBookedCount: tour.seatsBooked,
      });
    }

    res.status(201).json({
      success: true,
      message: 'বুকিং সফলভাবে সম্পন্ন হয়েছে!',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
