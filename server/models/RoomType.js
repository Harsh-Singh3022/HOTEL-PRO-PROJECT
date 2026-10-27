const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a room type name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      default: 'Global Luxury Collection',
      trim: true,
    },
    patternStyle: {
      type: String,
      default: 'Architectural Contemporary',
      trim: true,
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price per night'],
      min: [0, 'Base price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide max guest capacity'],
      min: [1, 'Capacity must be at least 1'],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoomType', roomTypeSchema);
