import React, { useState, useEffect } from 'react';
import { roomService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const RoomStatusBoard = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Quick edit room status modal
  const [editRoom, setEditRoom] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomService.getRooms({ limit: 100 });
      if (res.success) {
        setRooms(res.data.rooms || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (room) => {
    setEditRoom(room);
    setNewStatus(room.status);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editRoom || !newStatus) return;

    setUpdating(true);
    try {
      const res = await roomService.updateRoomStatus(editRoom._id, newStatus);
      if (res.success) {
        alert(`Room ${editRoom.roomNumber} updated to ${newStatus}`);
        setEditRoom(null);
        fetchRooms();
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Unique floors
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== 'ALL' && r.floor !== Number(selectedFloor)) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-primary px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Housekeeping & Maintenance
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Interactive Room Status Board</h2>
          <p className="text-muted small mb-0">Live color-coded status board. Click any room tile to change its state.</p>
        </div>
        <button className="btn btn-outline-secondary mt-3 mt-md-0 fw-semibold" onClick={fetchRooms}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Grid
        </button>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-6 d-flex flex-wrap gap-2 align-items-center">
            <span className="small fw-bold text-secondary me-1">Filter Floor:</span>
            <button
              className={`btn btn-sm rounded-pill px-3 ${selectedFloor === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedFloor('ALL')}
            >
              All Floors
            </button>
            {floors.map((f) => (
              <button
                key={f}
                className={`btn btn-sm rounded-pill px-3 ${selectedFloor === String(f) ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedFloor(String(f))}
              >
                Floor {f}
              </button>
            ))}
          </div>

          <div className="col-md-6 d-flex flex-wrap gap-2 justify-content-md-end align-items-center">
            <span className="small fw-bold text-secondary me-1">Filter Status:</span>
            {['ALL', 'Available', 'Occupied', 'Cleaning', 'Maintenance'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 ${selectedStatus === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <p className="text-muted mb-0">No rooms match the selected filters.</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredRooms.map((room) => {
            let borderClass = 'border-success-subtle bg-success-subtle';
            let icon = 'bi-check-circle-fill text-success';
            if (room.status === 'Occupied') {
              borderClass = 'border-danger-subtle bg-danger-subtle';
              icon = 'bi-person-fill text-danger';
            } else if (room.status === 'Cleaning') {
              borderClass = 'border-warning-subtle bg-warning-subtle';
              icon = 'bi-stars text-warning-emphasis';
            } else if (room.status === 'Maintenance') {
              borderClass = 'border-secondary-subtle bg-light';
              icon = 'bi-tools text-secondary';
            }

            return (
              <div key={room._id} className="col-xl-3 col-lg-4 col-sm-6">
                <div
                  className={`card h-100 p-3 room-grid-tile border ${borderClass} shadow-sm`}
                  onClick={() => handleOpenStatusModal(room)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fs-4 fw-extrabold text-dark">
                      Room {room.roomNumber}
                    </span>
                    <i className={`bi ${icon} fs-4`}></i>
                  </div>

                  <div className="fw-semibold text-dark small mb-1">
                    {room.roomType?.name || 'Standard Suite'}
                  </div>

                  <div className="d-flex justify-content-between text-muted small mt-auto pt-2 border-top border-secondary border-opacity-25">
                    <span>Floor {room.floor}</span>
                    <StatusBadge status={room.status} type="room" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Status Update Modal */}
      {editRoom && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  Update Status: Room #{editRoom.roomNumber}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditRoom(null)}></button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4">
                  <div className="mb-3 text-muted small">
                    <strong>Type:</strong> {editRoom.roomType?.name} • <strong>Floor:</strong> {editRoom.floor}
                  </div>

                  <label className="form-label small fw-semibold text-secondary">Set New Room Status</label>
                  <div className="d-grid gap-2">
                    {['Available', 'Occupied', 'Cleaning', 'Maintenance'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`btn py-2 text-start px-3 rounded-3 border d-flex justify-content-between align-items-center ${newStatus === st ? 'btn-primary' : 'btn-light'}`}
                        onClick={() => setNewStatus(st)}
                      >
                        <span className="fw-semibold">{st}</span>
                        {newStatus === st && <i className="bi bi-check-lg"></i>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditRoom(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark fw-bold" disabled={updating}>
                    {updating ? 'Updating...' : 'Save Room Status'}
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

export default RoomStatusBoard;
