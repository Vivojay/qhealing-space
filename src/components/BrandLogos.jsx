// Minimalist inline SVG brand marks used as official-style logo chips
// in payment lists. Each fits a 24x24 viewBox.
import React from 'react';

export function PaytmLogo({ size = 24 }) {
  const width = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1920px-Paytm_Logo_%28standalone%29.svg.png?_=20200830180423"
      alt="Paytm"
      style={{ width, height: 'auto', display: 'block', objectFit: 'contain' }}
    />
  );
}

export function WiseLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Wise">
      <rect width="24" height="24" rx="6" fill="#163300" />
      <path d="M5 7l5 5-5 5h3l5-5-5-5H5z" fill="#9FE870" />
      <path d="M11 7l5 5-5 5h3l5-5-5-5h-3z" fill="#9FE870" />
    </svg>
  );
}

export function PayPalLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="PayPal">
      <rect width="24" height="24" rx="4" fill="#fff" />
      <path
        d="M9.4 5h4.1c2.6 0 4 1.4 3.6 3.7-.4 2.3-2.2 3.5-4.6 3.5h-1.6l-.5 3.2H8.5L9.4 5z"
        fill="#003087"
      />
      <path
        d="M11.4 7.4h2.7c1.7 0 2.6.9 2.4 2.4-.3 1.6-1.5 2.4-3.1 2.4H12l-.4 2.6h-1.5l1.3-7.4z"
        fill="#0070BA"
      />
      <path d="M7 8.6h4.1c2.6 0 4 1.4 3.6 3.7-.4 2.3-2.2 3.5-4.6 3.5H8.6L8.1 19H6L7 8.6z" fill="#009CDE" opacity="0.85" />
    </svg>
  );
}

export function RemitlyLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Remitly">
      <rect width="24" height="24" rx="12" fill="#FF335F" />
      <path
        d="M8 6h4.6c2 0 3.4 1.2 3.4 3 0 1.4-.9 2.5-2.3 2.9l2.6 4.1h-2.7L11 12.3h-1V16H8V6zm2 1.7v3h2.4c.9 0 1.5-.6 1.5-1.5s-.6-1.5-1.5-1.5H10z"
        fill="#fff"
      />
    </svg>
  );
}

export function WesternUnionLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="Western Union">
      <rect width="24" height="24" rx="4" fill="#FFDD00" />
      <path
        d="M3.5 7l1.6 7.8h2L8.4 9l1.3 5.8h2L13.4 7h-1.7l-1 5.4L9.5 7H8l-1.3 5.4L5.7 7H3.5zm12 0l1.6 7.8h2L20.4 7h-1.7l-1 5.4L16.5 7h-1z"
        fill="#000"
      />
    </svg>
  );
}

export function SwiftLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label="SWIFT">
      <rect width="24" height="24" rx="4" fill="#0a1f44" />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="6.5"
        fontWeight="700"
        fill="#fff"
        letterSpacing="0.5"
      >
        SWIFT
      </text>
    </svg>
  );
}
