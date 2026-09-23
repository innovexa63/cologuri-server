import mongoose from 'mongoose';
import { Tour } from '../models/Tour.js';
import { allToursData } from '../../src/data/toursData.js';

export const getTours = async (req, res) => {
  try {
    const { destination, category } = req.query;
    let query = {};
    if (destination && destination !== 'all') {
      query.destination = destination;
    }
    if (category) {
      query.category = category;
    }

    let tours = [];
    if (mongoose.connection.readyState === 1) {
      try {
        tours = await Tour.find(query);
      } catch (e) {
        // Fallback to local data
      }
    }

    if (!tours || tours.length === 0) {
      tours = Object.values(allToursData).filter((t) => {
        if (destination && destination !== 'all' && t.destination !== destination) return false;
        return true;
      });
    }

    res.json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    let tour = null;

    try {
      tour = await Tour.findOne({ $or: [{ _id: id }, { slug: id }] });
    } catch (e) {
      // Fallback to local data
    }

    if (!tour) {
      tour = allToursData[id] || allToursData['sajek-1'];
    }

    res.json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
