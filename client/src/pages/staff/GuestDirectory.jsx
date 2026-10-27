import React, { useState, useEffect } from 'react';
import { guestService } from '../../services/api';

const GuestDirectory = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected guest details modal
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestHistory, setGuestHistory] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async (search = '') => {
    setLoading(true);
    try {
      const res = await guestService.getGuests({ search, limit: 50 });
      if (res.success) {
        setGuests(res.data.guests || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load guest directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGuests(searchTerm);
  };

  const handleOpenDetails = async (guestId) => {
    setLoadingDetails(true);
    try {
      const res = await guestService.getGuestById(guestId);
      if (res.success) {
        setSelectedGuest(res.data.guest);
        setGuestHistory(res.data.bookingHistory || []);
      }
    } catch (err) {
      alert('Failed to load guest details: ' + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase mb-2">
            CRM & Records
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Guest Directory</h2>
          <p className="text-muted small mb-0">Search guest records, contact details, and past stay histories.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3 mt-md-0 d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '280px' }}
          />
          <button type="submit" className="btn btn-primary fw-semibold">
            <i className="bi bi-search"></i>
          </button>
        </form>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : guests.length === 0 ? (
          <div className="text-center py-5 text-muted">No guests found</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Guest Name</th>
                  <th>Contact Info</th>
                  <th>ID Proof</th>
                  <th>Location</th>
                  <th>Special Preferences</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g._id}>
                    <td>
                      <div className="fw-bold text-dark">{g.fullName}</div>
                      {g.user && <span className="badge bg-info-subtle text-info border small">Registered User</span>}
                    </td>
                    <td>
                      <div><i className="bi bi-telephone text-secondary me-1"></i>{g.phone}</div>
                      {g.email && <div className="text-muted small"><i className="bi bi-envelope text-secondary me-1"></i>{g.email}</div>}
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {g.idProofType}: {g.idProofNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="small text-secondary">
                      {g.address?.city ? `${g.address.city}, ${g.address.country || ''}` : 'N/A'}
                    </td>
                    <td className="small text-truncate" style={{ maxWidth: '200px' }}>
                      {g.preferences || '—'}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm fw-semibold"
                        onClick={() => handleOpenDetails(g._id)}
                      >
                        <i className="bi bi-clock-history me-1"></i> View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest Details & History Modal */}
      {selectedGuest && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-badge me-2 text-warning"></i>
                  {selectedGuest.fullName}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedGuest(null)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Contact row */}
                <div className="row g-3 bg-light p-3 rounded-3 mb-4">
                  <div className="col-sm-6">
                    <div className="text-muted small">Phone:</div>
                    <div className="fw-bold">{selectedGuest.phone}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Email:</div>
                    <div className="fw-bold">{selectedGuest.email || 'N/A'}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">ID Proof (DPDP Masked):</div>
                    <div className="fw-semibold">{selectedGuest.idProofType} ({selectedGuest.idProofNumber || 'None'})</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="text-muted small">Preferences & Dietary:</div>
                    <div className="fw-semibold">{selectedGuest.preferences || 'None specified'}</div>
                  </div>
                </div>

                {/* Stay History */}
                <h6 className="fw-bold mb-3"><i className="bi bi-calendar-range me-2 text-primary"></i>Stay History ({guestHistory.length})</h6>
                {guestHistory.length === 0 ? (
                  <p className="text-muted small">No stay records found for this guest yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead className="table-light small">
                        <tr>
                          <th>Ref</th>
                          <th>Room</th>
                          <th>Check-in</th>
                          <th>Check-out</th>
                          <th>Status</th>
                          <th>Total ($)</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {guestHistory.map((h) => (
                          <tr key={h._id}>
                            <td className="fw-bold text-primary">{h.bookingRef}</td>
                            <td>Room {h.room?.roomNumber}</td>
                            <td>{new Date(h.checkInDate).toLocaleDateString()}</td>
                            <td>{new Date(h.checkOutDate).toLocaleDateString()}</td>
                            <td><span className="badge bg-secondary">{h.status}</span></td>
                            <td>${Number(h.totalAmount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedGuest(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestDirectory;
