require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Task = require('../models/Task');
const generateBookingRef = require('./bookingRefGenerator');
const generateInvoiceNumber = require('./invoiceNumberGenerator');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log('[Seeder] Clearing existing data...');
    await User.deleteMany();
    await RoomType.deleteMany();
    await Room.deleteMany();
    await Guest.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Invoice.deleteMany();
    await Task.deleteMany();

    console.log('[Seeder] Creating users...');
    const adminUser = await User.create({
      name: 'Eleanor Vance (Hotel General Manager)',
      email: 'admin@hotelpro.com',
      phone: '+1-555-0100',
      password: 'Admin@123',
      role: 'admin',
      designation: 'General Manager',
      isActive: true,
      address: { line1: '100 Ocean Blvd', city: 'Miami', state: 'FL', country: 'USA', zip: '33101' },
    });

    const receptionistUser = await User.create({
      name: 'Liam Chen (Front Desk Lead)',
      email: 'receptionist@hotelpro.com',
      phone: '+1-555-0101',
      password: 'Staff@123',
      role: 'staff',
      designation: 'Receptionist',
      isActive: true,
      address: { line1: '202 Bay Street', city: 'Miami', state: 'FL', country: 'USA', zip: '33102' },
    });

    const housekeepingUser = await User.create({
      name: 'Maria Santos (Housekeeping Supervisor)',
      email: 'housekeeping@hotelpro.com',
      phone: '+1-555-0102',
      password: 'Staff@123',
      role: 'staff',
      designation: 'Housekeeping',
      isActive: true,
      address: { line1: '303 Palm Ave', city: 'Miami', state: 'FL', country: 'USA', zip: '33103' },
    });

    const managerUser = await User.create({
      name: 'Marcus Sterling (Operations Manager)',
      email: 'manager@hotelpro.com',
      phone: '+1-555-0103',
      password: 'Manager@123',
      role: 'staff',
      designation: 'Manager',
      isActive: true,
      address: { line1: '404 Grand Way', city: 'Miami', state: 'FL', country: 'USA', zip: '33104' },
    });

    const guestUser = await User.create({
      name: 'Aarav Sharma',
      email: 'guest@example.com',
      phone: '+1-555-0199',
      password: 'Guest@123',
      role: 'guest',
      isActive: true,
      address: { line1: '77 Sunset Strip', city: 'Los Angeles', state: 'CA', country: 'USA', zip: '90069' },
    });

    console.log('[Seeder] Creating room types...');
    const standardType = await RoomType.create({
      name: 'Standard Queen Room',
      description: 'Refined Scandinavian architecture featuring a premium queen bed, blonde oak finishes, ergonomic work desk, high-speed WiFi, and rainforest shower.',
      location: 'Stockholm & London Boutique Quarter',
      patternStyle: 'Nordic Oak & Herringbone Parquet',
      basePrice: 120,
      capacity: 2,
      amenities: ['High-speed WiFi', 'Air Conditioning', 'Flat-screen TV', 'Coffee Maker', 'Safe', 'Daily Housekeeping'],
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const deluxeType = await RoomType.create({
      name: 'Deluxe Ocean View',
      description: 'Breathtaking coastal vistas with private veranda, king-size bed, Italian marble bath, and hand-painted ceramic detailing.',
      location: 'Amalfi Coast & Santorini Cliffside',
      patternStyle: 'Mediterranean Majolica Tile & Whitewashed Plaster',
      basePrice: 180,
      capacity: 2,
      amenities: ['Ocean View', 'Private Balcony', 'King Bed', 'Marble Bathroom', 'High-speed WiFi', 'Smart TV', 'Minibar', 'Bathrobes'],
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const executiveType = await RoomType.create({
      name: 'Executive Suite',
      description: 'Metropolitan suite with separate living parlor, Nero Marquina marble wet bar, Nespresso bar, and panoramic city skyline vistas.',
      location: 'Manhattan Skyline & Tokyo Ginza',
      patternStyle: 'Contemporary Nero Marquina & Shoji Wood Lattice',
      basePrice: 260,
      capacity: 3,
      amenities: ['Separate Living Area', 'Executive Lounge Access', 'King Bed & Sofa Bed', 'Nespresso Machine', 'Wet Bar', 'Deep Soaking Tub', 'Complimentary Wine'],
      images: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const familyType = await RoomType.create({
      name: 'Family Garden Suite',
      description: 'Dual-bedroom tropical villa with open-air terrace leading directly into lush botanical gardens and serene pool.',
      location: 'Ubud Rainforest & Coral Lagoon',
      patternStyle: 'Balinese Hand-Carved Teak & Natural Basalt Stone',
      basePrice: 320,
      capacity: 4,
      amenities: ['Two Bedrooms', 'Private Garden Terrace', 'Kitchenette', 'Dining Table', 'Kids Play Corner', 'Free High-Speed WiFi', 'Streaming Services'],
      images: [
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    const presidentialType = await RoomType.create({
      name: 'Presidential Penthouse',
      description: 'The pinnacle of global opulence. Panoramic rooftop terrace, heated private infinity jacuzzi, Arabesque gold geometric patterns, and butler service.',
      location: 'Palm Jumeirah Crest, Dubai',
      patternStyle: 'Arabesque Gilded Geometric Brass & Calacatta Gold Marble',
      basePrice: 550,
      capacity: 6,
      amenities: ['Private Rooftop Jacuzzi', '24/7 Butler Service', 'Full Chef Kitchen', 'Grand Piano', 'Sauna', 'Chauffeured Airport Transfer', 'Premium Wine Cellar'],
      images: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      ],
    });

    console.log('[Seeder] Creating rooms with unique locations and architectural patterns...');
    const roomConfigs = [
      {
        roomNumber: '101',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 120,
        status: 'Available',
        location: 'Stockholm Archipelago Wing, Sweden',
        patternStyle: 'Nordic Blonde Oak & Muted Linen',
        images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '102',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 125,
        status: 'Occupied',
        location: 'Kensington Heritage Quarter, London, UK',
        patternStyle: 'British Herringbone Parquet & Deep Velvet',
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '103',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 130,
        status: 'Cleaning',
        location: 'Zermatt Alpine Valley, Swiss Alps',
        patternStyle: 'Swiss Pine Timber & Chiseled Granite',
        images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '104',
        roomType: standardType._id,
        floor: 1,
        pricePerNight: 120,
        status: 'Available',
        location: 'Mitte Cultural District, Berlin, Germany',
        patternStyle: 'Bauhaus Terrazzo & Modernist Steel Geometry',
        images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '201',
        roomType: deluxeType._id,
        floor: 2,
        pricePerNight: 180,
        status: 'Available',
        location: 'Positano Coastal Bluff, Amalfi, Italy',
        patternStyle: 'Mediterranean Majolica Ceramic Tile & Terracotta',
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '202',
        roomType: deluxeType._id,
        floor: 2,
        pricePerNight: 190,
        status: 'Occupied',
        location: 'Caldera Cliffside, Oia, Santorini, Greece',
        patternStyle: 'Cycladic Whitewashed Cave Plaster & Cobalt Accents',
        images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '203',
        roomType: deluxeType._id,
        floor: 2,
        pricePerNight: 185,
        status: 'Maintenance',
        location: 'Ocean Drive Promenade, South Beach Miami, USA',
        patternStyle: 'Art Deco Pastel Geometry & Palm Motifs',
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '204',
        roomType: deluxeType._id,
        floor: 2,
        pricePerNight: 210,
        status: 'Available',
        location: 'Coral Barrier Lagoon, Bora Bora, French Polynesia',
        patternStyle: 'Polynesian Woven Bamboo & Exotic Thatched Teak',
        images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '301',
        roomType: executiveType._id,
        floor: 3,
        pricePerNight: 260,
        status: 'Available',
        location: 'Tribeca High-Rise Tower, Manhattan, New York',
        patternStyle: 'Metropolitan Glass Curtain & Nero Marquina Marble',
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '302',
        roomType: executiveType._id,
        floor: 3,
        pricePerNight: 275,
        status: 'Occupied',
        location: 'Ginza Avenue Tower, Tokyo, Japan',
        patternStyle: 'Japanese Hinoki Wood & Shoji Lattice Screen',
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '401',
        roomType: familyType._id,
        floor: 4,
        pricePerNight: 320,
        status: 'Available',
        location: 'Ayung River Sanctuary, Ubud, Bali, Indonesia',
        patternStyle: 'Balinese Intricate Teak Carving & Natural Basalt Stone',
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
      },
      {
        roomNumber: '501',
        roomType: presidentialType._id,
        floor: 5,
        pricePerNight: 550,
        status: 'Available',
        location: 'Palm Jumeirah Crest Skydeck, Dubai, UAE',
        patternStyle: 'Arabesque Gilded Geometric Brass & Calacatta Gold Marble',
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
      },
    ];

    const rooms = await Room.insertMany(roomConfigs);

    console.log('[Seeder] Creating guests...');
    const guest1 = await Guest.create({
      user: guestUser._id,
      fullName: 'Aarav Sharma',
      email: 'guest@example.com',
      phone: '+1-555-0199',
      idProofType: 'Passport',
      idProofNumber: 'A98765432',
      address: { line1: '77 Sunset Strip', city: 'Los Angeles', state: 'CA', country: 'USA', zip: '90069' },
      preferences: 'Quiet high-floor room with feather pillows',
    });

    const guest2 = await Guest.create({
      fullName: 'Sophia Martinez',
      email: 'sophia.martinez@example.com',
      phone: '+1-555-0212',
      idProofType: 'Driving License',
      idProofNumber: 'DL-FL-449102',
      address: { line1: '120 Coral Way', city: 'Miami', state: 'FL', country: 'USA', zip: '33145' },
      preferences: 'Late checkout requested',
    });

    const guest3 = await Guest.create({
      fullName: 'David Sterling',
      email: 'david.sterling@example.com',
      phone: '+1-555-0345',
      idProofType: 'Aadhaar',
      idProofNumber: '887219920192',
      address: { line1: '45 Kensington St', city: 'London', state: 'England', country: 'UK', zip: 'W8 5TT' },
      preferences: 'Vegetarian dining requests',
    });

    console.log('[Seeder] Creating sample bookings, payments, and invoices...');
    
    // Booking 1: Active CheckedIn stay for Aarav in Room 102
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() - 1);
    const checkOut1 = new Date();
    checkOut1.setDate(checkOut1.getDate() + 2);

    const booking1 = await Booking.create({
      bookingRef: generateBookingRef(),
      guest: guest1._id,
      room: rooms.find((r) => r.roomNumber === '102')._id,
      bookedBy: guestUser._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      actualCheckIn: checkIn1,
      numGuests: 2,
      status: 'CheckedIn',
      totalAmount: 403.2, // 3 nights @ 120 + 12% tax
      paymentStatus: 'Paid',
      extraCharges: [{ description: 'Welcome Fruit Basket & Sparkling Water', amount: 35 }],
    });

    await Payment.create({
      booking: booking1._id,
      amount: 403.2,
      method: 'Card',
      status: 'Paid',
      transactionId: 'TXN-HP-001',
      type: 'Payment',
      paidAt: checkIn1,
      processedBy: receptionistUser._id,
      notes: 'Initial deposit & booking full payment',
    });

    await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      booking: booking1._id,
      items: [
        { description: 'Room Stay: Standard Queen Room - 3 Night(s)', quantity: 3, unitPrice: 120, amount: 360 },
        { description: 'Welcome Fruit Basket & Sparkling Water', quantity: 1, unitPrice: 35, amount: 35 },
      ],
      subtotal: 395,
      taxPercent: 12,
      taxAmount: 47.4,
      discount: 0,
      totalAmount: 442.4,
      paidAmount: 403.2,
      balanceDue: 39.2,
      issuedAt: checkIn1,
    });

    // Booking 2: Active stay for Sophia in Room 202
    const checkIn2 = new Date();
    const checkOut2 = new Date();
    checkOut2.setDate(checkOut2.getDate() + 3);

    const booking2 = await Booking.create({
      bookingRef: generateBookingRef(),
      guest: guest2._id,
      room: rooms.find((r) => r.roomNumber === '202')._id,
      bookedBy: receptionistUser._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      actualCheckIn: checkIn2,
      numGuests: 2,
      status: 'CheckedIn',
      totalAmount: 604.8, // 3 nights @ 180 + 12% tax
      paymentStatus: 'Paid',
    });

    await Payment.create({
      booking: booking2._id,
      amount: 604.8,
      method: 'UPI',
      status: 'Paid',
      transactionId: 'TXN-HP-002',
      type: 'Payment',
      paidAt: checkIn2,
      processedBy: receptionistUser._id,
      notes: 'Front-desk walk-in UPI payment',
    });

    await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      booking: booking2._id,
      items: [
        { description: 'Room Stay: Deluxe Ocean View - 3 Night(s)', quantity: 3, unitPrice: 180, amount: 540 },
      ],
      subtotal: 540,
      taxPercent: 12,
      taxAmount: 64.8,
      discount: 0,
      totalAmount: 604.8,
      paidAmount: 604.8,
      balanceDue: 0,
      issuedAt: checkIn2,
    });

    // Booking 3: Confirmed upcoming booking for David in Room 301
    const checkIn3 = new Date();
    checkIn3.setDate(checkIn3.getDate() + 2);
    const checkOut3 = new Date();
    checkOut3.setDate(checkOut3.getDate() + 5);

    const booking3 = await Booking.create({
      bookingRef: generateBookingRef(),
      guest: guest3._id,
      room: rooms.find((r) => r.roomNumber === '301')._id,
      bookedBy: receptionistUser._id,
      checkInDate: checkIn3,
      checkOutDate: checkOut3,
      numGuests: 2,
      status: 'Confirmed',
      totalAmount: 873.6,
      paymentStatus: 'Paid',
      specialRequests: 'High floor, early arrival around 1 PM',
    });

    await Payment.create({
      booking: booking3._id,
      amount: 873.6,
      method: 'Online',
      status: 'Paid',
      transactionId: 'TXN-HP-003',
      type: 'Payment',
      paidAt: new Date(),
      notes: 'Online pre-payment',
    });

    await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      booking: booking3._id,
      items: [
        { description: 'Room Stay: Executive Suite - 3 Night(s)', quantity: 3, unitPrice: 260, amount: 780 },
      ],
      subtotal: 780,
      taxPercent: 12,
      taxAmount: 93.6,
      discount: 0,
      totalAmount: 873.6,
      paidAmount: 873.6,
      balanceDue: 0,
      issuedAt: new Date(),
    });

    console.log('[Seeder] Creating tasks...');
    await Task.create({
      title: 'Room 103 Sanitation and Deep Cleaning',
      description: 'Guest checked out this morning. Complete linen change, sanitize bath, and restock toiletries.',
      room: rooms.find((r) => r.roomNumber === '103')._id,
      assignedTo: housekeepingUser._id,
      assignedBy: adminUser._id,
      status: 'InProgress',
      priority: 'High',
      dueDate: new Date(Date.now() + 3 * 3600 * 1000),
    });

    await Task.create({
      title: 'Room 203 AC Compressor Inspection',
      description: 'AC unit reported making slight vibration. HVAC technician inspection required.',
      room: rooms.find((r) => r.roomNumber === '203')._id,
      assignedTo: managerUser._id,
      assignedBy: adminUser._id,
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000),
    });

    await Task.create({
      title: 'Audit Front Desk Cash Drawer',
      description: 'Perform end-of-shift cash drawer audit and reconcile card receipts with POS summary.',
      room: null,
      assignedTo: receptionistUser._id,
      assignedBy: managerUser._id,
      status: 'Pending',
      priority: 'Low',
      dueDate: new Date(Date.now() + 8 * 3600 * 1000),
    });

    console.log('==================================================');
    console.log(' HotelPro Database Seeded Successfully!');
    console.log('==================================================');
    console.log(' Admin Credentials:');
    console.log('   Email:    admin@hotelpro.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log(' Staff Credentials:');
    console.log('   Receptionist: receptionist@hotelpro.com / Staff@123');
    console.log('   Housekeeping: housekeeping@hotelpro.com / Staff@123');
    console.log('   Manager:      manager@hotelpro.com      / Manager@123');
    console.log('');
    console.log(' Guest Credentials:');
    console.log('   Email:    guest@example.com');
    console.log('   Password: Guest@123');
    console.log('==================================================');

    if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Error]:', error);
    if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
      process.exit(1);
    }
    throw error;
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Destroying all data...');
    await User.deleteMany();
    await RoomType.deleteMany();
    await Room.deleteMany();
    await Guest.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Invoice.deleteMany();
    await Task.deleteMany();
    console.log('[Seeder] All data deleted successfully!');
    if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder Destroy Error]:', error);
    if (process.argv[1] && process.argv[1].endsWith('seeder.js')) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    seedData();
  }
}

module.exports = { seedData, destroyData };
