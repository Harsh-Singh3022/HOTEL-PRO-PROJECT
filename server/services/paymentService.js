const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { generateOrUpdateInvoice } = require('./invoiceService');

const recordPayment = async ({
  bookingId,
  amount,
  method,
  processedBy = null,
  transactionId = null,
  notes = '',
}) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  const payment = await Payment.create({
    booking: booking._id,
    amount: Number(amount),
    method,
    status: 'Paid',
    type: 'Payment',
    transactionId: transactionId || ('TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase()),
    processedBy,
    notes,
  });

  // Calculate sum of payments
  const allPayments = await Payment.find({
    booking: booking._id,
    status: 'Paid',
    type: 'Payment',
  });
  const allRefunds = await Payment.find({
    booking: booking._id,
    status: 'Paid',
    type: 'Refund',
  });

  const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0) -
    allRefunds.reduce((acc, r) => acc + r.amount, 0);

  if (totalPaid >= booking.totalAmount) {
    booking.paymentStatus = 'Paid';
  } else if (totalPaid > 0) {
    booking.paymentStatus = 'PartiallyPaid';
  } else {
    booking.paymentStatus = 'Pending';
  }
  await booking.save();

  // Sync invoice
  await generateOrUpdateInvoice(booking._id);

  return payment;
};

const processRefund = async ({
  paymentId = null,
  bookingId,
  amount,
  reason,
  processedBy = null,
}) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  const refund = await Payment.create({
    booking: booking._id,
    amount: Number(amount),
    method: 'Online',
    status: 'Paid',
    type: 'Refund',
    transactionId: 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    processedBy,
    notes: reason || 'Cancellation refund',
  });

  booking.refundAmount = (booking.refundAmount || 0) + Number(amount);
  booking.paymentStatus = 'Refunded';
  await booking.save();

  await generateOrUpdateInvoice(booking._id);

  return refund;
};

module.exports = {
  recordPayment,
  processRefund,
};
