import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-3" style={{ backgroundColor: '#0f172a' }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <BrandLogo size={36} />
        </Link>

        {/* Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#hotelProNavbar"
          aria-controls="hotelProNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="hotelProNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/rooms">
                <i className="bi bi-door-open me-1"></i> Rooms & Suites
              </NavLink>
            </li>

            {/* Staff / Admin navigation links */}
            {isStaff && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-info fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-speedometer2 me-1"></i> Front Desk
                </a>
                <ul className="dropdown-menu dropdown-menu-dark shadow">
                  <li><Link className="dropdown-item" to="/staff"><i className="bi bi-grid-1x2 me-2"></i>Desk Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/staff/room-board"><i className="bi bi-grid-3x3-gap me-2"></i>Room Status Board</Link></li>
                  <li><Link className="dropdown-item" to="/staff/walk-in"><i className="bi bi-person-plus me-2"></i>Walk-in Booking</Link></li>
                  <li><Link className="dropdown-item" to="/staff/guests"><i className="bi bi-people me-2"></i>Guest Directory</Link></li>
                  <li><Link className="dropdown-item" to="/staff/tasks"><i className="bi bi-check2-square me-2"></i>Housekeeping & Tasks</Link></li>
                </ul>
              </li>
            )}

            {/* Admin Management links */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle text-warning fw-medium" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="bi bi-shield-lock me-1"></i> Admin Console
                </a>
                <ul className="dropdown-menu dropdown-menu-dark shadow">
                  <li><Link className="dropdown-item" to="/admin"><i className="bi bi-graph-up me-2"></i>Analytics Dashboard</Link></li>
                  <li><Link className="dropdown-item" to="/admin/rooms"><i className="bi bi-door-closed me-2"></i>Manage Rooms & Types</Link></li>
                  <li><Link className="dropdown-item" to="/admin/bookings"><i className="bi bi-journal-bookmark me-2"></i>All Bookings</Link></li>
                  <li><Link className="dropdown-item" to="/admin/staff"><i className="bi bi-person-badge me-2"></i>Manage Staff Accounts</Link></li>
                  <li><Link className="dropdown-item" to="/admin/reports"><i className="bi bi-file-earmark-bar-graph me-2"></i>Reports & Exports</Link></li>
                </ul>
              </li>
            )}

            {/* Guest navigation links */}
            {isAuthenticated && !isStaff && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active text-warning fw-semibold' : ''}`} to="/my-bookings">
                  <i className="bi bi-calendar-check me-1"></i> My Bookings
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right side auth */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 border-secondary"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-start d-none d-md-block">
                    <div className="fw-semibold small leading-tight">{user?.name}</div>
                    <div className="text-warning text-uppercase" style={{ fontSize: '10px' }}>
                      {user?.designation || user?.role}
                    </div>
                  </div>
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow">
                  <li className="dropdown-header text-muted">
                    Signed in as <strong>{user?.email}</strong>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person me-2"></i>Profile Settings
                    </Link>
                  </li>
                  {user?.role === 'guest' && (
                    <li>
                      <Link className="dropdown-item" to="/my-bookings">
                        <i className="bi bi-calendar2-check me-2"></i>My Bookings
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light px-3 py-1.5">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-warning px-3 py-1.5 fw-semibold text-dark">
                  Join / Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
