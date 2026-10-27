import React from 'react';

export const TravelAccreditationLogos = () => {
  return (
    <div className="py-4 border-top border-bottom border-light-subtle bg-white">
      <div className="container">
        <div className="text-center small text-uppercase fw-bold text-secondary mb-3" style={{ letterSpacing: '1.5px', fontSize: '11px' }}>
          Recognized by the World's Leading Hospitality Standards
        </div>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 opacity-80">
          {/* Forbes Travel Guide Five Star */}
          <div className="d-flex align-items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#D97706">
              <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
            </svg>
            <div className="text-start" style={{ lineHeight: '1.1' }}>
              <div className="fw-extrabold text-dark small" style={{ letterSpacing: '0.5px' }}>FORBES</div>
              <div className="text-secondary" style={{ fontSize: '9px', fontWeight: '600' }}>TRAVEL GUIDE 5-STAR</div>
            </div>
          </div>

          {/* Condé Nast Traveler */}
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark text-white fw-bold px-2 py-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>CNT</span>
            <div className="text-start" style={{ lineHeight: '1.1' }}>
              <div className="fw-bold text-dark small">CONDÉ NAST</div>
              <div className="text-secondary" style={{ fontSize: '9px' }}>TRAVELER GOLD LIST 2026</div>
            </div>
          </div>

          {/* Michelin Guide Selected */}
          <div className="d-flex align-items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#DC2626">
              <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" fill="none" />
              <path d="M12 6v12M6 12h12M7.8 7.8l8.4 8.4M7.8 16.2l8.4-8.4" stroke="#DC2626" strokeWidth="2" />
            </svg>
            <div className="text-start" style={{ lineHeight: '1.1' }}>
              <div className="fw-extrabold text-danger small">MICHELIN</div>
              <div className="text-secondary" style={{ fontSize: '9px' }}>GUIDE SELECTED KEY 2026</div>
            </div>
          </div>

          {/* Tripadvisor Travelers' Choice */}
          <div className="d-flex align-items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#059669">
              <circle cx="7" cy="14" r="3" fill="#059669" />
              <circle cx="17" cy="14" r="3" fill="#059669" />
              <circle cx="7" cy="14" r="1" fill="#fff" />
              <circle cx="17" cy="14" r="1" fill="#fff" />
              <path d="M12 9c2-2 5-2 8 0l1-2c-4-3-8-3-12 0-4-3-8-3-12 0l1 2c3-2 6-2 8 0z" />
            </svg>
            <div className="text-start" style={{ lineHeight: '1.1' }}>
              <div className="fw-bold text-dark small">TRIPADVISOR</div>
              <div className="text-secondary" style={{ fontSize: '9px' }}>BEST OF THE BEST 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PaymentMethodLogos = () => {
  return (
    <div className="d-flex flex-wrap align-items-center gap-3">
      {/* Visa */}
      <div className="px-2.5 py-1 bg-white rounded border shadow-xs d-flex align-items-center" style={{ height: '28px' }}>
        <span className="fw-extrabold fst-italic text-primary" style={{ fontSize: '15px', letterSpacing: '-0.5px' }}>
          VISA
        </span>
      </div>

      {/* Mastercard */}
      <div className="px-2 py-1 bg-white rounded border shadow-xs d-flex align-items-center" style={{ height: '28px' }}>
        <svg width="30" height="18" viewBox="0 0 36 22">
          <circle cx="13" cy="11" r="10" fill="#EB001B" />
          <circle cx="23" cy="11" r="10" fill="#F79E1B" fillOpacity="0.88" />
        </svg>
      </div>

      {/* American Express */}
      <div className="px-2.5 py-1 bg-primary text-white rounded font-monospace fw-bold small" style={{ fontSize: '11px', height: '28px', lineHeight: '20px' }}>
        AMEX
      </div>

      {/* Apple Pay */}
      <div className="px-2.5 py-1 bg-dark text-white rounded fw-bold small d-flex align-items-center gap-1" style={{ fontSize: '12px', height: '28px' }}>
        <i className="bi bi-apple"></i> Pay
      </div>

      {/* Google Pay */}
      <div className="px-2.5 py-1 bg-white text-dark border rounded fw-semibold small d-flex align-items-center gap-1" style={{ fontSize: '12px', height: '28px' }}>
        <span className="text-primary fw-bold">G</span>Pay
      </div>
    </div>
  );
};

export default { TravelAccreditationLogos, PaymentMethodLogos };
