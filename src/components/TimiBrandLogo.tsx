import React from 'react';

interface InfinityClockLogoProps {
  size?: number;
  className?: string;
  variant?: 'filled' | 'outline' | 'flat';
}

/**
 * Official TIMI Brand Logo:
 * Hình đồng hồ kết hợp mũi tên vô cực (Infinity Clock & Arrow)
 * với tông màu hồng pastel tinh tế chuẩn nhận diện thương hiệu TIMI.
 */
export const InfinityClockLogo: React.FC<InfinityClockLogoProps> = ({
  size = 40,
  className = '',
  variant = 'filled'
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl flex-shrink-0 select-none ${
        variant === 'filled'
          ? 'bg-gradient-to-br from-[#FF85A1] via-[#FFAAA6] to-[#FF6B8B] shadow-sm text-white'
          : 'bg-[#FFF0F3] border border-[#FFCCD5] text-[#D81B60]'
      } ${className}`}
      style={{ width: size, height: size }}
      aria-label="TIMI Infinity Clock Logo"
    >
      <svg
        viewBox="0 0 100 100"
        width={size * 0.72}
        height={size * 0.72}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Subtle drop shadow for depth */}
        <defs>
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#991B3A" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#logoGlow)">
          {/* 1. Clock Face Circle Dial */}
          <circle
            cx="50"
            cy="50"
            r="28"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* 2. Clock Hour Ticks at 12, 3, 6, 9 */}
          <line x1="50" y1="26" x2="50" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="74" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="74" x2="50" y2="70" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="26" y1="50" x2="30" y2="50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

          {/* 3. Clock Hands: 10:10 Active Focus Angle */}
          <line x1="50" y1="50" x2="50" y2="33" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="50" y1="50" x2="64" y2="48" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3.5" fill="currentColor" />

          {/* 4. Elegant Infinity Loop (∞) wrapping dynamically across the clock face */}
          <path
            d="M32 50 C18 36 10 42 10 52 C10 62 18 68 32 54 C43 43 57 43 68 54 C82 68 90 62 90 52 C90 42 82 36 68 50 C57 61 43 61 32 50 Z"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 5. Infinity Arrow Head pointing forward / up-right at the loop transition */}
          <path
            d="M74 36 L86 46 L75 52"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
