import React from 'react';

const BrandLogo = ({ size = 40, showText = true, textColor = 'text-white' }) => {
  return (
    <div className="d-inline-flex align-items-center gap-2 text-decoration-none">
      {/* Real luxury hospitality crest mark: Five-star crown, laurel wreath, and architectural monogram */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D061" />
            <stop offset="35%" stopColor="#E5A627" />
            <stop offset="70%" stopColor="#C68212" />
            <stop offset="100%" stopColor="#965B06" />
          </linearGradient>
          <linearGradient id="bg-royal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <filter id="gold-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Shield Border */}
        <path
          d="M60 6L98 22V58C98 83 60 110 60 110C60 110 22 83 22 58V22L60 6Z"
          fill="url(#bg-royal)"
          stroke="url(#gold-grad)"
          strokeWidth="3.5"
          filter="url(#gold-glow)"
        />

        {/* Inner Filigree Outline */}
        <path
          d="M60 13L91 26V57C91 78 60 101 60 101C60 101 29 78 29 57V26L60 13Z"
          stroke="url(#gold-grad)"
          strokeWidth="1.2"
          strokeOpacity="0.6"
          strokeDasharray="2 2"
        />

        {/* 5-Star Royal Crown */}
        <path
          d="M42 34L46 41H74L78 34L71 44L60 36L49 44L42 34Z"
          fill="url(#gold-grad)"
        />
        <circle cx="42" cy="33" r="1.5" fill="#FFF" />
        <circle cx="51" cy="31" r="1.5" fill="#FFF" />
        <circle cx="60" cy="29" r="1.8" fill="#FFF" />
        <circle cx="69" cy="31" r="1.5" fill="#FFF" />
        <circle cx="78" cy="33" r="1.5" fill="#FFF" />

        {/* Architectural Pillars & 'H' Monogram */}
        <path
          d="M45 49H52V62H68V49H75V85H68V69H52V85H45V49Z"
          fill="url(#gold-grad)"
        />

        {/* Classical Pediment Bar */}
        <rect x="42" y="47" width="36" height="2.5" rx="1" fill="url(#gold-grad)" />
        <rect x="40" y="85" width="40" height="3" rx="1.5" fill="url(#gold-grad)" />

        {/* Laurel Wreath Accents */}
        <path
          d="M33 55C31 66 37 77 44 83"
          stroke="url(#gold-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M87 55C89 66 83 77 76 83"
          stroke="url(#gold-grad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="d-flex flex-column leading-none">
          <span className={`fw-extrabold tracking-tight fs-4 ${textColor}`} style={{ letterSpacing: '-0.5px' }}>
            HOTEL<span style={{ color: '#F59E0B' }}>PRO</span>
          </span>
          <span className="text-uppercase tracking-widest text-warning" style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '2px' }}>
            LUXURY RESORTS
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
