const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { recordPayment, processRefund } = require('../services/paymentService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Record or process payment
// @route   POST /api/v1/payments
// @access  Private
const createPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, method, notes, transactionId } = req.body;

    if (!bookingId || !amount || !method) {
      return sendError(res, 400, 'Please provide bookingId, amount, and method');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    // Role check: Guest can only pay for their own booking
    if (
      req.user.role === 'guest' &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to pay for this booking');
    }

    const payment = await recordPayment({
      bookingId,
      amount,
      method,
      processedBy: req.user._id,
      transactionId,
      notes,
    });

    return sendSuccess(res, 201, 'Payment recorded successfully', { payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for a booking
// @route   GET /api/v1/payments/booking/:bookingId
// @access  Owner / Staff / Admin
const getBookingPayments = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return sendError(res, 404, 'Booking not found');
    }

    if (
      req.user.role === 'guest' &&
      booking.bookedBy.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'Not authorized to view payments for this booking');
    }

    const payments = await Payment.find({ booking: req.params.bookingId })
      .populate('processedBy', 'name role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Payments retrieved successfully', { payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/v1/payments/:id/refund
// @access  Staff / Admin
const refundPayment = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return sendError(res, 404, 'Original payment not found');
    }

    const refund = await processRefund({
      paymentId: payment._id,
      bookingId: payment.booking,
      amount: amount || payment.amount,
      reason: reason || 'Manual refund processing',
      processedBy: req.user._id,
    });

    return sendSuccess(res, 200, 'Refund processed successfully', { refund });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getBookingPayments,
  refundPayment,
};
