const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Search and list guests
// @route   GET /api/v1/guests
// @access  Staff / Admin
const getGuests = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idProofNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Guest.countDocuments(query);
    const guests = await Guest.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Mask ID proof numbers in responses (Security / Section 15)
    const sanitizedGuests = guests.map((g) => {
      const obj = g.toObject();
      if (obj.idProofNumber && obj.idProofNumber.length > 4) {
        obj.idProofNumber = '****' + obj.idProofNumber.slice(-4);
      }
      return obj;
    });

    return sendSuccess(res, 200, 'Guests retrieved successfully', {
      guests: sanitizedGuests,
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

// @desc    Create guest record
// @route   POST /api/v1/guests
// @access  Staff / Admin
const createGuest = async (req, res, next) => {
  try {
    const { fullName, email, phone, idProofType, idProofNumber, address, preferences } = req.body;

    if (!fullName || !phone) {
      return sendError(res, 400, 'Full name and phone are required');
    }

    const guest = await Guest.create({
      fullName,
      email: email || '',
      phone,
      idProofType: idProofType || 'Passport',
      idProofNumber: idProofNumber || '',
      address: address || {},
      preferences: preferences || '',
    });

    return sendSuccess(res, 201, 'Guest created successfully', { guest });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guest details and booking history
// @route   GET /api/v1/guests/:id
// @access  Staff / Admin
const getGuestById = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('user', 'name email role');
    if (!guest) {
      return sendError(res, 404, 'Guest not found');
    }

    const history = await Booking.find({ guest: guest._id })
      .populate({ path: 'room', populate: { path: 'roomType' } })
      .sort({ createdAt: -1 });

    const obj = guest.toObject();
    if (obj.idProofNumber && obj.idProofNumber.length > 4) {
      obj.idProofNumber = '****' + obj.idProofNumber.slice(-4);
    }

    return sendSuccess(res, 200, 'Guest details retrieved', {
      guest: obj,
      bookingHistory: history,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update guest profile
// @route   PUT /api/v1/guests/:id
// @access  Staff / Admin
const updateGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!guest) {
      return sendError(res, 404, 'Guest not found');
    }

    return sendSuccess(res, 200, 'Guest updated successfully', { guest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuests,
  createGuest,
  getGuestById,
  updateGuest,
};
