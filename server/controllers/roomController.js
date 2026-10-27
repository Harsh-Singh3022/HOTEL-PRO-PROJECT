const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { findAvailableRooms } = require('../services/bookingService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all rooms with filtering and pagination
// @route   GET /api/v1/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const { roomType, status, floor, isActive, page = 1, limit = 50 } = req.query;
    const query = {};

    if (roomType) query.roomType = roomType;
    if (status) query.status = status;
    if (floor) query.floor = Number(floor);
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    } else {
      query.isActive = true; // default only active
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Room.countDocuments(query);
    const rooms = await Room.find(query)
      .populate('roomType')
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(Number(limit));

    return sendSuccess(res, 200, 'Rooms retrieved successfully', {
      rooms,
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

// @desc    Search available rooms for dates & guests
// @route   GET /api/v1/rooms/available
// @access  Public
const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests, type, minPrice, maxPrice } = req.query;

    if (!checkIn || !checkOut) {
      return sendError(res, 400, 'Please provide checkIn and checkOut dates');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return sendError(res, 400, 'Invalid date format');
    }

    if (checkOutDate <= checkInDate) {
      return sendError(res, 400, 'Check-out date must be after check-in date');
    }

    const availableRooms = await findAvailableRooms({
      checkInDate,
      checkOutDate,
      guests,
      roomTypeId: type,
      minPrice,
      maxPrice,
    });

    return sendSuccess(res, 200, 'Available rooms retrieved successfully', {
      count: availableRooms.length,
      rooms: availableRooms,
      searchCriteria: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guests || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get room by ID
// @route   GET /api/v1/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('roomType');
    if (!room) {
      return sendError(res, 404, 'Room not found');
    }

    return sendSuccess(res, 200, 'Room details retrieved', { room });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room
// @route   POST /api/v1/rooms
// @access  Admin
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, floor, pricePerNight, status, images } = req.body;

    const exists = await Room.findOne({ roomNumber: roomNumber.trim() });
    if (exists) {
      return sendError(res, 409, `Room number ${roomNumber} already exists`);
    }

    const room = await Room.create({
      roomNumber: roomNumber.trim(),
      roomType,
      floor,
      pricePerNight,
      status: status || 'Available',
      images: images || [],
      isActive: true,
    });

    const populated = await Room.findById(room._id).populate('roomType');
    return sendSuccess(res, 201, 'Room created successfully', { room: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details
// @route   PUT /api/v1/rooms/:id
// @access  Admin
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('roomType');

    if (!room) {
      return sendError(res, 404, 'Room not found');
    }

    return sendSuccess(res, 200, 'Room updated successfully', { room });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room status (Available, Occupied, Cleaning, Maintenance)
// @route   PATCH /api/v1/rooms/:id/status
// @access  Staff / Admin
const updateRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];

    if (!allowed.includes(status)) {
      return sendError(res, 400, `Invalid status. Must be one of: ${allowed.join(', ')}`);
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('roomType');

    if (!room) {
      return sendError(res, 404, 'Room not found');
    }

    return sendSuccess(res, 200, `Room status changed to ${status}`, { room });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete room (FR-ROOM-4: block if active/future bookings exist)
// @route   DELETE /api/v1/rooms/:id
// @access  Admin
const deleteRoom = async (req, res, next) => {
  try {
    const activeBooking = await Booking.findOne({
      room: req.params.id,
      status: { $in: ['Confirmed', 'CheckedIn'] },
      checkOutDate: { $gte: new Date() },
    });

    if (activeBooking) {
      return sendError(
        res,
        400,
        `Cannot delete room with active or upcoming bookings (Ref: ${activeBooking.bookingRef})`
      );
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!room) {
      return sendError(res, 404, 'Room not found');
    }

    return sendSuccess(res, 200, 'Room soft-deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getAvailableRooms,
  getRoomById,
  createRoom,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
};
