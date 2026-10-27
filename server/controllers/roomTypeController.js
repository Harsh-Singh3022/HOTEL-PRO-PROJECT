const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all room types
// @route   GET /api/v1/room-types
// @access  Public
const getRoomTypes = async (req, res, next) => {
  try {
    const roomTypes = await RoomType.find().sort({ basePrice: 1 });
    return sendSuccess(res, 200, 'Room types retrieved successfully', { roomTypes });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room type
// @route   POST /api/v1/room-types
// @access  Admin
const createRoomType = async (req, res, next) => {
  try {
    const { name, description, basePrice, capacity, amenities, images } = req.body;

    const exists = await RoomType.findOne({ name: name.trim() });
    if (exists) {
      return sendError(res, 409, 'Room type with this name already exists');
    }

    const roomType = await RoomType.create({
      name,
      description,
      basePrice,
      capacity,
      amenities: amenities || [],
      images: images || [],
    });

    return sendSuccess(res, 201, 'Room type created successfully', { roomType });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room type
// @route   PUT /api/v1/room-types/:id
// @access  Admin
const updateRoomType = async (req, res, next) => {
  try {
    const roomType = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!roomType) {
      return sendError(res, 404, 'Room type not found');
    }

    return sendSuccess(res, 200, 'Room type updated successfully', { roomType });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room type
// @route   DELETE /api/v1/room-types/:id
// @access  Admin
const deleteRoomType = async (req, res, next) => {
  try {
    const roomCount = await Room.countDocuments({ roomType: req.params.id });
    if (roomCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete room type: ${roomCount} room(s) are currently associated with it.`
      );
    }

    const roomType = await RoomType.findByIdAndDelete(req.params.id);
    if (!roomType) {
      return sendError(res, 404, 'Room type not found');
    }

    return sendSuccess(res, 200, 'Room type deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
