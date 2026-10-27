const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
    },
    method: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Online'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Paid',
    },
    transactionId: {
      type: String,
      trim: true,
      default: () => 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    type: {
      type: String,
      enum: ['Payment', 'Refund'],
      default: 'Payment',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ booking: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
