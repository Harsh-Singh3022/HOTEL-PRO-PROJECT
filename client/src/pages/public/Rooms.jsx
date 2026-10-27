import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { roomService, roomTypeService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '600');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const typesRes = await roomTypeService.getRoomTypes();
      if (typesRes.success) setRoomTypes(typesRes.data.roomTypes || []);

      await executeSearch(
        checkIn,
        checkOut,
        guests,
        selectedType,
        maxPrice
      );
    } catch (err) {
      setError('Could not load room catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (cIn, cOut, numGuests, typeId, maxP) => {
    setLoading(true);
    setError('');
    try {
      if (cIn && cOut) {
        // Query availability endpoint
        const res = await roomService.getAvailableRooms({
          checkIn: cIn,
          checkOut: cOut,
          guests: numGuests,
          type: typeId || undefined,
          maxPrice: maxP || undefined,
        });
        if (res.success) {
          setRooms(res.data.rooms || []);
        }
      } else {
        // Fetch all rooms with filters
        const res = await roomService.getRooms({
          roomType: typeId || undefined,
          limit: 100,
        });
        if (res.success) {
          let list = res.data.rooms || [];
          if (numGuests) {
            list = list.filter((r) => (r.roomType?.capacity || 2) >= Number(numGuests));
          }
          if (maxP) {
            list = list.filter((r) => {
              const p = r.pricePerNight != null ? r.pricePerNight : (r.roomType?.basePrice || 0);
              return p <= Number(maxP);
            });
          }
          setRooms(list);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to search rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    setSearchParams({
      ...(checkIn && { checkIn }),
      ...(checkOut && { checkOut }),
      ...(selectedType && { type: selectedType }),
      ...(guests && { guests }),
      ...(maxPrice && { maxPrice }),
    });
    executeSearch(checkIn, checkOut, guests, selectedType, maxPrice);
  };

  const handleReset = () => {
    setCheckIn('');
    setCheckOut('');
    setSelectedType('');
    setGuests('1');
    setMaxPrice('600');
    setSearchParams({});
    executeSearch('', '', '1', '', '600');
  };

  return (
    <div className="container py-5">
      {/* Page Header */}
      <div className="mb-4 text-center text-md-start">
        <h2 className="fw-extrabold text-dark mb-1">Explore Our Rooms & Suites</h2>
        <p className="text-muted">
          Select your travel dates to search guaranteed real-time availability and best direct rates.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Filter Sidebar */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-funnel me-1 text-primary"></i> Filters
              </h5>
              <button className="btn btn-sm text-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>

            <form onSubmit={handleApplyFilter}>
              {/* Check In Date */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Check-in</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              {/* Check Out Date */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Check-out</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              {/* Guests */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Guests</label>
                <select
                  className="form-select form-select-sm"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 Persons</option>
                  <option value="3">3 Persons</option>
                  <option value="4">4 Persons</option>
                  <option value="6">5+ Persons</option>
                </select>
              </div>

              {/* Room Type */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Suite Type</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {roomTypes.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Max Price Slider */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-secondary mb-0">Max Nightly Rate</label>
                  <span className="fw-bold text-primary">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="100"
                  max="800"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Right Rooms Grid */}
        <div className="col-lg-9">
          {error && (
            <div className="alert alert-danger rounded-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
            </div>
          )}

          {/* Results count & active search summary */}
          <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-4 shadow-sm mb-4 border">
            <div className="text-secondary small">
              Found <strong className="text-dark fs-6">{rooms.length}</strong> room(s) matching your criteria
              {checkIn && checkOut && (
                <span className="badge bg-primary-subtle text-primary ms-2">
                  {checkIn} to {checkOut}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading rooms...</span>
              </div>
              <p className="text-muted mt-2">Checking room availability...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
              <div className="fs-1 text-muted mb-3"><i className="bi bi-calendar-x"></i></div>
              <h4 className="fw-bold">No Rooms Available</h4>
              <p className="text-muted">
                No rooms match your specific criteria or dates. Try adjusting check-in dates or filters.
              </p>
              <button className="btn btn-outline-primary" onClick={handleReset}>
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {rooms.map((room) => {
                const type = room.roomType;
                const price = room.pricePerNight != null ? room.pricePerNight : (type?.basePrice || 150);
                const img = (room.images && room.images[0]) || (type?.images && type.images[0]) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

                return (
                  <div key={room._id} className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                      <div className="position-relative">
                        <img
                          src={img}
                          alt={`Room ${room.roomNumber}`}
                          className="card-img-top"
                          style={{ height: '220px', objectFit: 'cover' }}
                        />
                        <span className="position-absolute top-0 start-0 m-3 badge bg-dark bg-opacity-75 px-3 py-1.5 rounded-pill">
                          Room #{room.roomNumber} (Floor {room.floor})
                        </span>
                        <div className="position-absolute top-0 end-0 m-3">
                          <StatusBadge status={room.status} type="room" />
                        </div>
                        {(room.location || type?.location) && (
                          <div className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-90 text-warning px-2.5 py-1 text-truncate" style={{ maxWidth: '90%' }}>
                            <i className="bi bi-geo-alt-fill me-1"></i>{room.location || type?.location}
                          </div>
                        )}
                      </div>

                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h5 className="card-title fw-bold text-dark mb-0 fs-5">
                            {type?.name || 'Standard Room'}
                          </h5>
                          <div className="text-primary text-end">
                            <span className="fs-4 fw-extrabold">${price}</span>
                            <span className="text-muted small"> / night</span>
                          </div>
                        </div>

                        {(room.patternStyle || type?.patternStyle) && (
                          <div className="small text-secondary mb-2 fst-italic" style={{ fontSize: '11px' }}>
                            <i className="bi bi-palette me-1 text-primary"></i>{room.patternStyle || type?.patternStyle}
                          </div>
                        )}

                        <p className="card-text text-muted small line-clamp-2 mb-3">
                          {type?.description || 'Refined hotel accommodation equipped with luxury amenities.'}
                        </p>

                        {/* Amenities preview tags */}
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {type?.amenities?.slice(0, 3).map((a, i) => (
                            <span key={i} className="badge bg-light text-secondary border small">
                              {a}
                            </span>
                          ))}
                          {(type?.amenities?.length || 0) > 3 && (
                            <span className="badge bg-light text-secondary border small">
                              +{type.amenities.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center text-muted small border-top pt-3 mt-auto">
                          <span>
                            <i className="bi bi-person me-1 text-primary"></i> Max {type?.capacity || 2} Guests
                          </span>
                          <span>
                            <i className="bi bi-layers me-1 text-primary"></i> Floor {room.floor}
                          </span>
                        </div>

                        <div className="row g-2 mt-3">
                          <div className="col-6">
                            <Link to={`/rooms/${room._id}`} className="btn btn-outline-secondary w-100 fw-semibold">
                              Details
                            </Link>
                          </div>
                          <div className="col-6">
                            <Link
                              to={`/book/${room._id}${checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : ''}`}
                              className="btn btn-primary w-100 fw-bold"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
