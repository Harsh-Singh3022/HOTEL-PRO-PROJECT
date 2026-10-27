import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService, invoiceService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceModal from '../../components/common/InvoiceModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  // Invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Cancellation modal
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async (bookingId) => {
    setLoadingInvoice(true);
    try {
      const res = await invoiceService.getInvoice(bookingId);
      if (res.success && res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      alert('Could not retrieve invoice: ' + err.message);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(cancelTarget._id, {
        reason: cancelReason || 'Guest requested cancellation',
      });
      if (res.success) {
        alert(
          `Booking cancelled successfully. ${res.data.refund?.policyNote || ''}`
        );
        setCancelTarget(null);
        setCancelReason('');
        fetchBookings();
      }
    } catch (err) {
      alert('Cancellation failed: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return ['Confirmed', 'CheckedIn'].includes(b.status);
    if (filter === 'COMPLETED') return b.status === 'CheckedOut';
    if (filter === 'CANCELLED') return b.status === 'Cancelled';
    return true;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-extrabold text-dark mb-1">My Reservations</h2>
          <p className="text-muted small mb-0">View past stays, upcoming bookings, and download digital invoices.</p>
        </div>
        <Link to="/rooms" className="btn btn-primary mt-3 mt-md-0 fw-semibold">
          <i className="bi bi-plus-lg me-1"></i> Book New Room
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3">{error}</div>
      )}

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-1">
        {[
          { key: 'ALL', label: 'All Reservations' },
          { key: 'ACTIVE', label: 'Upcoming & Active' },
          { key: 'COMPLETED', label: 'Completed Stays' },
          { key: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${filter === tab.key ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5 p-4">
          <div className="fs-1 text-muted mb-3"><i className="bi bi-calendar-x"></i></div>
          <h4 className="fw-bold">No Reservations Found</h4>
          <p className="text-muted small">You don't have any bookings matching this filter.</p>
          <Link to="/rooms" className="btn btn-primary mx-auto">
            Browse Luxury Rooms
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {filteredBookings.map((b) => {
            const room = b.room;
            const type = room?.roomType;
            const img = (room?.images && room.images[0]) || (type?.images && type.images[0]) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80';

            return (
              <div key={b._id} className="col-12">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden p-3 p-md-4 card-hover">
                  <div className="row align-items-center g-3">
                    {/* Room Thumbnail */}
                    <div className="col-md-3 col-sm-4">
                      <img
                        src={img}
                        alt="Room"
                        className="rounded-3 w-100"
                        style={{ height: '140px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-md-6 col-sm-8">
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span className="fw-extrabold text-primary fs-6">{b.bookingRef}</span>
                        <StatusBadge status={b.status} type="booking" />
                        <StatusBadge status={b.paymentStatus} type="payment" />
                      </div>

                      <h5 className="fw-bold mb-1 text-dark">
                        Room {room?.roomNumber} — {type?.name || 'Deluxe Room'}
                      </h5>

                      <div className="row g-2 text-muted small mt-1">
                        <div className="col-sm-6">
                          <i className="bi bi-calendar-check text-success me-1"></i>
                          <strong>Check-in:</strong> {new Date(b.checkInDate).toLocaleDateString()}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-calendar-x text-danger me-1"></i>
                          <strong>Check-out:</strong> {new Date(b.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-people me-1"></i>
                          <strong>Guests:</strong> {b.numGuests} Person(s)
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-tag-fill text-warning me-1"></i>
                          <strong>Total:</strong> ${Number(b.totalAmount).toFixed(2)}
                        </div>
                      </div>

                      {b.cancellationReason && (
                        <div className="mt-2 text-danger small">
                          <strong>Cancellation Note:</strong> {b.cancellationReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="col-md-3 text-md-end d-flex flex-md-column gap-2">
                      <button
                        className="btn btn-outline-dark btn-sm fw-semibold w-100"
                        onClick={() => handleOpenInvoice(b._id)}
                        disabled={loadingInvoice}
                      >
                        <i className="bi bi-receipt me-1"></i> View Invoice
                      </button>

                      {['Confirmed', 'Pending'].includes(b.status) && (
                        <button
                          className="btn btn-outline-danger btn-sm fw-semibold w-100"
                          onClick={() => setCancelTarget(b)}
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={selectedInvoice}
      />

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-danger text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Cancel Reservation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setCancelTarget(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p>
                  Are you sure you want to cancel booking <strong>{cancelTarget.bookingRef}</strong>?
                </p>
                <div className="alert alert-warning small">
                  <strong>Cancellation Policy:</strong> Free 100% refund if cancelled at least 24 hours prior to check-in date. If cancelled within 24 hours, a 50% fee applies.
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Reason for Cancellation</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Optional reason for cancellation"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setCancelTarget(null)}>
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
