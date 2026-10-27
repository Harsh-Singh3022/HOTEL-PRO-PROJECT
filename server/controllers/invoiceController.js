const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { generateOrUpdateInvoice } = require('../services/invoiceService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get invoice for a booking
// @route   GET /api/v1/invoices/booking/:bookingId
// @access  Owner / Staff / Admin
const getInvoiceByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (
      req.user.role === 'guest' &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to view this invoice');
    }

    const invoice = await generateOrUpdateInvoice(booking._id);
    const populated = await Invoice.findById(invoice._id).populate({
      path: 'booking',
      populate: [
        { path: 'guest' },
        { path: 'room', populate: { path: 'roomType' } },
      ],
    });

    return sendSuccess(res, 200, 'Invoice retrieved successfully', { invoice: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate or regenerate invoice
// @route   POST /api/v1/invoices/booking/:bookingId
// @access  Staff / Admin
const generateInvoice = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    const invoice = await generateOrUpdateInvoice(booking._id);
    const populated = await Invoice.findById(invoice._id).populate({
      path: 'booking',
      populate: [
        { path: 'guest' },
        { path: 'room', populate: { path: 'roomType' } },
      ],
    });

    return sendSuccess(res, 200, 'Invoice generated successfully', { invoice: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoiceByBooking,
  generateInvoice,
};
