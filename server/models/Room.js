const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide a unique room number'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: [true, 'Please specify room type'],
    },
    floor: {
      type: Number,
      required: [true, 'Please specify floor number'],
    },
    pricePerNight: {
      type: Number,
      min: [0, 'Price per night cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    location: {
      type: String,
      default: 'Miami Beach Resort, FL',
      trim: true,
    },
    patternStyle: {
      type: String,
      default: 'Contemporary Luxury',
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ roomType: 1, status: 1 });

module.exports = mongoose.model('Room', roomSchema);
