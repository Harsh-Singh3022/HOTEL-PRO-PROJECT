const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Booking = require('../models/Booking');

let mongoServer;
let adminToken;
let guestToken;
let sampleRoomId;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create admin user
  const admin = await User.create({
    name: 'Test Admin',
    email: 'admin.test@hotelpro.com',
    phone: '1234567890',
    password: 'AdminPassword@123',
    role: 'admin',
  });

  // Create guest user
  const guestUser = await User.create({
    name: 'Test Guest',
    email: 'guest.test@hotelpro.com',
    phone: '0987654321',
    password: 'GuestPassword@123',
    role: 'guest',
  });

  await Guest.create({
    user: guestUser._id,
    fullName: guestUser.name,
    email: guestUser.email,
    phone: guestUser.phone,
  });

  // Logins to get tokens
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin.test@hotelpro.com', password: 'AdminPassword@123' });
  adminToken = adminRes.body.data.token;

  const guestRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'guest.test@hotelpro.com', password: 'GuestPassword@123' });
  guestToken = guestRes.body.data.token;

  // Create room type and room
  const roomType = await RoomType.create({
    name: 'Deluxe Test Suite',
    description: 'A test suite',
    basePrice: 150,
    capacity: 2,
    amenities: ['WiFi', 'AC'],
  });

  const room = await Room.create({
    roomNumber: 'T-101',
    roomType: roomType._id,
    floor: 1,
    pricePerNight: 150,
    status: 'Available',
  });
  sampleRoomId = room._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('HotelPro REST API Integration Tests', () => {
  // Test 1: Health check
  it('GET /api/v1/health should return 200 with status healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  // Test 2: Register with duplicate email -> 409
  it('POST /api/v1/auth/register with duplicate email returns 409', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Guest',
        email: 'guest.test@hotelpro.com',
        phone: '1122334455',
        password: 'ValidPassword@123',
      });
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  // Test 3: Login with wrong password -> 401
  it('POST /api/v1/auth/login with wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'guest.test@hotelpro.com',
        password: 'WrongPassword999',
      });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // Test 4: Access admin route with guest token -> 403
  it('GET /api/v1/users with guest token returns 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${guestToken}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // Test 5: Booking with check-out before check-in -> 400
  it('POST /api/v1/bookings with check-out before check-in returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        room: sampleRoomId,
        checkInDate: '2026-11-20',
        checkOutDate: '2026-11-18',
        numGuests: 2,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test 6: Create valid booking & invoice check
  let createdBookingId;
  it('POST /api/v1/bookings creates a booking and initial invoice', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        room: sampleRoomId,
        checkInDate: '2026-11-10',
        checkOutDate: '2026-11-13',
        numGuests: 2,
        specialRequests: 'Near elevator please',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.booking.bookingRef).toMatch(/^HP-\d{8}-[A-Z0-9]+$/);
    expect(res.body.data.invoice).toBeDefined();
    // 3 nights @ 150 = 450 + 12% tax (54) = 504
    expect(res.body.data.booking.totalAmount).toBe(504);

    createdBookingId = res.body.data.booking._id;
  });

  // Test 7: Overlapping booking on same room -> 409 Conflict (Critical Race/Double-Booking Test)
  it('POST /api/v1/bookings with overlapping dates returns 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        room: sampleRoomId,
        checkInDate: '2026-11-11', // overlaps with Nov 10 - Nov 13
        checkOutDate: '2026-11-15',
        numGuests: 1,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Room is not available');
  });

  // Test 8: Check-in updates room to Occupied and booking to CheckedIn
  it('PATCH /api/v1/bookings/:id/check-in updates room to Occupied', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${createdBookingId}/check-in`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('CheckedIn');

    const room = await Room.findById(sampleRoomId);
    expect(room.status).toBe('Occupied');
  });

  // Test 9: Check-out updates room to Cleaning and booking to CheckedOut
  it('PATCH /api/v1/bookings/:id/check-out updates room to Cleaning', async () => {
    const res = await request(app)
      .patch(`/api/v1/bookings/${createdBookingId}/check-out`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.booking.status).toBe('CheckedOut');

    const room = await Room.findById(sampleRoomId);
    expect(room.status).toBe('Cleaning');
  });
});
