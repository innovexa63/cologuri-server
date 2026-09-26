import express from 'express';
import {
  getTours,
  getTourById,
  createTour,
  updateTour,
  transferSeat,
  getJointTourMonitoring,
} from '../controllers/tourController.js';

const router = express.Router();

router.get('/', getTours);
router.post('/', createTour);
router.get('/:id', getTourById);
router.put('/:id', updateTour);
router.post('/:id/transfer-seat', transferSeat);
router.get('/:id/joint-monitor', getJointTourMonitoring);

export default router;
