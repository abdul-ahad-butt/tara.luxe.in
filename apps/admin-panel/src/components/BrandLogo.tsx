import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 42,
  showText = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 select-none flex-shrink-0 ${className}`}>
      {/* Circular Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-md"
      >
        <circle cx="60" cy="60" r="58" fill="#F7F1E3" stroke="#D4AF37" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="#C5A059" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="60" cy="60" r="47" fill="none" stroke="#D4AF37" strokeWidth="0.8" />

        <path
          d="M60 16 Q60 21 65 21 Q60 21 60 26 Q60 21 55 21 Q60 21 60 16 Z"
          fill="#D4AF37"
        />

        <g id="TL-Monogram">
          <path
            d="M34 40 H68 M51 40 V82 M45 82 H57"
            stroke="#161311"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M58 46 V80 H82 M76 74 L84 82"
            stroke="#C5A059"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <path
          d="M68 52 Q68 56 72 56 Q68 56 68 60 Q68 56 64 56 Q68 56 68 52 Z"
          fill="#D4AF37"
        />

        <path
          d="M60 94 Q60 97 63 97 Q60 97 60 100 Q60 97 57 97 Q60 97 60 94 Z"
          fill="#C5A059"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight flex-shrink-0 whitespace-nowrap">
          <span className="font-serif tracking-[0.2em] text-base font-bold text-gold uppercase flex items-center gap-1 whitespace-nowrap">
            TARA LUXE
            <span className="text-[10px] text-gold-brushed">✦</span>
          </span>
          <span className="text-[8.5px] tracking-[0.22em] font-mono text-ivory/70 uppercase font-semibold whitespace-nowrap">
            TARA LUXE ADMIN CENTER
          </span>
        </div>
      )}
    </div>
  );
};
