import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="mb-3">
              <BrandLogo size={36} />
            </div>
            <p className="text-secondary small pe-lg-4">
              HotelPro is an enterprise-grade hospitality management system engineered for independent boutique hotels and luxury resorts. Real-time availability, zero double-bookings, seamless front-desk workflows, and comprehensive guest analytics.
            </p>
            <div className="d-flex gap-3 text-secondary fs-5">
              <a href="#facebook" className="text-secondary hover-warning"><i className="bi bi-facebook"></i></a>
              <a href="#instagram" className="text-secondary hover-warning"><i className="bi bi-instagram"></i></a>
              <a href="#twitter" className="text-secondary hover-warning"><i className="bi bi-twitter-x"></i></a>
              <a href="#linkedin" className="text-secondary hover-warning"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3 small">Quick Links</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/rooms" className="text-secondary text-decoration-none">Rooms & Suites</Link></li>
              <li className="mb-2"><Link to="/login" className="text-secondary text-decoration-none">Guest Login</Link></li>
              <li className="mb-2"><Link to="/register" className="text-secondary text-decoration-none">Register Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3 small">Operations</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2"><Link to="/staff" className="text-secondary text-decoration-none">Front Desk Portal</Link></li>
              <li className="mb-2"><Link to="/staff/room-board" className="text-secondary text-decoration-none">Room Status Grid</Link></li>
              <li className="mb-2"><Link to="/admin" className="text-secondary text-decoration-none">Admin Dashboard</Link></li>
              <li className="mb-2"><Link to="/admin/reports" className="text-secondary text-decoration-none">Revenue Reports</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-uppercase fw-bold text-warning mb-3 small">Hotel Concierge</h6>
            <ul className="list-unstyled text-secondary small">
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-geo-alt text-warning"></i>
                <span>100 Ocean Boulevard, South Beach, Miami FL 33101</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-telephone text-warning"></i>
                <span>+1 (800) 555-HOTEL / +1 (305) 555-0199</span>
              </li>
              <li className="mb-2 d-flex gap-2">
                <i className="bi bi-envelope text-warning"></i>
                <span>concierge@hotelpro.com</span>
              </li>
              <li className="d-flex gap-2">
                <i className="bi bi-clock text-warning"></i>
                <span>Check-in: 2:00 PM | Check-out: 12:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-top border-secondary pt-3 d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <p className="mb-0">© {new Date().getFullYear()} HotelPro Management System. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Security & DPDP Compliant</span>
            <span>•</span>
            <span>REST API v1.0</span>
            <span>•</span>
            <span>MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
