import express from 'express';
import { lockSeats, createBooking } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/lock', lockSeats);
router.post('/confirm', createBooking);

export default router;
