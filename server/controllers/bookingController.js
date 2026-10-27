const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Task = require('../models/Task');
const User = require('../models/User');
const {
  isRoomAvailable,
  calculateStayPrice,
  calculateCancellationRefund,
} = require('../services/bookingService');
const { generateOrUpdateInvoice } = require('../services/invoiceService');
const { processRefund } = require('../services/paymentService');
const generateBookingRef = require('../utils/bookingRefGenerator');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      room: roomId,
      checkInDate,
      checkOutDate,
      numGuests,
      specialRequests,
      guestInfo, // optional object for walk-ins / manual entry
    } = req.body;

    if (!roomId || !checkInDate || !checkOutDate || !numGuests) {
      return sendError(res, 400, 'Please provide room, checkInDate, checkOutDate, and numGuests');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return sendError(res, 400, 'Invalid date format');
    }

    if (checkIn < today) {
      return sendError(res, 400, 'Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      return sendError(res, 400, 'Check-out date must be after check-in date');
    }

    const room = await Room.findById(roomId).populate('roomType');
    if (!room || !room.isActive) {
      return sendError(res, 404, 'Room not found or inactive');
    }

    if (room.roomType && numGuests > room.roomType.capacity) {
      return sendError(
        res,
        400,
        `Selected room capacity is ${room.roomType.capacity} guests maximum`
      );
    }

    // Double-booking conflict check (PRD 7.3)
    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!available) {
      return sendError(
        res,
        409,
        'Room is not available for the selected dates. Please select different dates or room.'
      );
    }

    // Resolve Guest record
    let guest;
    if (req.user.role === 'guest') {
      guest = await Guest.findOne({ user: req.user._id });
      if (!guest) {
        guest = await Guest.create({
          user: req.user._id,
          fullName: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          address: req.user.address,
        });
      }
    } else if (guestInfo && guestInfo.fullName && guestInfo.phone) {
      // Staff booking walk-in guest
      guest = await Guest.create({
        fullName: guestInfo.fullName,
        email: guestInfo.email || '',
        phone: guestInfo.phone,
        idProofType: guestInfo.idProofType || 'Passport',
        idProofNumber: guestInfo.idProofNumber || '',
        address: guestInfo.address || {},
        preferences: guestInfo.preferences || '',
      });
    } else if (req.body.guestId) {
      guest = await Guest.findById(req.body.guestId);
      if (!guest) {
        return sendError(res, 404, 'Specified guest profile not found');
      }
    } else {
      return sendError(res, 400, 'Guest information is required');
    }

    const pricePerNight = room.pricePerNight != null ? room.pricePerNight : room.roomType.basePrice;
    const pricing = calculateStayPrice(pricePerNight, checkIn, checkOut);

    const booking = await Booking.create({
      bookingRef: generateBookingRef(),
      guest: guest._id,
      room: room._id,
      bookedBy: req.user._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numGuests: Number(numGuests),
      status: 'Confirmed',
      totalAmount: pricing.totalAmount,
      paymentStatus: 'Pending',
      specialRequests: specialRequests || '',
    });

    // Generate initial invoice
    const invoice = await generateOrUpdateInvoice(booking._id);

    const populated = await Booking.findById(booking._id)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .populate('bookedBy', 'name email phone role');

    return sendSuccess(res, 201, 'Booking created successfully', {
      booking: populated,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin/Staff)
// @route   GET /api/v1/bookings
// @access  Staff / Admin
const getAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      room,
      guest,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (room) query.room = room;
    if (guest) query.guest = guest;

    if (startDate && endDate) {
      query.checkInDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      query.bookingRef = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .populate('bookedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, 200, 'Bookings retrieved successfully', {
      bookings,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings (Guest)
// @route   GET /api/v1/bookings/my
// @access  Private (Owner)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ bookedBy: req.user._id })
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'User bookings retrieved', { bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/v1/bookings/:id
// @access  Owner / Staff / Admin
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest')
      .populate('bookedBy', 'name email phone role');

    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // Role check: Guests can only see their own bookings
    if (
      req.user.role === 'guest' &&
      booking.bookedBy._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to view this booking');
    }

    const invoice = await generateOrUpdateInvoice(booking._id);

    return sendSuccess(res, 200, 'Booking details retrieved', {
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify booking (dates, guests, requests)
// @route   PUT /api/v1/bookings/:id
// @access  Owner / Staff / Admin
const modifyBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // Access check
    if (
      req.user.role === 'guest' &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to modify this booking');
    }

    if (['CheckedOut', 'Cancelled'].includes(booking.status)) {
      return sendError(res, 400, `Cannot modify a booking that is ${booking.status}`);
    }

    const { checkInDate, checkOutDate, numGuests, specialRequests } = req.body;

    let checkIn = booking.checkInDate;
    let checkOut = booking.checkOutDate;

    if (checkInDate || checkOutDate) {
      checkIn = new Date(checkInDate || booking.checkInDate);
      checkOut = new Date(checkOutDate || booking.checkOutDate);

      if (checkOut <= checkIn) {
        return sendError(res, 400, 'Check-out date must be after check-in date');
      }

      const available = await isRoomAvailable(
        booking.room,
        checkIn,
        checkOut,
        booking._id
      );
      if (!available) {
        return sendError(res, 409, 'Room is not available for requested new dates');
      }

      booking.checkInDate = checkIn;
      booking.checkOutDate = checkOut;

      // Recalculate price
      const room = await Room.findById(booking.room).populate('roomType');
      const pricePerNight = room.pricePerNight != null ? room.pricePerNight : room.roomType.basePrice;
      const pricing = calculateStayPrice(
        pricePerNight,
        checkIn,
        checkOut,
        booking.extraCharges
      );
      booking.totalAmount = pricing.totalAmount;
    }

    if (numGuests) booking.numGuests = Number(numGuests);
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;

    await booking.save();
    const invoice = await generateOrUpdateInvoice(booking._id);

    return sendSuccess(res, 200, 'Booking updated successfully', {
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking & calculate refund
// @route   PATCH /api/v1/bookings/:id/cancel
// @access  Owner / Staff / Admin
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // Role check
    if (
      req.user.role === 'guest' &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to cancel this booking');
    }

    if (['CheckedOut', 'Cancelled'].includes(booking.status)) {
      return sendError(res, 400, `Booking is already ${booking.status}`);
    }

    const { reason } = req.body;
    booking.cancellationReason = reason || 'Guest cancellation';
    booking.status = 'Cancelled';

    // Calculate refund policy
    const Payment = require('../models/Payment');
    const payments = await Payment.find({
      booking: booking._id,
      status: 'Paid',
      type: 'Payment',
    });
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

    const refundCalc = calculateCancellationRefund(booking, totalPaid);
    if (refundCalc.refundAmount > 0) {
      await processRefund({
        bookingId: booking._id,
        amount: refundCalc.refundAmount,
        reason: refundCalc.policyNote,
        processedBy: req.user._id,
      });
    }

    await booking.save();

    // Release room if it was occupied
    await Room.findByIdAndUpdate(booking.room, { status: 'Available' });

    return sendSuccess(res, 200, 'Booking cancelled successfully', {
      booking,
      refund: refundCalc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in guest
// @route   PATCH /api/v1/bookings/:id/check-in
// @access  Staff / Admin
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (booking.status !== 'Confirmed') {
      return sendError(
        res,
        400,
        `Cannot check in. Booking status is ${booking.status} (must be Confirmed)`
      );
    }

    booking.status = 'CheckedIn';
    booking.actualCheckIn = new Date();
    await booking.save();

    // Set room to Occupied (FR-GUEST-3)
    await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });

    const populated = await Booking.findById(booking._id)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest');

    return sendSuccess(res, 200, 'Guest checked in successfully', {
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check out guest
// @route   PATCH /api/v1/bookings/:id/check-out
// @access  Staff / Admin
const checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (booking.status !== 'CheckedIn') {
      return sendError(
        res,
        400,
        `Cannot check out. Booking status is ${booking.status} (must be CheckedIn)`
      );
    }

    booking.status = 'CheckedOut';
    booking.actualCheckOut = new Date();
    await booking.save();

    // Set room to Cleaning (FR-GUEST-4)
    await Room.findByIdAndUpdate(booking.room, { status: 'Cleaning' });

    // Finalize invoice
    const invoice = await generateOrUpdateInvoice(booking._id);

    // Auto-create Housekeeping Task for cleaning room
    const housekeepingStaff = await User.findOne({
      role: 'staff',
      designation: /housekeeping/i,
      isActive: true,
    });

    if (housekeepingStaff) {
      await Task.create({
        title: `Clean Room after Check-out`,
        description: `Routine cleaning and sanitation for Room after checkout (Booking Ref: ${booking.bookingRef})`,
        room: booking.room,
        assignedTo: housekeepingStaff._id,
        assignedBy: req.user._id,
        status: 'Pending',
        priority: 'High',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .populate('guest');

    return sendSuccess(res, 200, 'Guest checked out successfully', {
      booking: populated,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add extra charge to active booking
// @route   POST /api/v1/bookings/:id/charges
// @access  Staff / Admin
const addExtraCharge = async (req, res, next) => {
  try {
    const { description, amount } = req.body;

    if (!description || !amount || Number(amount) <= 0) {
      return sendError(res, 400, 'Please provide description and valid positive amount');
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (['Cancelled', 'CheckedOut'].includes(booking.status)) {
      return sendError(res, 400, `Cannot add charges to ${booking.status} booking`);
    }

    booking.extraCharges.push({
      description,
      amount: Number(amount),
      date: new Date(),
    });

    // Recalculate booking total
    const room = await Room.findById(booking.room).populate('roomType');
    const pricePerNight = room.pricePerNight != null ? room.pricePerNight : room.roomType.basePrice;
    const pricing = calculateStayPrice(
      pricePerNight,
      booking.checkInDate,
      booking.checkOutDate,
      booking.extraCharges
    );
    booking.totalAmount = pricing.totalAmount;

    await booking.save();
    const invoice = await generateOrUpdateInvoice(booking._id);

    return sendSuccess(res, 200, 'Extra charge added successfully', {
      booking,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  modifyBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  addExtraCharge,
};
