import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { roomService, bookingService, paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InvoiceModal from '../../components/common/InvoiceModal';
import { PaymentMethodLogos } from '../../components/common/PartnerLogos';

const BookRoom = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkInDate, setCheckInDate] = useState(
    searchParams.get('checkIn') || tomorrow.toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState(
    searchParams.get('checkOut') || dayAfter.toISOString().split('T')[0]
  );
  const [numGuests, setNumGuests] = useState(searchParams.get('guests') || '2');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // Booking completion state
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await roomService.getRoomById(roomId);
        if (res.success && res.data?.room) {
          setRoom(res.data.room);
        }
      } catch (err) {
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error || 'Room not found'}</div>
        <Link to="/rooms" className="btn btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const type = room.roomType;
  const price = room.pricePerNight != null ? room.pricePerNight : (type?.basePrice || 150);

  // Nights and cost calculations
  const cIn = new Date(checkInDate);
  const cOut = new Date(checkOutDate);
  const nights = cOut > cIn ? Math.max(1, Math.ceil((cOut - cIn) / (1000 * 60 * 60 * 24))) : 1;
  const subtotal = nights * price;
  const tax = Math.round((subtotal * 0.12) * 100) / 100;
  const total = subtotal + tax;

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Create booking (atomic conflict check inside)
      const res = await bookingService.createBooking({
        room: room._id,
        checkInDate,
        checkOutDate,
        numGuests: Number(numGuests),
        specialRequests,
      });

      if (res.success && res.data) {
        const createdBooking = res.data.booking;
        const initialInvoice = res.data.invoice;

        // 2. Process initial mock payment
        try {
          await paymentService.createPayment({
            bookingId: createdBooking._id,
            amount: createdBooking.totalAmount,
            method: paymentMethod,
            notes: `Direct guest reservation pre-payment via ${paymentMethod}`,
          });
        } catch (payErr) {
          console.warn('Initial payment note:', payErr);
        }

        setConfirmedBooking(createdBooking);
        setGeneratedInvoice(initialInvoice);
      }
    } catch (err) {
      setError(err.message || 'Booking reservation could not be completed');
    } finally {
      setSubmitting(false);
    }
  };

  // If already confirmed, show confirmation card
  if (confirmedBooking) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center">
              <div className="bg-success text-white rounded-circle d-inline-flex p-3 fs-1 mb-3 mx-auto">
                <i className="bi bi-check-lg"></i>
              </div>
              <h2 className="fw-extrabold text-dark mb-1">Reservation Confirmed!</h2>
              <p className="text-muted small mb-4">
                Thank you, <strong>{user?.name}</strong>. Your luxury stay has been secured with zero double-booking guarantee.
              </p>

              <div className="bg-light p-4 rounded-4 mb-4 text-start">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Booking Reference:</span>
                  <strong className="text-primary">{confirmedBooking.bookingRef}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Room:</span>
                  <span>Room {room.roomNumber} ({type?.name})</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Check-in:</span>
                  <span>{new Date(checkInDate).toLocaleDateString()} (2:00 PM)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Check-out:</span>
                  <span>{new Date(checkOutDate).toLocaleDateString()} (12:00 PM)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Guests:</span>
                  <span>{numGuests} Person(s)</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top">
                  <span className="fw-bold">Total Paid:</span>
                  <span className="fw-bold text-success">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <button
                  type="button"
                  className="btn btn-outline-dark fw-bold px-4"
                  onClick={() => setShowInvoiceModal(true)}
                >
                  <i className="bi bi-receipt me-1"></i> View & Print Invoice
                </button>
                <Link to="/my-bookings" className="btn btn-primary fw-bold px-4">
                  Go to My Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          show={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          invoice={generatedInvoice}
        />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-extrabold text-dark mb-1">Confirm Your Reservation</h2>
        <p className="text-muted">Review your room selection, stay dates, and complete payment.</p>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 p-3 mb-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <strong>Booking Conflict:</strong> {error}
        </div>
      )}

      <form onSubmit={handleBookingSubmit}>
        <div className="row g-4">
          {/* Left Form: Stay and Guest details */}
          <div className="col-lg-7">
            {/* Room Summary Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <div className="d-flex gap-3 align-items-center mb-3">
                <img
                  src={(room.images && room.images[0]) || (type?.images && type.images[0]) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                  alt="Room"
                  className="rounded-3 shadow-sm"
                  style={{ width: '100px', height: '70px', objectFit: 'cover' }}
                />
                <div>
                  <h5 className="fw-bold mb-1">{type?.name || 'Deluxe Room'}</h5>
                  <div className="text-muted small mb-1">
                    Room #{room.roomNumber} • Floor {room.floor} • Capacity {type?.capacity}
                  </div>
                  {(room.location || type?.location) && (
                    <div className="small text-primary fw-semibold">
                      <i className="bi bi-geo-alt-fill me-1"></i>{room.location || type?.location}
                    </div>
                  )}
                  {(room.patternStyle || type?.patternStyle) && (
                    <div className="small text-secondary fst-italic">
                      <i className="bi bi-palette me-1"></i>{room.patternStyle || type?.patternStyle}
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-bold text-secondary">Check-in Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={checkInDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckInDate(e.target.value)}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-bold text-secondary">Check-out Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={checkOutDate}
                    min={checkInDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Number of Guests</label>
                  <select
                    className="form-select"
                    value={numGuests}
                    onChange={(e) => setNumGuests(e.target.value)}
                  >
                    {Array.from({ length: type?.capacity || 2 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1} Guest{idx > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Special Requests Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-chat-text me-2 text-primary"></i>Special Requests</h5>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Let us know if you have preferences such as high floor, quiet room, late check-in, or dietary requests."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              ></textarea>
              <div className="form-text small">Special requests are subject to availability upon check-in.</div>
            </div>

            {/* Payment Method Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="fw-bold mb-3"><i className="bi bi-credit-card me-2 text-primary"></i>Payment Method</h5>
              <div className="row g-2 mb-3">
                {['Card', 'UPI', 'Online', 'Cash'].map((m) => (
                  <div key={m} className="col-6 col-sm-3">
                    <button
                      type="button"
                      className={`btn w-100 py-3 rounded-3 text-center border ${paymentMethod === m ? 'btn-primary border-primary shadow-sm' : 'btn-light border-light-subtle'}`}
                      onClick={() => setPaymentMethod(m)}
                    >
                      <div className="fs-4 mb-1">
                        {m === 'Card' && <i className="bi bi-credit-card"></i>}
                        {m === 'UPI' && <i className="bi bi-phone"></i>}
                        {m === 'Online' && <i className="bi bi-globe"></i>}
                        {m === 'Cash' && <i className="bi bi-cash-stack"></i>}
                      </div>
                      <div className="small fw-semibold">{m}</div>
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <div className="small fw-bold text-secondary mb-2">Accepted Payment Networks:</div>
                <PaymentMethodLogos />
              </div>

              <div className="alert alert-light border small text-muted mb-0">
                <i className="bi bi-shield-lock-fill text-success me-1"></i>
                Payments are securely processed. No raw card numbers are stored on our servers (PCI-DSS tokenization compliant).
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-3">Billing Summary</h5>

              <div className="d-flex justify-content-between mb-2 text-secondary small">
                <span>Room Rate:</span>
                <span>${price} / night</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-secondary small">
                <span>Duration:</span>
                <span>{nights} Night(s)</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-secondary small">
                <span>Subtotal:</span>
                <span className="fw-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 text-secondary small">
                <span>Hospitality Taxes & Service (12%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <hr className="my-3" />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-bold text-dark">Total Amount:</span>
                <span className="fs-4 fw-extrabold text-primary">${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-warning btn-lg w-100 fw-bold text-dark shadow-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-1"></i> Pay & Confirm Reservation
                  </>
                )}
              </button>

              <div className="text-center mt-3 text-muted small">
                <i className="bi bi-check2-circle text-success me-1"></i>
                Instant confirmation code and printable invoice generated on booking.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookRoom;
