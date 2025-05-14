import React from 'react';

interface TornPaperDividerProps {
  inverted?: boolean;
  color?: string; // e.g. '#fff', 'rgba(255,255,255,0.3)', etc.
  height?: number; // height in px
}

const TornPaperDivider: React.FC<TornPaperDividerProps> = ({ inverted = false, color = '#fff', height = 60 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 1200 ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className={`block w-full ${inverted ? 'rotate-180' : ''}`}
      aria-hidden="true"
      style={{ display: 'block', height }}
    >
      <path
        d="M0,30 Q120,60 240,30 T480,30 T720,30 T960,30 T1200,30 V60 H0 Z"
        fill={color}
      />
    </svg>
  );
};

export default TornPaperDivider; 