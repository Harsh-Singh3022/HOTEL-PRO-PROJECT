import React, { useState, useEffect } from 'react';
import { bookingService, invoiceService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceModal from '../../components/common/InvoiceModal';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Extra charges modal
  const [chargeTarget, setChargeTarget] = useState(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [submittingCharge, setSubmittingCharge] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, page]);

  const fetchBookings = async (searchQuery = search) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        ...(statusFilter && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery }),
      };
      const res = await bookingService.getAllBookings(params);
      if (res.success) {
        setBookings(res.data.bookings || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.pages || 1);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings(search);
  };

  const handleCheckIn = async (id) => {
    if (!window.confirm('Confirm check-in for this guest?')) return;
    try {
      await bookingService.checkIn(id);
      fetchBookings();
    } catch (err) {
      alert('Check-in error: ' + err.message);
    }
  };

  const handleCheckOut = async (id) => {
    if (!window.confirm('Confirm check-out? Room will be set to Cleaning.')) return;
    try {
      const res = await bookingService.checkOut(id);
      if (res.success && res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
        setShowInvoiceModal(true);
      }
      fetchBookings();
    } catch (err) {
      alert('Check-out error: ' + err.message);
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Enter cancellation reason:', 'Admin cancellation');
    if (reason == null) return;
    try {
      await bookingService.cancelBooking(id, { reason });
      fetchBookings();
    } catch (err) {
      alert('Cancellation error: ' + err.message);
    }
  };

  const handleViewInvoice = async (bookingId) => {
    try {
      const res = await invoiceService.getInvoice(bookingId);
      if (res.success && res.data?.invoice) {
        setSelectedInvoice(res.data.invoice);
        setShowInvoiceModal(true);
      }
    } catch (err) {
      alert('Could not retrieve invoice: ' + err.message);
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!chargeTarget || !chargeDesc || !chargeAmount) return;

    setSubmittingCharge(true);
    try {
      await bookingService.addCharge(chargeTarget._id, {
        description: chargeDesc,
        amount: Number(chargeAmount),
      });
      alert('Charge posted successfully!');
      setChargeTarget(null);
      setChargeDesc('');
      setChargeAmount('');
      fetchBookings();
    } catch (err) {
      alert('Failed to post charge: ' + err.message);
    } finally {
      setSubmittingCharge(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Central Reservations System
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Master Bookings Log</h2>
          <p className="text-muted small mb-0">Audit, search, and manage all property bookings, check-in states, and invoices.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mt-3 mt-md-0 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search reference #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* Filter Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-1">
        {[
          { key: '', label: 'All Statuses' },
          { key: 'Confirmed', label: 'Confirmed' },
          { key: 'CheckedIn', label: 'Checked In' },
          { key: 'CheckedOut', label: 'Checked Out' },
          { key: 'Cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${statusFilter === tab.key ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => {
              setStatusFilter(tab.key);
              setPage(1);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 text-muted">No reservations found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay Dates</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="fw-bold text-primary small">{b.bookingRef}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{b.guest?.fullName || 'Walk-in'}</div>
                      <div className="text-muted small">{b.guest?.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Room {b.room?.roomNumber} ({b.room?.roomType?.name})
                      </span>
                    </td>
                    <td className="small">
                      {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}
                    </td>
                    <td><StatusBadge status={b.status} type="booking" /></td>
                    <td><StatusBadge status={b.paymentStatus} type="payment" /></td>
                    <td className="fw-bold text-dark">${Number(b.totalAmount).toFixed(2)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {b.status === 'Confirmed' && (
                          <button
                            className="btn btn-success"
                            title="Check-In"
                            onClick={() => handleCheckIn(b._id)}
                          >
                            <i className="bi bi-box-arrow-in-right"></i>
                          </button>
                        )}
                        {b.status === 'CheckedIn' && (
                          <>
                            <button
                              className="btn btn-primary"
                              title="Add Extra Charges"
                              onClick={() => setChargeTarget(b)}
                            >
                              <i className="bi bi-plus-circle"></i>
                            </button>
                            <button
                              className="btn btn-danger"
                              title="Check-Out"
                              onClick={() => handleCheckOut(b._id)}
                            >
                              <i className="bi bi-box-arrow-right"></i>
                            </button>
                          </>
                        )}
                        <button
                          className="btn btn-outline-secondary"
                          title="View Invoice"
                          onClick={() => handleViewInvoice(b._id)}
                        >
                          <i className="bi bi-receipt"></i>
                        </button>
                        {['Confirmed', 'Pending'].includes(b.status) && (
                          <button
                            className="btn btn-outline-danger"
                            title="Cancel Booking"
                            onClick={() => handleCancel(b._id)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-muted">Page {page} of {totalPages}</span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={selectedInvoice}
      />

      {/* Extra Charges Modal */}
      {chargeTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Post Incidentals ({chargeTarget.bookingRef})</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setChargeTarget(null)}></button>
              </div>
              <form onSubmit={handleAddCharge}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Item Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Minibar, Late Departure Fee, Laundry"
                      required
                      value={chargeDesc}
                      onChange={(e) => setChargeDesc(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amount ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      placeholder="e.g. 50.00"
                      required
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setChargeTarget(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={submittingCharge}>
                    {submittingCharge ? 'Posting...' : 'Apply Charge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
