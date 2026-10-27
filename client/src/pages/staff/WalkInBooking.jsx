import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService, bookingService, paymentService } from '../../services/api';
import InvoiceModal from '../../components/common/InvoiceModal';

const WalkInBooking = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Form
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [numGuests, setNumGuests] = useState('1');
  const [instantCheckIn, setInstantCheckIn] = useState(true);

  // Guest details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idProofType, setIdProofType] = useState('Passport');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Success state
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchAvailableRooms();
  }, [checkInDate, checkOutDate]);

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await roomService.getAvailableRooms({
        checkIn: checkInDate,
        checkOut: checkOutDate,
      });
      if (res.success) {
        setRooms(res.data.rooms || []);
        if (res.data.rooms?.length > 0 && !selectedRoomId) {
          setSelectedRoomId(res.data.rooms[0]._id);
        }
      }
    } catch (err) {
      console.warn('Error fetching available rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      return setError('Please select an available room');
    }

    setSubmitting(true);
    setError('');

    try {
      const bookingRes = await bookingService.createBooking({
        room: selectedRoomId,
        checkInDate,
        checkOutDate,
        numGuests: Number(numGuests),
        guestInfo: {
          fullName,
          phone,
          email,
          idProofType,
          idProofNumber,
        },
      });

      if (bookingRes.success && bookingRes.data) {
        const b = bookingRes.data.booking;
        const inv = bookingRes.data.invoice;

        // Record payment
        await paymentService.createPayment({
          bookingId: b._id,
          amount: b.totalAmount,
          method: paymentMethod,
          notes: `Front desk walk-in payment (${paymentMethod})`,
        });

        // Instant Check-in if requested
        if (instantCheckIn) {
          await bookingService.checkIn(b._id);
        }

        setConfirmedBooking(b);
        setInvoice(inv);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete walk-in reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedBooking) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div className="card border-0 shadow-lg rounded-4 p-5 text-center">
              <div className="bg-success text-white rounded-circle d-inline-flex p-3 fs-1 mb-3 mx-auto">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="fw-extrabold text-dark mb-1">Walk-In Reservation Recorded</h2>
              <p className="text-muted small mb-4">
                Ref: <strong className="text-primary">{confirmedBooking.bookingRef}</strong> • Guest: <strong>{fullName}</strong>
              </p>

              <div className="alert alert-success small mb-4">
                {instantCheckIn
                  ? 'Guest has been checked in immediately and the room is marked as Occupied.'
                  : 'Reservation confirmed. Ready for check-in.'}
              </div>

              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-dark fw-bold px-4"
                  onClick={() => setShowInvoiceModal(true)}
                >
                  <i className="bi bi-receipt me-1"></i> Print Invoice
                </button>
                <button
                  type="button"
                  className="btn btn-primary fw-bold px-4"
                  onClick={() => navigate('/staff')}
                >
                  Back to Front Desk
                </button>
              </div>
            </div>
          </div>
        </div>

        <InvoiceModal
          show={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoice={invoice}
        />
      </div>
    );
  }

  const selectedRoomObj = rooms.find((r) => r._id === selectedRoomId);
  const price = selectedRoomObj?.pricePerNight ?? (selectedRoomObj?.roomType?.basePrice || 120);
  const nights = Math.max(1, Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 3600 * 24)));
  const subtotal = price * nights;
  const tax = Math.round((subtotal * 0.12) * 100) / 100;
  const total = subtotal + tax;

  return (
    <div className="container py-5">
      <div className="mb-4">
        <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase mb-2">
          Reception Desk
        </span>
        <h2 className="fw-extrabold text-dark mb-1">Walk-In Guest Registration</h2>
        <p className="text-muted small">Fast-track reservation for guests arriving directly at the reception counter.</p>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Guest Information */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-person-lines-fill me-2 text-primary"></i>Guest Contact & KYC</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. David Sterling"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    placeholder="+1 555-0123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">ID Proof Type</label>
                  <select
                    className="form-select"
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                  >
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="National ID">National ID</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">ID Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Masked in system"
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stay & Room Details */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-door-open-fill me-2 text-primary"></i>Room & Stay Dates</h5>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Check-In</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Check-Out</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                  />
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Guests Count</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="6"
                    value={numGuests}
                    onChange={(e) => setNumGuests(e.target.value)}
                  />
                </div>
                <div className="col-sm-8">
                  <label className="form-label small fw-semibold text-secondary">Select Available Room</label>
                  {loadingRooms ? (
                    <div className="text-muted small">Loading available rooms...</div>
                  ) : rooms.length === 0 ? (
                    <div className="text-danger small">No rooms available for these dates!</div>
                  ) : (
                    <select
                      className="form-select"
                      required
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                    >
                      {rooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          Room #{r.roomNumber} - {r.roomType?.name} (${r.pricePerNight ?? r.roomType?.basePrice}/nt)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="form-check form-switch pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="instantCheckInCheck"
                  checked={instantCheckIn}
                  onChange={(e) => setInstantCheckIn(e.target.checked)}
                />
                <label className="form-check-label small fw-bold" htmlFor="instantCheckInCheck">
                  Check-in guest immediately (Room becomes Occupied)
                </label>
              </div>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-3">Billing & Payment</h5>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash">Cash (Front Desk)</option>
                  <option value="Card">Credit / Debit Card Terminal</option>
                  <option value="UPI">UPI / Digital QR</option>
                  <option value="Online">Online Gateway</option>
                </select>
              </div>

              <div className="bg-light p-3 rounded-3 mb-4">
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Room Rate:</span>
                  <span>${price} / night</span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Stay:</span>
                  <span>{nights} night(s)</span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Taxes (12%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold fs-5 text-dark">
                  <span>Total Amount:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-warning btn-lg w-100 fw-bold text-dark shadow-sm"
                disabled={submitting || rooms.length === 0}
              >
                {submitting ? 'Creating Reservation...' : 'Complete Walk-In Booking'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WalkInBooking;
