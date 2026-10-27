const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const generateInvoiceNumber = require('../utils/invoiceNumberGenerator');

const generateOrUpdateInvoice = async (bookingId) => {
  const booking = await Booking.findById(bookingId)
    .populate({
      path: 'room',
      populate: { path: 'roomType' },
    })
    .populate('guest');

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Calculate nights
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const nights = Math.max(1, Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  const pricePerNight = booking.room.pricePerNight != null 
    ? booking.room.pricePerNight 
    : (booking.room.roomType?.basePrice || 0);

  const roomSubtotal = nights * pricePerNight;

  // Build items
  const items = [
    {
      description: `Room Stay: Room ${booking.room.roomNumber} (${booking.room.roomType?.name || 'Standard'}) - ${nights} Night(s)`,
      quantity: nights,
      unitPrice: pricePerNight,
      amount: roomSubtotal,
    },
  ];

  // Extra charges
  if (booking.extraCharges && booking.extraCharges.length > 0) {
    booking.extraCharges.forEach((charge) => {
      items.push({
        description: charge.description,
        quantity: 1,
        unitPrice: charge.amount,
        amount: charge.amount,
      });
    });
  }

  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const taxPercent = Number(process.env.TAX_PERCENT) || 12;
  const taxAmount = Math.round(((subtotal * taxPercent) / 100) * 100) / 100;
  const discount = 0;
  const totalAmount = Math.round((subtotal + taxAmount - discount) * 100) / 100;

  // Payments paid so far
  const payments = await Payment.find({
    booking: booking._id,
    status: 'Paid',
    type: 'Payment',
  });
  const refunds = await Payment.find({
    booking: booking._id,
    status: 'Paid',
    type: 'Refund',
  });

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0) -
    refunds.reduce((acc, r) => acc + r.amount, 0);
  
  const balanceDue = Math.max(0, Math.round((totalAmount - totalPaid) * 100) / 100);

  // Check if invoice already exists
  let invoice = await Invoice.findOne({ booking: booking._id });
  if (invoice) {
    invoice.items = items;
    invoice.subtotal = subtotal;
    invoice.taxPercent = taxPercent;
    invoice.taxAmount = taxAmount;
    invoice.discount = discount;
    invoice.totalAmount = totalAmount;
    invoice.paidAmount = totalPaid;
    invoice.balanceDue = balanceDue;
    await invoice.save();
  } else {
    invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      booking: booking._id,
      items,
      subtotal,
      taxPercent,
      taxAmount,
      discount,
      totalAmount,
      paidAmount: totalPaid,
      balanceDue,
    });
  }

  return invoice;
};

module.exports = {
  generateOrUpdateInvoice,
};
