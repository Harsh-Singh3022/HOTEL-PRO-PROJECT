const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide guest full name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Please provide guest phone number'],
      trim: true,
    },
    idProofType: {
      type: String,
      enum: ['Passport', 'Aadhaar', 'Driving License', 'National ID', 'Voter ID', 'Other'],
      default: 'Passport',
    },
    idProofNumber: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      line1: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zip: { type: String, default: '' },
    },
    preferences: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

guestSchema.index({ fullName: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Guest', guestSchema);
