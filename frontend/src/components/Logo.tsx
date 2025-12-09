import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className }) => {
  const width = size;
  const height = size;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="ZyrexAi logo"
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a005a" />
          <stop offset="100%" stopColor="#9a00ff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="8" fill="#0b0b0b" />

      {/* Stylized Z built from geometric / circuit-like blocks */}
      <g transform="translate(6,8) scale(0.85)">
        <rect x="4" y="2" width="8" height="6" rx="1" fill="url(#g)" />
        <rect x="18" y="2" width="28" height="6" rx="1" fill="url(#g)" />
        <rect x="44" y="2" width="8" height="6" rx="1" fill="url(#g)" />

        <rect x="18" y="10" width="6" height="6" rx="1" fill="url(#g)" />
        <rect x="28" y="18" width="8" height="6" rx="1" fill="url(#g)" />
        <rect x="38" y="26" width="6" height="6" rx="1" fill="url(#g)" />

        <rect x="4" y="34" width="8" height="6" rx="1" fill="url(#g)" />
        <rect x="18" y="34" width="28" height="6" rx="1" fill="url(#g)" />
        <rect x="44" y="34" width="8" height="6" rx="1" fill="url(#g)" />

        {/* small connecting lines to suggest circuit connections */}
        <rect x="12" y="8" width="6" height="2" rx="1" fill="#1b002f" />
        <rect x="34" y="30" width="6" height="2" rx="1" fill="#1b002f" />
      </g>
    </svg>
  );
};

export default Logo;
