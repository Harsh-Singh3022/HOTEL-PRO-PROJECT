import React, { useState, useEffect } from 'react';
import { roomService, roomTypeService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const ManageRooms = () => {
  const [activeTab, setActiveTab] = useState('ROOMS');
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [floor, setFloor] = useState('1');
  const [pricePerNight, setPricePerNight] = useState('');
  const [roomStatus, setRoomStatus] = useState('Available');
  const [roomLocation, setRoomLocation] = useState('');
  const [patternStyle, setPatternStyle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);

  // Room Type modal
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editTypeId, setEditTypeId] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [typeBasePrice, setTypeBasePrice] = useState('120');
  const [typeCapacity, setTypeCapacity] = useState('2');
  const [typeAmenities, setTypeAmenities] = useState('WiFi, Air Conditioning, TV');
  const [typeImages, setTypeImages] = useState('');
  const [savingType, setSavingType] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, tRes] = await Promise.all([
        roomService.getRooms({ limit: 100 }),
        roomTypeService.getRoomTypes(),
      ]);
      if (rRes.success) setRooms(rRes.data.rooms || []);
      if (tRes.success) setRoomTypes(tRes.data.roomTypes || []);
    } catch (err) {
      setError(err.message || 'Failed to load room inventory');
    } finally {
      setLoading(false);
    }
  };

  // ROOM ACTIONS
  const handleOpenAddRoom = () => {
    setEditRoomId(null);
    setRoomNumber('');
    setRoomType(roomTypes[0]?._id || '');
    setFloor('1');
    setPricePerNight('');
    setRoomStatus('Available');
    setRoomLocation('');
    setPatternStyle('');
    setImageUrl('');
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (r) => {
    setEditRoomId(r._id);
    setRoomNumber(r.roomNumber);
    setRoomType(r.roomType?._id || r.roomType);
    setFloor(String(r.floor));
    setPricePerNight(r.pricePerNight ? String(r.pricePerNight) : '');
    setRoomStatus(r.status);
    setRoomLocation(r.location || '');
    setPatternStyle(r.patternStyle || '');
    setImageUrl(r.images?.[0] || '');
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setSavingRoom(true);
    try {
      const payload = {
        roomNumber,
        roomType,
        floor: Number(floor),
        pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
        status: roomStatus,
        location: roomLocation,
        patternStyle,
        images: imageUrl ? [imageUrl] : [],
      };

      if (editRoomId) {
        await roomService.updateRoom(editRoomId, payload);
      } else {
        await roomService.createRoom(payload);
      }
      setShowRoomModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving room: ' + err.message);
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId, num) => {
    if (!window.confirm(`Are you sure you want to delete Room #${num}?`)) return;
    try {
      await roomService.deleteRoom(roomId);
      alert(`Room #${num} removed`);
      fetchData();
    } catch (err) {
      alert('Cannot delete room: ' + err.message);
    }
  };

  // ROOM TYPE ACTIONS
  const handleOpenAddType = () => {
    setEditTypeId(null);
    setTypeName('');
    setTypeDesc('');
    setTypeBasePrice('150');
    setTypeCapacity('2');
    setTypeAmenities('High-speed WiFi, Air Conditioning, Smart TV');
    setTypeImages('');
    setShowTypeModal(true);
  };

  const handleOpenEditType = (t) => {
    setEditTypeId(t._id);
    setTypeName(t.name);
    setTypeDesc(t.description);
    setTypeBasePrice(String(t.basePrice));
    setTypeCapacity(String(t.capacity));
    setTypeAmenities(t.amenities ? t.amenities.join(', ') : '');
    setTypeImages(t.images?.[0] || '');
    setShowTypeModal(true);
  };

  const handleSaveType = async (e) => {
    e.preventDefault();
    setSavingType(true);
    try {
      const payload = {
        name: typeName,
        description: typeDesc,
        basePrice: Number(typeBasePrice),
        capacity: Number(typeCapacity),
        amenities: typeAmenities.split(',').map((s) => s.trim()).filter(Boolean),
        images: typeImages ? [typeImages] : [],
      };

      if (editTypeId) {
        await roomTypeService.updateRoomType(editTypeId, payload);
      } else {
        await roomTypeService.createRoomType(payload);
      }
      setShowTypeModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving room type: ' + err.message);
    } finally {
      setSavingType(false);
    }
  };

  const handleDeleteType = async (typeId, name) => {
    if (!window.confirm(`Delete room category '${name}'?`)) return;
    try {
      await roomTypeService.deleteRoomType(typeId);
      alert(`Room type '${name}' removed`);
      fetchData();
    } catch (err) {
      alert('Cannot delete room type: ' + err.message);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-dark px-3 py-1.5 rounded-pill text-uppercase mb-2">
            Inventory & Asset Management
          </span>
          <h2 className="fw-extrabold text-dark mb-0">Rooms & Room Types Master</h2>
          <p className="text-muted small mb-0">Configure room inventory, nightly pricing overrides, and suite categories.</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-dark fw-bold" onClick={handleOpenAddType}>
            <i className="bi bi-tag-fill me-1"></i> Add Room Type
          </button>
          <button className="btn btn-primary fw-bold" onClick={handleOpenAddRoom}>
            <i className="bi bi-plus-lg me-1"></i> Add New Room
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger rounded-3">{error}</div>}

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-4 shadow-sm border d-inline-flex">
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 rounded-3 ${activeTab === 'ROOMS' ? 'active' : ''}`}
            onClick={() => setActiveTab('ROOMS')}
          >
            <i className="bi bi-door-closed me-2"></i> Rooms List ({rooms.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-bold px-4 rounded-3 ${activeTab === 'TYPES' ? 'active' : ''}`}
            onClick={() => setActiveTab('TYPES')}
          >
            <i className="bi bi-tags me-2"></i> Room Types ({roomTypes.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: ROOMS TABLE */}
      {activeTab === 'ROOMS' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Room #</th>
                  <th>Category</th>
                  <th>Floor</th>
                  <th>Nightly Price</th>
                  <th>Current Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span className="fw-extrabold fs-6 text-dark">Room {r.roomNumber}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {r.roomType?.name || 'Standard'}
                      </span>
                    </td>
                    <td>Floor {r.floor}</td>
                    <td className="fw-bold text-primary">
                      ${r.pricePerNight != null ? r.pricePerNight : (r.roomType?.basePrice || 0)}
                    </td>
                    <td><StatusBadge status={r.status} type="room" /></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="Edit Room"
                          onClick={() => handleOpenEditRoom(r)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Room"
                          onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROOM TYPES */}
      {activeTab === 'TYPES' && (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type Name</th>
                  <th>Base Price</th>
                  <th>Max Capacity</th>
                  <th>Amenities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-bold text-dark">{t.name}</div>
                      <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                        {t.description}
                      </div>
                    </td>
                    <td className="fw-bold text-success">${t.basePrice} / nt</td>
                    <td><i className="bi bi-people me-1"></i> {t.capacity} Guests</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {t.amenities?.slice(0, 3).map((a, i) => (
                          <span key={i} className="badge bg-light text-secondary border small">
                            {a}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleOpenEditType(t)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteType(t._id, t.name)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM MODAL */}
      {showRoomModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  {editRoomId ? `Edit Room #${roomNumber}` : 'Add New Inventory Room'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRoomModal(false)}></button>
              </div>
              <form onSubmit={handleSaveRoom}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Room Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 101"
                        required
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Floor Number</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Room Category</label>
                    <select
                      className="form-select"
                      required
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                    >
                      {roomTypes.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} (Base: ${t.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Nightly Override ($ USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Optional override"
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Initial Status</label>
                      <select
                        className="form-select"
                        value={roomStatus}
                        onChange={(e) => setRoomStatus(e.target.value)}
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Destination Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Positano, Amalfi Coast"
                        value={roomLocation}
                        onChange={(e) => setRoomLocation(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Architectural Pattern</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mediterranean Ceramic & Stone"
                        value={patternStyle}
                        onChange={(e) => setPatternStyle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Photo Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowRoomModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={savingRoom}>
                    {savingRoom ? 'Saving...' : 'Save Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ROOM TYPE MODAL */}
      {showTypeModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title fw-bold">
                  {editTypeId ? 'Edit Room Type' : 'Create Room Type'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTypeModal(false)}></button>
              </div>
              <form onSubmit={handleSaveType}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Presidential Suite"
                      required
                      value={typeName}
                      onChange={(e) => setTypeName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Suite description and features..."
                      value={typeDesc}
                      onChange={(e) => setTypeDesc(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Base Price ($/night)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={typeBasePrice}
                        onChange={(e) => setTypeBasePrice(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Max Guests</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        required
                        value={typeCapacity}
                        onChange={(e) => setTypeCapacity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Amenities (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="WiFi, Balcony, Minibar, Ocean View"
                      value={typeAmenities}
                      onChange={(e) => setTypeAmenities(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Hero Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      value={typeImages}
                      onChange={(e) => setTypeImages(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowTypeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={savingType}>
                    {savingType ? 'Saving...' : 'Save Category'}
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

export default ManageRooms;
