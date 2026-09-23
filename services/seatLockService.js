/**
 * Seat Lock Service with Race Condition Prevention
 * Provides atomic test-and-set locking with TTL to prevent concurrent double-booking.
 */

// In-memory atomic lock table: key = `${tourId}:${seatNumber}` -> { userId, expiresAt, lockedAt }
const activeLocks = new Map();

// Default lock TTL: 10 minutes (600,000 ms)
const DEFAULT_LOCK_TTL = 10 * 60 * 1000;

export const seatLockService = {
  /**
   * Attempt to lock one or more seats atomically.
   * If ANY seat is already locked by someone else or expired, rolls back and returns error.
   */
  acquireSeatsLock(tourId, seatNumbers, userId, ttl = DEFAULT_LOCK_TTL) {
    const now = Date.now();
    const lockedSuccessfully = [];

    // Clean up expired locks first
    this.cleanExpiredLocks();

    for (const seat of seatNumbers) {
      const lockKey = `${tourId}:${seat}`;
      const existing = activeLocks.get(lockKey);

      // Check if already locked by another user and not expired
      if (existing && existing.expiresAt > now && existing.userId !== userId) {
        // Rollback any seats locked in this atomic transaction
        for (const rollbackSeat of lockedSuccessfully) {
          activeLocks.delete(`${tourId}:${rollbackSeat}`);
        }
        return {
          success: false,
          conflictSeat: seat,
          message: `সিট ${seat} ইতিমধ্যে অন্য একজন বুকিং প্রক্রিয়ায় রেখেছেন। অনুগ্রহ করে অন্য সিট নির্বাচন করুন।`,
        };
      }

      // Lock the seat
      activeLocks.set(lockKey, {
        tourId,
        seatNumber: seat,
        userId,
        lockedAt: now,
        expiresAt: now + ttl,
      });
      lockedSuccessfully.push(seat);
    }

    return {
      success: true,
      lockedSeats: lockedSuccessfully,
      expiresAt: now + ttl,
    };
  },

  /**
   * Release seat lock (on cancel or payment success)
   */
  releaseSeatsLock(tourId, seatNumbers, userId) {
    for (const seat of seatNumbers) {
      const lockKey = `${tourId}:${seat}`;
      const existing = activeLocks.get(lockKey);
      if (existing && (existing.userId === userId || !userId)) {
        activeLocks.delete(lockKey);
      }
    }
  },

  /**
   * Get all currently active locked seats for a specific tour
   */
  getActiveLockedSeats(tourId) {
    this.cleanExpiredLocks();
    const now = Date.now();
    const locked = [];

    for (const [key, lock] of activeLocks.entries()) {
      if (lock.tourId === tourId && lock.expiresAt > now) {
        locked.push(lock.seatNumber);
      }
    }

    return locked;
  },

  /**
   * Clean expired locks periodically
   */
  cleanExpiredLocks() {
    const now = Date.now();
    for (const [key, lock] of activeLocks.entries()) {
      if (lock.expiresAt <= now) {
        activeLocks.delete(key);
      }
    }
  },
};
