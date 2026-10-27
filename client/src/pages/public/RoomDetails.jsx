import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState('');

  // Date picker state for calculation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await roomService.getRoomById(id);
        if (res.success && res.data?.room) {
          setRoom(res.data.room);
          const images = [
            ...(res.data.room.images || []),
            ...(res.data.room.roomType?.images || []),
          ];
          setActiveImg(images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80');
        }
      } catch (err) {
        setError(err.message || 'Room not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

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
  const allImages = [
    ...(room.images || []),
    ...(type?.images || []),
  ];

  // Calculate nights and estimated total
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const nights = dOut > dIn ? Math.max(1, Math.ceil((dOut - dIn) / (1000 * 60 * 60 * 24))) : 1;
  const subtotal = nights * price;
  const tax = Math.round((subtotal * 0.12) * 100) / 100;
  const total = subtotal + tax;

  const handleProceedBooking = () => {
    navigate(`/book/${room._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/rooms">Rooms</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Room #{room.roomNumber}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* Left Column: Image gallery & details */}
        <div className="col-lg-8">
          {/* Main Hero Image */}
          <div className="position-relative rounded-4 overflow-hidden shadow-sm mb-3" style={{ maxHeight: '480px' }}>
            <img
              src={activeImg}
              alt={`Room ${room.roomNumber}`}
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '380px' }}
            />
            <div className="position-absolute top-0 start-0 m-3">
              <span className="badge bg-dark bg-opacity-75 fs-6 px-3 py-2 rounded-pill">
                Room #{room.roomNumber} • Floor {room.floor}
              </span>
            </div>
            <div className="position-absolute top-0 end-0 m-3">
              <StatusBadge status={room.status} type="room" />
            </div>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
              {allImages.map((imgUrl, i) => (
                <img
                  key={i}
                  src={imgUrl}
                  alt={`Thumb ${i}`}
                  className={`rounded-3 cursor-pointer border ${activeImg === imgUrl ? 'border-primary border-3' : 'border-light'}`}
                  style={{ width: '90px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setActiveImg(imgUrl)}
                />
              ))}
            </div>
          )}

          {/* Room Title & Description */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex flex-wrap gap-2 mb-2">
              {(room.location || type?.location) && (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5">
                  <i className="bi bi-geo-alt-fill me-1"></i> {room.location || type?.location}
                </span>
              )}
              {(room.patternStyle || type?.patternStyle) && (
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1.5">
                  <i className="bi bi-palette-fill me-1"></i> {room.patternStyle || type?.patternStyle}
                </span>
              )}
            </div>

            <h2 className="fw-extrabold text-dark mb-2">{type?.name || 'Luxury Room'}</h2>
            <div className="d-flex flex-wrap gap-3 text-secondary mb-3 small">
              <span><i className="bi bi-people-fill text-primary me-1"></i> Up to {type?.capacity} Guests</span>
              <span><i className="bi bi-layers-fill text-primary me-1"></i> Floor {room.floor}</span>
              <span><i className="bi bi-door-closed-fill text-primary me-1"></i> Room #{room.roomNumber}</span>
              <span><i className="bi bi-tag-fill text-primary me-1"></i> ${price} / night</span>
            </div>
            <p className="text-secondary leading-relaxed mb-0">
              {type?.description || 'Enjoy world-class accommodations with dedicated customer care and stunning surroundings.'}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-stars text-warning me-2"></i>Suite Amenities & Features</h5>
            <div className="row g-3">
              {type?.amenities && type.amenities.map((amenity, i) => (
                <div key={i} className="col-sm-6">
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                    <span>{amenity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Booking Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '100px' }}>
            <div className="d-flex justify-content-between align-items-baseline border-bottom pb-3 mb-3">
              <div>
                <span className="fs-3 fw-extrabold text-primary">${price}</span>
                <span className="text-muted small"> / night</span>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                Best Rate Direct
              </span>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Check-in Date</label>
              <input
                type="date"
                className="form-control"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Check-out Date</label>
              <input
                type="date"
                className="form-control"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Guests</label>
              <select
                className="form-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                {Array.from({ length: type?.capacity || 2 }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1} Guest{idx > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Price breakdown calculation */}
            <div className="bg-light p-3 rounded-3 mb-4">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>${price} x {nights} night(s)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Estimated Taxes (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold text-dark">
                <span>Total Estimated</span>
                <span className="text-primary fs-5">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-warning btn-lg w-100 fw-bold text-dark shadow-sm"
              onClick={handleProceedBooking}
            >
              <i className="bi bi-lightning-charge-fill me-1"></i> Proceed to Reservation
            </button>

            <div className="text-center mt-3 text-muted" style={{ fontSize: '11px' }}>
              <i className="bi bi-shield-check me-1 text-success"></i> Free cancellation up to 24h prior to check-in.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
