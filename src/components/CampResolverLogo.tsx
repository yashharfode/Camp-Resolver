'use client';

import React from 'react';

interface CampResolverLogoProps {
  className?: string;
  size?: number;
}

/**
 * Professional geometric 3-tier stacked layers mark for Camp Resolver.
 * Clean, modern SaaS vector emblem without any enclosing box or background container.
 */
export const CampResolverLogo: React.FC<CampResolverLogoProps> = ({
  className = 'w-7 h-7',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Camp Resolver Logo"
    >
      {/* Top Floating Layer (Solid with subtle gradient) */}
      <path
        d="M18 3.5L31 10.2L18 16.9L5 10.2L18 3.5Z"
        fill="#007A78"
      />
      {/* Top Layer Rim / Highlight */}
      <path
        d="M18 4.2L29.8 10.2L18 16.2L6.2 10.2L18 4.2Z"
        stroke="#14B8A6"
        strokeWidth="0.8"
        strokeOpacity="0.4"
      />

      {/* Middle Layer (Perspective Chevron / Slab) */}
      <path
        d="M5 15.2L18 21.9L31 15.2L31 18.2L18 24.9L5 18.2V15.2Z"
        fill="#008A87"
      />
      {/* Middle Layer Front Depth */}
      <path
        d="M5 16.8L18 23.5L31 16.8"
        stroke="#005C5A"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bottom Layer (Base Perspective Slab) */}
      <path
        d="M5 22.8L18 29.5L31 22.8L31 25.8L18 32.5L5 25.8V22.8Z"
        fill="#005C5A"
      />
      {/* Bottom Layer Front Edge */}
      <path
        d="M5 24.4L18 31.1L31 24.4"
        stroke="#004342"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CampResolverLogo;
