import { seatLockService } from '../services/seatLockService.js';

export const registerSeatSocket = (io) => {
  io.on('connection', (socket) => {
    // Client connected

    // When client wants to know active locks for a tour
    socket.on('seats:get', ({ tourId }) => {
      const lockedSeats = seatLockService.getActiveLockedSeats(tourId);
      socket.emit('seats:updated', { tourId, lockedSeats });
    });

    // When a user selects a seat to lock temporarily
    socket.on('seat:lock', ({ tourId, seatNumber, userId }) => {
      const result = seatLockService.acquireSeatsLock(tourId, [seatNumber], userId);
      if (result.success) {
        io.emit('seat:locked', { tourId, seatNumber, userId });
      } else {
        socket.emit('seat:conflict', { tourId, seatNumber, message: result.message });
      }
    });

    // When a user unselects a seat
    socket.on('seat:release', ({ tourId, seatNumber, userId }) => {
      seatLockService.releaseSeatsLock(tourId, [seatNumber], userId);
      io.emit('seat:released', { tourId, seatNumber });
    });
  });
};
