import mongoose from 'mongoose';
import { Tour } from '../models/Tour.js';
import { allToursData } from '../data/toursData.js';

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

export const createTour = async (req, res) => {
  try {
    const {
      title,
      destination = 'sajek',
      destinationName = 'সাজেক ভ্যালি',
      category = 'পাহাড় ও মেঘ',
      route,
      startDate,
      duration = '৩ রাত ২ দিন',
      price = 5200,
      seatsTotal = 40,
      busInfo = {},
      tourType = 'own', // 'own' | 'combine'
      partnerGroups = [],
      operator,
      image,
    } = req.body;

    if (!title || !route || !startDate) {
      return res.status(400).json({ success: false, message: 'ট্যুরের শিরোনাম, রুট এবং তারিখ আবশ্যক।' });
    }

    const isJointTour = tourType === 'combine' || (Array.isArray(partnerGroups) && partnerGroups.length > 1);
    const slug = (title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(100 + Math.random() * 900))
      .replace(/^-+|-+$/g, '') || ('tour-' + Date.now());
    const tourId = slug;

    const newTourData = {
      id: tourId,
      slug,
      title,
      destination,
      destinationName,
      category,
      route,
      startDate,
      duration,
      price: Number(price),
      seatsTotal: Number(seatsTotal),
      seatsBooked: 0,
      tourType: isJointTour ? 'combine' : 'own',
      isJointTour,
      partnerGroups: isJointTour ? partnerGroups : [],
      seatTransfers: [],
      operator: operator || {
        name: 'ঘুরি বাংলাদেশ',
        rating: 4.9,
        trips: 184,
      },
      tag: isJointTour ? '🤝 মাল্টি-গ্রুপ জয়েন্ট ট্যুর' : 'একক ট্যুর',
      tagColor: isJointTour ? '#C9622B' : '#166B47',
      image: image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      ],
      busInfo: {
        busName: busInfo.busName || 'শ্যামলী এন.আর ট্রাভেলস / শান্তি পরিবহন',
        busType: busInfo.busType || 'হিনো ১জে এসি লাক্সারি চেয়ার কোচ (২ x ২)',
        departureTime: busInfo.departureTime || 'রাত ১০:৩০ মিনিট',
        departurePlace: busInfo.departurePlace || 'আরামবাগ বাস টার্মিনাল, ঢাকা',
        dropOffPlace: busInfo.dropOffPlace || 'গন্তব্য বাস টার্মিনাল',
        totalSeats: Number(seatsTotal),
        bookedSeats: [],
        femaleSeats: ['C3', 'C4'],
      },
      inclusions: ['বাস টিকিট (যাওয়া-আসা)', 'প্রিমিয়াম রিসোর্ট/কটেজ রাত্রিযাপন', 'সব বেলার সুস্বাদু খাবার', 'অভিজ্ঞ গাইড ও সহায়তা'],
      exclusions: ['ব্যক্তিগত ওষুধ ও কেনাকাটা', 'অতিরিক্ত রুম সার্ভিস'],
      itinerary: [
        { day: 1, title: 'ঢাকা থেকে যাত্রা শুরু', activities: ['নির্দিষ্ট কাউন্টারে রিপোর্টিং', 'নৈশভ্রমণ শুরু'], meals: 'হাইওয়ে নিজস্ব', stay: 'এসি বাসে নৈশযাত্রা' },
        { day: 2, title: 'গন্তব্যে পৌঁছানো ও ভ্রমণ', activities: ['সকালের নাস্তা', 'রিসোর্টে চেক-ইন', 'সাইটসিয়িং', 'বারবিকিউ ডিনার'], meals: 'নাস্তা, লাঞ্চ, স্পেশাল ডিনার', stay: 'রিসোর্ট / কটেজ' },
        { day: 3, title: 'সূর্যোদয় ও ঢাকার উদ্দেশ্যে রওনা', activities: ['সূর্যোদয় দর্শন', 'চেক-আউট ও ঢাকার উদ্দেশ্যে যাত্রা'], meals: 'নাস্তা ও দুপুরের খাবার', stay: 'প্রত্যাবর্তন' },
      ],
      guidelines: ['জাতীয় পরিচয়পত্র বা স্টুডেন্ট আইডি সাথে রাখুন।', 'সময়নিষ্ঠতা বজায় রাখুন।'],
    };

    // Save to Mongo if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Tour.create(newTourData);
      } catch (e) {
        // Fallback to local
      }
    }

    // Save to in-memory store
    allToursData[tourId] = newTourData;

    // Broadcast via socket
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('tour:created', newTourData);
    }

    res.status(201).json({
      success: true,
      message: `${isJointTour ? 'যৌথ (Combine)' : 'একক (Own)'} ট্যুর সফলভাবে তৈরি হয়েছে!`,
      data: newTourData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      requestGroupId, // ID of the group attempting the update
      title,
      price,
      discount,
      originalPrice,
      customTitle,
      route,
      startDate,
      duration,
      destination,
      busInfo,
      partnerGroups,
    } = req.body;

    let tour = null;
    if (mongoose.connection.readyState === 1) {
      try {
        tour = await Tour.findOne({ $or: [{ _id: id }, { slug: id }] });
      } catch (e) {}
    }
    if (!tour) {
      tour = allToursData[id] || allToursData['sajek-1'];
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'ট্যুর প্যাকেজ পাওয়া যায়নি।' });
    }

    const creatorId = tour.creatorGroupId || tour.operator?.id || 'tg1';
    const isCreator = !requestGroupId || requestGroupId === creatorId;

    if (isCreator) {
      // Creator can update everything
      if (title !== undefined) tour.title = title;
      if (route !== undefined) tour.route = route;
      if (startDate !== undefined) tour.startDate = startDate;
      if (duration !== undefined) tour.duration = duration;
      if (destination !== undefined) tour.destination = destination;
      if (price !== undefined) tour.price = Number(price);
      if (busInfo !== undefined) tour.busInfo = { ...tour.busInfo, ...busInfo };
      if (partnerGroups !== undefined) tour.partnerGroups = partnerGroups;
    } else {
      // Non-creator (Partner group admin):
      // LOCKED: Route, Destination, StartDate, Duration, Bus details, Seat Allocation
      // PERMITTED: Custom Title, Custom Price, Custom Discount for their group
      if (!tour.partnerGroups) tour.partnerGroups = [];
      const partner = tour.partnerGroups.find((p) => p.groupId === requestGroupId || p.groupSlug === requestGroupId);

      if (partner) {
        if (customTitle !== undefined) partner.customTitle = customTitle;
        if (title !== undefined && !partner.customTitle) partner.customTitle = title;
        if (price !== undefined) partner.price = Number(price);
        if (discount !== undefined) partner.discount = Number(discount);
        if (originalPrice !== undefined) partner.originalPrice = Number(originalPrice);
      } else {
        return res.status(403).json({
          success: false,
          message: 'আপনি এই যৌথ ট্যুরের অনুমোদিত পার্টনার নন।',
        });
      }
    }

    // Save in DB
    if (mongoose.connection.readyState === 1 && typeof tour.save === 'function') {
      try {
        await tour.save();
      } catch (e) {}
    }

    // Sync in memory
    allToursData[id] = tour;

    // Broadcast via socket
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('tour:updated', tour);
    }

    res.json({
      success: true,
      message: isCreator
        ? 'ট্যুর প্যাকেজ সফলভাবে আপডেট করা হয়েছে।'
        : 'আপনার পার্টনার গ্রুপের কাস্টমাইজেশন (টাইটেল, মূল্য, ডিসকাউন্ট) সফলভাবে সংরক্ষিত হয়েছে।',
      data: tour,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const transferSeat = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      seatNumbers, // Array of seat strings e.g. ['E1', 'E2'] or single string
      fromGroupId,
      fromGroupName,
      toGroupId,
      toGroupName,
      note = '',
    } = req.body;

    const seatsToTransfer = Array.isArray(seatNumbers) ? seatNumbers : [seatNumbers];

    if (!seatsToTransfer.length || !fromGroupId || !toGroupId) {
      return res.status(400).json({
        success: false,
        message: 'সিট নম্বর, প্রেরক গ্রুপ এবং প্রাপক গ্রুপ আবশ্যক।',
      });
    }

    let tour = null;
    if (mongoose.connection.readyState === 1) {
      try {
        tour = await Tour.findOne({ $or: [{ _id: id }, { slug: id }] });
      } catch (e) {}
    }
    if (!tour) {
      tour = allToursData[id] || allToursData['sajek-1'];
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'ট্যুর প্যাকেজ পাওয়া যায়নি।' });
    }

    if (!tour.isJointTour && tour.tourType !== 'combine') {
      return res.status(400).json({ success: false, message: 'এটি একটি একক ট্যুর; সিট ট্রান্সফার শুধুমাত্র যৌথ (Combine) ট্যুরের জন্য প্রযোজ্য।' });
    }

    const bookedSeats = (tour.busInfo && tour.busInfo.bookedSeats) || tour.bookedSeats || [];

    // Verify none of the seats are booked
    for (const seatNo of seatsToTransfer) {
      if (bookedSeats.includes(seatNo)) {
        return res.status(400).json({
          success: false,
          message: `সিট ${seatNo} ইতিমধ্যে বিক্রি হয়ে গেছে; বিক্রি হওয়া সিট অন্য গ্রুপে ট্রান্সফার করা যাবে না।`,
        });
      }
    }

    if (!tour.partnerGroups) {
      tour.partnerGroups = [];
    }

    const fromPartner = tour.partnerGroups.find((g) => g.groupId === fromGroupId || g.groupSlug === fromGroupId);
    const toPartner = tour.partnerGroups.find((g) => g.groupId === toGroupId || g.groupSlug === toGroupId);

    if (fromPartner) {
      fromPartner.allocatedSeats = (fromPartner.allocatedSeats || []).filter((s) => !seatsToTransfer.includes(s));
    }
    if (toPartner) {
      toPartner.allocatedSeats = [...new Set([...(toPartner.allocatedSeats || []), ...seatsToTransfer])];
    }

    if (!tour.seatTransfers) {
      tour.seatTransfers = [];
    }

    const newTransferRecords = seatsToTransfer.map((seatNo) => ({
      seatNo,
      fromGroupId,
      fromGroupName: fromGroupName || fromPartner?.groupName || fromGroupId,
      toGroupId,
      toGroupName: toGroupName || toPartner?.groupName || toGroupId,
      transferredAt: new Date().toISOString(),
      note: note || 'অবিক্রিত সিট রেফারাল ট্রান্সফার',
    }));

    tour.seatTransfers.push(...newTransferRecords);

    // Save in DB
    if (mongoose.connection.readyState === 1 && typeof tour.save === 'function') {
      try {
        await tour.save();
      } catch (e) {}
    }

    // Keep memory in sync
    allToursData[id] = tour;

    // Broadcast live event via Socket.io
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.emit('tour:seat-transferred', {
        tourId: id,
        seats: seatsToTransfer,
        fromGroup: fromGroupName || fromPartner?.groupName,
        toGroup: toGroupName || toPartner?.groupName,
        newTransferRecords,
        partnerGroups: tour.partnerGroups,
      });
    }

    res.json({
      success: true,
      message: `${seatsToTransfer.join(', ')} সিট সফলভাবে ${toGroupName || toPartner?.groupName || 'পার্টনার গ্রুপের কাছে'} ট্রান্সফার করা হয়েছে!`,
      partnerGroups: tour.partnerGroups,
      seatTransfers: tour.seatTransfers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJointTourMonitoring = async (req, res) => {
  try {
    const { id } = req.params;
    let tour = null;

    if (mongoose.connection.readyState === 1) {
      try {
        tour = await Tour.findOne({ $or: [{ _id: id }, { slug: id }] });
      } catch (e) {}
    }
    if (!tour) {
      tour = allToursData[id] || allToursData['sajek-1'];
    }

    if (!tour) {
      return res.status(404).json({ success: false, message: 'ট্যুর পাওয়া যায়নি।' });
    }

    const totalSeats = (tour.busInfo && tour.busInfo.totalSeats) || tour.seatsTotal || 40;
    const bookedSeats = (tour.busInfo && tour.busInfo.bookedSeats) || tour.bookedSeats || [];
    const femaleSeats = (tour.busInfo && tour.busInfo.femaleSeats) || [];
    const partnerGroups = tour.partnerGroups || [];
    const seatTransfers = tour.seatTransfers || [];

    // Rows A to J, 4 seats per row
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatMatrix = [];

    rows.forEach((row) => {
      [1, 2, 3, 4].forEach((num) => {
        const seatNo = `${row}${num}`;
        const isBooked = bookedSeats.includes(seatNo);
        const isFemale = femaleSeats.includes(seatNo);

        // Find which group owns this seat
        const ownerGroup = partnerGroups.find((g) => (g.allocatedSeats || []).includes(seatNo));
        const lastTransfer = [...seatTransfers].reverse().find((t) => t.seatNo === seatNo);

        seatMatrix.push({
          seatNo,
          row,
          col: num,
          isBooked,
          isFemale,
          isTransferred: Boolean(lastTransfer),
          transferInfo: lastTransfer || null,
          ownerGroupId: ownerGroup?.groupId || 'unassigned',
          ownerGroupName: ownerGroup?.groupName || tour.operator?.name || 'অপ্রধান গ্রুপ',
          ownerColor: ownerGroup?.color || '#166B47',
        });
      });
    });

    // Group breakdown statistics
    const groupBreakdown = partnerGroups.map((group) => {
      const allocated = group.allocatedSeats || [];
      const bookedCount = allocated.filter((s) => bookedSeats.includes(s)).length;
      const unsold = allocated.length - bookedCount;
      const occupancyRate = allocated.length > 0 ? Math.round((bookedCount / allocated.length) * 100) : 0;

      return {
        groupId: group.groupId,
        groupName: group.groupName,
        groupSlug: group.groupSlug,
        color: group.color,
        totalAllocated: allocated.length,
        bookedCount,
        unsold,
        occupancyRate,
        allocatedSeats: allocated,
      };
    });

    res.json({
      success: true,
      data: {
        tourId: tour.id || id,
        title: tour.title,
        route: tour.route,
        startDate: tour.startDate,
        duration: tour.duration,
        busInfo: tour.busInfo,
        totalSeats,
        totalBooked: bookedSeats.length,
        totalUnsold: totalSeats - bookedSeats.length,
        overallOccupancy: Math.round((bookedSeats.length / totalSeats) * 100),
        partnerGroups,
        groupBreakdown,
        seatTransfers,
        seatMatrix,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
