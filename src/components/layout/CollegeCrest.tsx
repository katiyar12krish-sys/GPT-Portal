import React from 'react';

/** Simple college crest: navy shield, gold border, open book and gear (diploma engineering), "UGIP". Not an official seal. */
export const CollegeCrest: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" role="img" aria-label="UGIP Tanakpur crest" className={className}>
    <path d="M50 3 L94 16 V55 C94 84 74 102 50 112 C26 102 6 84 6 55 V16 Z" fill="#13294b" stroke="#c49a2c" strokeWidth="5" />
    <path d="M50 12 L86 22 V55 C86 79 70 94 50 103 C30 94 14 79 14 55 V22 Z" fill="none" stroke="#e6c66f" strokeWidth="1.2" opacity="0.7" />
    {/* gear */}
    <g transform="translate(50 40)" fill="#e6c66f">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="-3" y="-17" width="6" height="7" rx="1" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="12" />
      <circle r="5.5" fill="#13294b" />
    </g>
    {/* open book */}
    <path d="M24 64 C33 60 42 61 50 66 C58 61 67 60 76 64 V80 C67 76 58 77 50 82 C42 77 33 76 24 80 Z" fill="#ffffff" />
    <path d="M50 66 V82" stroke="#13294b" strokeWidth="1.5" />
    <text x="50" y="99" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="12" fill="#e6c66f" letterSpacing="0.5">
      UGIP
    </text>
  </svg>
);
