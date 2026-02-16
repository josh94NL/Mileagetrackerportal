import { useId } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Background */}
      <rect width="64" height="64" rx="16" fill={`url(#bg${uid})`} />

      {/* Subtle grid dots */}
      <circle cx="14" cy="14" r="1.5" fill="#00E5A0" opacity="0.25" />
      <circle cx="24" cy="14" r="1" fill="#00E5A0" opacity="0.15" />
      <circle cx="14" cy="24" r="1" fill="#8B5CF6" opacity="0.15" />
      <circle cx="50" cy="50" r="1.5" fill="#8B5CF6" opacity="0.25" />
      <circle cx="40" cy="50" r="1" fill="#8B5CF6" opacity="0.15" />

      {/* Route path - 3D shadow */}
      <path
        d="M14 48 C18 30, 24 18, 34 16 C44 14, 50 24, 50 24"
        stroke="#8B5CF6"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.25"
        transform="translate(1.5, 2)"
      />
      {/* Route path - main */}
      <path
        d="M14 48 C18 30, 24 18, 34 16 C44 14, 50 24, 50 24"
        stroke={`url(#route${uid})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arrowhead shadow */}
      <path
        d="M45 18 L52 24 L45 30"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.3"
        transform="translate(1, 1.5)"
      />
      {/* Arrowhead */}
      <path
        d="M45 18 L52 24 L45 30"
        stroke={`url(#arrow${uid})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Car */}
      <g transform="translate(18, 34)">
        {/* Body */}
        <path
          d="M0 7 L2 2.5 C3 1, 5 0, 8 0 L18 0 C21 0, 23 1, 24 2.5 L26 7 L26 10 C26 11, 25 12, 24 12 L2 12 C1 12, 0 11, 0 10 Z"
          fill={`url(#car${uid})`}
        />
        {/* Windshield */}
        <path
          d="M5 6 L7 2.5 C7.5 1.5, 9 1, 10 1 L16 1 C17 1, 18.5 1.5, 19 2.5 L21 6 Z"
          fill="#0a0f1e"
          opacity="0.7"
        />
        {/* Wheels */}
        <circle cx="6" cy="12" r="3" fill="#0a0f1e" />
        <circle cx="6" cy="12" r="1.5" fill="#00E5A0" opacity="0.7" />
        <circle cx="20" cy="12" r="3" fill="#0a0f1e" />
        <circle cx="20" cy="12" r="1.5" fill="#00E5A0" opacity="0.7" />
        {/* Headlight */}
        <circle cx="25" cy="8" r="1.5" fill="#00E5A0" opacity="0.9" />
      </g>

      {/* Speed lines */}
      <line x1="10" y1="42" x2="17" y2="42" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="8" y1="46" x2="16" y2="46" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="11" y1="50" x2="15" y2="50" stroke="#00E5A0" strokeWidth="1" strokeLinecap="round" opacity="0.3" />

      {/* Origin marker */}
      <circle cx="14" cy="48" r="3.5" fill={`url(#dot${uid})`} opacity="0.9" />
      <circle cx="14" cy="48" r="1.5" fill="#0a0f1e" />

      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#131530" />
          <stop offset="100%" stopColor="#0e1025" />
        </linearGradient>
        <linearGradient id={`route${uid}`} x1="14" y1="48" x2="50" y2="16">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="60%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#00FFB2" />
        </linearGradient>
        <linearGradient id={`arrow${uid}`} x1="45" y1="18" x2="52" y2="30">
          <stop offset="0%" stopColor="#00FFB2" />
          <stop offset="100%" stopColor="#00E5A0" />
        </linearGradient>
        <linearGradient id={`car${uid}`} x1="0" y1="0" x2="26" y2="12">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#00CC8E" />
        </linearGradient>
        <radialGradient id={`dot${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LogoMark({ size = 24, className = '' }: LogoProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M6 24 C8 14, 12 6, 16 5 C22 3, 26 10, 26 10"
        stroke={`url(#smRoute${uid})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22 6 L27 10.5 L22 15"
        stroke="#00E5A0"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="6" cy="24" r="3" fill={`url(#smDot${uid})`} />
      <circle cx="6" cy="24" r="1.2" fill="#07070e" />

      <defs>
        <linearGradient id={`smRoute${uid}`} x1="6" y1="24" x2="26" y2="5">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#00E5A0" />
        </linearGradient>
        <radialGradient id={`smDot${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
      </defs>
    </svg>
  );
}
