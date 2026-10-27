import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService, dashboardService, invoiceService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import InvoiceModal from '../../components/common/InvoiceModal';

const StaffDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invoice modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Extra charges modal
  const [chargeTarget, setChargeTarget] = useState(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [submittingCharge, setSubmittingCharge] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, bookRes] = await Promise.all([
        dashboardService.getSummary(),
        bookingService.getAllBookings({ limit: 10 }),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (bookRes.success) setBookings(bookRes.data.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to load front desk dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    if (!window.confirm('Confirm check-in for this guest? Room will be set to Occupied.')) return;
    try {
      const res = await bookingService.checkIn(bookingId);
      if (res.success) {
        alert('Guest checked in successfully! Room marked as Occupied.');
        fetchData();
      }
    } catch (err) {
      alert('Check-in error: ' + err.message);
    }
  };

  const handleCheckOut = async (bookingId) => {
    if (!window.confirm('Process check-out for this guest? Room will be marked for Cleaning.')) return;
    try {
      const res = await bookingService.checkOut(bookingId);
      if (res.success) {
        alert('Guest checked out successfully! Room marked for Cleaning.');
        if (res.data?.invoice) {
          setSelectedInvoice(res.data.invoice);
          setShowInvoiceModal(true);
        }
        fetchData();
      }
    } catch (err) {
      alert('Check-out error: ' + err.message);
    }
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    if (!chargeTarget || !chargeDesc || !chargeAmount) return;

    setSubmittingCharge(true);
    try {
      const res = await bookingService.addCharge(chargeTarget._id, {
        description: chargeDesc,
        amount: Number(chargeAmount),
      });

      if (res.success) {
        alert('Extra charge added and invoice updated!');
        setChargeTarget(null);
        setChargeDesc('');
        setChargeAmount('');
        fetchData();
      }
    } catch (err) {
      alert('Failed to add charge: ' + err.message);
    } finally {
      setSubmittingCharge(false);
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
      alert('Could not load invoice: ' + err.message);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Front Desk Operations
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Reception & Arrivals Command Center</h2>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/staff/walk-in" className="btn btn-warning fw-bold text-dark">
            <i className="bi bi-person-plus-fill me-1"></i> New Walk-In
          </Link>
          <Link to="/staff/room-board" className="btn btn-outline-dark fw-semibold">
            <i className="bi bi-grid-3x3-gap-fill me-1"></i> Room Grid
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* KPI Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 stat-card bg-white">
            <div className="text-secondary small fw-semibold">Today's Check-ins</div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h2 className="fw-extrabold text-primary mb-0">{summary?.kpi?.todayCheckIns ?? 0}</h2>
              <div className="p-2.5 bg-primary-subtle text-primary rounded-3 fs-5"><i className="bi bi-box-arrow-in-right"></i></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 stat-card bg-white">
            <div className="text-secondary small fw-semibold">Today's Check-outs</div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h2 className="fw-extrabold text-danger mb-0">{summary?.kpi?.todayCheckOuts ?? 0}</h2>
              <div className="p-2.5 bg-danger-subtle text-danger rounded-3 fs-5"><i className="bi bi-box-arrow-right"></i></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 stat-card bg-white">
            <div className="text-secondary small fw-semibold">Available Rooms</div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h2 className="fw-extrabold text-success mb-0">{summary?.kpi?.availableRooms ?? 0}</h2>
              <div className="p-2.5 bg-success-subtle text-success rounded-3 fs-5"><i className="bi bi-door-open"></i></div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 stat-card bg-white">
            <div className="text-secondary small fw-semibold">Rooms In Cleaning</div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <h2 className="fw-extrabold text-warning-emphasis mb-0">{summary?.kpi?.cleaningRooms ?? 0}</h2>
              <div className="p-2.5 bg-warning-subtle text-warning-emphasis rounded-3 fs-5"><i className="bi bi-stars"></i></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings & Front Desk Table */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Active Reservations & Stays</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-4 text-muted">No reservations found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Ref #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th className="text-end">Front Desk Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingRef}</td>
                    <td>
                      <div className="fw-semibold text-dark">{b.guest?.fullName || 'Walk-in'}</div>
                      <div className="text-muted small">{b.guest?.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Room {b.room?.roomNumber} ({b.room?.roomType?.name})
                      </span>
                    </td>
                    <td className="small">{new Date(b.checkInDate).toLocaleDateString()}</td>
                    <td className="small">{new Date(b.checkOutDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={b.status} type="booking" />
                    </td>
                    <td className="fw-semibold small">${Number(b.totalAmount).toFixed(2)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {b.status === 'Confirmed' && (
                          <button
                            className="btn btn-success"
                            title="Check-In Guest"
                            onClick={() => handleCheckIn(b._id)}
                          >
                            <i className="bi bi-box-arrow-in-right me-1"></i> Check-in
                          </button>
                        )}
                        {b.status === 'CheckedIn' && (
                          <>
                            <button
                              className="btn btn-primary"
                              title="Add Extra Charges"
                              onClick={() => setChargeTarget(b)}
                            >
                              <i className="bi bi-plus-circle"></i> Charge
                            </button>
                            <button
                              className="btn btn-danger"
                              title="Check-Out Guest"
                              onClick={() => handleCheckOut(b._id)}
                            >
                              <i className="bi bi-box-arrow-right me-1"></i> Check-out
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        show={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={selectedInvoice}
      />

      {/* Extra Charge Modal */}
      {chargeTarget && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-primary text-white rounded-top-4">
                <h5 className="modal-title fw-bold">Add Extra Charge (Stay #{chargeTarget.bookingRef})</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setChargeTarget(null)}></button>
              </div>
              <form onSubmit={handleAddCharge}>
                <div className="modal-body p-4">
                  <p className="text-muted small">
                    Post incidentals, food & beverage, or laundry charges to Room {chargeTarget.room?.roomNumber}.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Charge Description</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Minibar Consumption, Room Service Dinner"
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
                      placeholder="e.g. 45.00"
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
                    {submittingCharge ? 'Posting...' : 'Post Charge to Stay'}
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

export default StaffDashboard;
