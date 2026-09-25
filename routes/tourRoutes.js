import express from 'express';
import {
  getTours,
  getTourById,
  createTour,
  transferSeat,
  getJointTourMonitoring,
} from '../controllers/tourController.js';

const router = express.Router();

router.get('/', getTours);
router.post('/', createTour);
router.get('/:id', getTourById);
router.post('/:id/transfer-seat', transferSeat);
router.get('/:id/joint-monitor', getJointTourMonitoring);

export default router;
