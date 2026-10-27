import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { roomService, roomTypeService } from '../../services/api';
import { TravelAccreditationLogos } from '../../components/common/PartnerLogos';

const Home = () => {
  const navigate = useNavigate();
  const [roomTypes, setRoomTypes] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search widget state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [searchParams, setSearchParams] = useState({
    checkIn: tomorrow.toISOString().split('T')[0],
    checkOut: dayAfter.toISOString().split('T')[0],
    guests: '2',
    roomType: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, roomsRes] = await Promise.all([
          roomTypeService.getRoomTypes(),
          roomService.getRooms({ limit: 4 }),
        ]);

        if (typesRes.success) setRoomTypes(typesRes.data.roomTypes || []);
        if (roomsRes.success) setFeaturedRooms(roomsRes.data.rooms || []);
      } catch (err) {
        console.warn('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests,
      type: searchParams.roomType,
    }).toString();
    navigate(`/rooms?${query}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5 py-lg-6 position-relative overflow-hidden">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold text-uppercase mb-3">
                <i className="bi bi-star-fill me-1"></i> Five-Star Hospitality & Comfort
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-3">
                Experience Luxury Living at <span className="text-warning">HotelPro</span>
              </h1>
              <p className="lead text-light opacity-90 mb-4 pe-lg-4">
                Immerse yourself in refined elegance, panoramic oceanfront vistas, and personalized concierge service. Book directly with zero hidden fees and instant confirmed availability.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <a href="#search-section" className="btn btn-warning btn-lg px-4 fw-bold text-dark">
                  <i className="bi bi-search me-2"></i>Find Available Rooms
                </a>
                <Link to="/rooms" className="btn btn-outline-light btn-lg px-4">
                  Browse All Suites
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-relative">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
                  alt="Grand Luxury Resort"
                  className="img-fluid rounded-4 shadow-lg border border-white border-opacity-25"
                  style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-dark bg-opacity-75 backdrop-blur text-white rounded-3 border border-secondary shadow-sm">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-geo-alt-fill text-warning fs-5"></i>
                    <div>
                      <div className="fw-bold small">Grand Palace & Luxury Resort Collection</div>
                      <div className="text-secondary" style={{ fontSize: '11px' }}>Global Coastal & Metropolitan Sanctuaries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Search Widget */}
      <section id="search-section" className="container position-relative" style={{ marginTop: '-40px', zIndex: 10 }}>
        <div className="bg-white p-4 p-md-4 rounded-4 shadow-lg border border-light-subtle">
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3 align-items-end">
              <div className="col-md-3 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  <i className="bi bi-calendar-check text-primary me-1"></i> Check-in Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg fs-6"
                  required
                  value={searchParams.checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSearchParams({ ...searchParams, checkIn: e.target.value })}
                />
              </div>

              <div className="col-md-3 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  <i className="bi bi-calendar-x text-primary me-1"></i> Check-out Date
                </label>
                <input
                  type="date"
                  className="form-control form-control-lg fs-6"
                  required
                  value={searchParams.checkOut}
                  min={searchParams.checkIn}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOut: e.target.value })}
                />
              </div>

              <div className="col-md-2 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  <i className="bi bi-people text-primary me-1"></i> Guests
                </label>
                <select
                  className="form-select form-select-lg fs-6"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6">5+ Guests</option>
                </select>
              </div>

              <div className="col-md-2 col-sm-6">
                <label className="form-label fw-bold small text-secondary">
                  <i className="bi bi-door-open text-primary me-1"></i> Suite Type
                </label>
                <select
                  className="form-select form-select-lg fs-6"
                  value={searchParams.roomType}
                  onChange={(e) => setSearchParams({ ...searchParams, roomType: e.target.value })}
                >
                  <option value="">All Types</option>
                  {roomTypes.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 col-12">
                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
                  <i className="bi bi-search me-1"></i> Check Rates
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Real Hospitality Accreditation Logos */}
      <TravelAccreditationLogos />

      {/* Feature Highlights */}
      <section className="py-5 bg-white mt-4">
        <div className="container py-4">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-primary-subtle text-primary rounded-circle d-inline-flex p-3 fs-3 mb-3">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h6 className="fw-bold mb-1">Zero Double-Booking Guarantee</h6>
                <p className="text-muted small">Real-time atomic reservation locking ensures your room is 100% reserved.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-3 fs-3 mb-3">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h6 className="fw-bold mb-1">Instant Digital Check-in</h6>
                <p className="text-muted small">Speedy arrival processing in under 60 seconds at our digital front desk.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-warning-subtle text-warning-emphasis rounded-circle d-inline-flex p-3 fs-3 mb-3">
                  <i className="bi bi-credit-card-2-front"></i>
                </div>
                <h6 className="fw-bold mb-1">Transparent Billing</h6>
                <p className="text-muted small">Itemized digital invoices with exact taxes and automated refund handling.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3">
                <div className="bg-info-subtle text-info rounded-circle d-inline-flex p-3 fs-3 mb-3">
                  <i className="bi bi-clock-history"></i>
                </div>
                <h6 className="fw-bold mb-1">24/7 Concierge & Service</h6>
                <p className="text-muted small">On-demand housekeeping, room service, and bespoke travel assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites Showcase */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-primary fw-bold text-uppercase small tracking-wider">Luxury Collection</span>
              <h2 className="fw-bold text-dark mb-0">Featured Rooms & Suites</h2>
            </div>
            <Link to="/rooms" className="btn btn-outline-primary mt-2 mt-md-0 fw-semibold">
              View All Accommodations <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          <div className="row g-4">
            {featuredRooms.map((room) => {
              const type = room.roomType;
              const price = room.pricePerNight != null ? room.pricePerNight : (type?.basePrice || 150);
              const img = (room.images && room.images[0]) || (type?.images && type.images[0]) || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

              return (
                <div key={room._id} className="col-lg-3 col-md-6">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-hover">
                    <div className="position-relative">
                      <img
                        src={img}
                        alt={`Room ${room.roomNumber}`}
                        className="card-img-top"
                        style={{ height: '210px', objectFit: 'cover' }}
                      />
                      <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 px-2.5 py-1.5 rounded-pill">
                        Room {room.roomNumber}
                      </span>
                      {(room.location || type?.location) && (
                        <div className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-90 text-warning px-2.5 py-1 text-truncate" style={{ maxWidth: '90%' }}>
                          <i className="bi bi-geo-alt-fill me-1"></i>{room.location || type?.location}
                        </div>
                      )}
                    </div>

                    <div className="card-body p-3 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h5 className="card-title fw-bold mb-0 text-dark fs-6">{type?.name || 'Deluxe Room'}</h5>
                        <div className="text-primary fw-extrabold fs-5">${price}<span className="text-muted fs-6 fw-normal">/nt</span></div>
                      </div>

                      {(room.patternStyle || type?.patternStyle) && (
                        <div className="small text-secondary mb-2 fst-italic" style={{ fontSize: '11px' }}>
                          <i className="bi bi-palette me-1 text-primary"></i>{room.patternStyle || type?.patternStyle}
                        </div>
                      )}

                      <p className="card-text text-muted small line-clamp-2 mb-3">
                        {type?.description || 'Luxurious accommodations tailored for complete relaxation.'}
                      </p>

                      <div className="d-flex align-items-center gap-3 text-secondary small mb-3 border-top pt-2">
                        <span><i className="bi bi-person me-1"></i>Up to {type?.capacity || 2}</span>
                        <span><i className="bi bi-layers me-1"></i>Floor {room.floor}</span>
                        <span><i className="bi bi-wifi me-1"></i>Free WiFi</span>
                      </div>

                      <div className="mt-auto">
                        <Link to={`/rooms/${room._id}`} className="btn btn-outline-primary w-100 fw-semibold rounded-3">
                          Explore & Reserve
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guest Reviews */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small">Testimonials</span>
            <h2 className="fw-bold">Loved by Guests Worldwide</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 border border-light-subtle">
                <div className="text-warning mb-2">
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i>
                </div>
                <p className="text-dark mb-3 fst-italic">
                  "Checking in was the smoothest experience I've had. The ocean view deluxe suite was immaculate, spotless, and the staff treated us like royalty."
                </p>
                <div className="fw-bold">Rachel Green</div>
                <div className="text-muted small">San Francisco, CA</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 border border-light-subtle">
                <div className="text-warning mb-2">
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i>
                </div>
                <p className="text-dark mb-3 fst-italic">
                  "The presidential penthouse was breathtaking. From private jacuzzi to butler breakfast, HotelPro exceeded all our high expectations."
                </p>
                <div className="fw-bold">Jonathan Vance</div>
                <div className="text-muted small">London, UK</div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light h-100 border border-light-subtle">
                <div className="text-warning mb-2">
                  <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i> <i className="bi bi-star-fill"></i>
                </div>
                <p className="text-dark mb-3 fst-italic">
                  "Fastest booking system ever. Got instant invoice, paid securely with card, and received immediate confirmation code for express check-in."
                </p>
                <div className="fw-bold">Maya Patel</div>
                <div className="text-muted small">Mumbai, India</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
