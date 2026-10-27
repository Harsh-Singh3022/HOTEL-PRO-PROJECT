const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Check if a room is available for given dates
 * PRD 7.3: existing.checkIn < new.checkOut AND existing.checkOut > new.checkIn
 * for status in ['Confirmed', 'CheckedIn']
 */
const isRoomAvailable = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  const query = {
    room: roomId,
    status: { $in: ['Confirmed', 'CheckedIn'] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
};

/**
 * Calculate total price for stay
 */
const calculateStayPrice = (pricePerNight, checkInDate, checkOutDate, extraCharges = []) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  const diffTime = Math.abs(checkOut - checkIn);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  
  const baseRoomTotal = nights * pricePerNight;
  const taxPercent = Number(process.env.TAX_PERCENT) || 12;
  const taxAmount = (baseRoomTotal * taxPercent) / 100;
  
  const extraChargesTotal = extraCharges.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalAmount = Math.round((baseRoomTotal + taxAmount + extraChargesTotal) * 100) / 100;

  return {
    nights,
    pricePerNight,
    baseRoomTotal,
    taxPercent,
    taxAmount,
    extraChargesTotal,
    totalAmount,
  };
};

/**
 * Calculate refund according to cancellation policy (PRD 9.3)
 * Free refund if > 24 hours before check-in date, else deduction
 */
const calculateCancellationRefund = (booking, totalPaid) => {
  const now = new Date();
  const checkIn = new Date(booking.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

  if (hoursUntilCheckIn >= 24) {
    // 100% refund
    return {
      refundEligible: true,
      refundAmount: totalPaid,
      policyNote: 'Full refund granted (canceled more than 24 hours before check-in).',
    };
  } else if (hoursUntilCheckIn > 0) {
    // Late cancellation: 50% refund or 1 night penalty
    const deduction = Math.min(totalPaid, booking.totalAmount * 0.5);
    const refundAmount = Math.max(0, totalPaid - deduction);
    return {
      refundEligible: true,
      refundAmount: Math.round(refundAmount * 100) / 100,
      policyNote: 'Late cancellation (within 24 hours). 50% cancellation fee applied.',
    };
  } else {
    // Same day / past check-in: no refund
    return {
      refundEligible: false,
      refundAmount: 0,
      policyNote: 'Cancellation on or after check-in date. No refund applicable.',
    };
  }
};

/**
 * Find all rooms available for date range and criteria
 */
const findAvailableRooms = async ({
  checkInDate,
  checkOutDate,
  guests,
  roomTypeId,
  minPrice,
  maxPrice,
}) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be after check-in date');
  }

  // 1. Find all conflicting room IDs
  const conflictingBookings = await Booking.find({
    status: { $in: ['Confirmed', 'CheckedIn'] },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  }).select('room');

  const unavailableRoomIds = conflictingBookings.map((b) => b.room);

  // 2. Query rooms not in unavailableRoomIds and not in Maintenance
  const roomFilter = {
    _id: { $nin: unavailableRoomIds },
    isActive: true,
    status: { $ne: 'Maintenance' },
  };

  if (roomTypeId) {
    roomFilter.roomType = roomTypeId;
  }

  const rooms = await Room.find(roomFilter).populate('roomType');

  // 3. Filter by capacity and price
  return rooms.filter((r) => {
    const effectivePrice = r.pricePerNight != null ? r.pricePerNight : (r.roomType?.basePrice || 0);
    const capacity = r.roomType?.capacity || 2;

    if (guests && capacity < Number(guests)) return false;
    if (minPrice && effectivePrice < Number(minPrice)) return false;
    if (maxPrice && effectivePrice > Number(maxPrice)) return false;
    return true;
  });
};

module.exports = {
  isRoomAvailable,
  calculateStayPrice,
  calculateCancellationRefund,
  findAvailableRooms,
};
