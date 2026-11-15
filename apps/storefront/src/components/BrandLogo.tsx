import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  light?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 46,
  showText = true,
  className = '',
  light = true
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
        className="flex-shrink-0 drop-shadow-md hover:scale-105 transition-transform duration-300"
      >
        {/* Outer Circular Badge */}
        <circle cx="60" cy="60" r="58" fill="#F7F1E3" stroke="#D4AF37" strokeWidth="2.5" />
        
        {/* Inner Champagne Gold Concentric Ring */}
        <circle cx="60" cy="60" r="51" fill="none" stroke="#C5A059" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="60" cy="60" r="47" fill="none" stroke="#D4AF37" strokeWidth="0.8" />

        {/* Four-Point Sparkle ✦ at Top */}
        <path
          d="M60 16 Q60 21 65 21 Q60 21 60 26 Q60 21 55 21 Q60 21 60 16 Z"
          fill="#D4AF37"
        />

        {/* Intertwined Serif TL Monogram */}
        <g id="TL-Monogram">
          {/* 'T' Character */}
          <path
            d="M34 40 H68 M51 40 V82 M45 82 H57"
            stroke="#161311"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 'L' Character Intertwined */}
          <path
            d="M58 46 V80 H82 M76 74 L84 82"
            stroke="#C5A059"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Center Sparkle Accent */}
        <path
          d="M68 52 Q68 56 72 56 Q68 56 68 60 Q68 56 64 56 Q68 56 68 52 Z"
          fill="#D4AF37"
        />

        {/* Bottom Small Star Sparkle */}
        <path
          d="M60 94 Q60 97 63 97 Q60 97 60 100 Q60 97 57 97 Q60 97 60 94 Z"
          fill="#C5A059"
        />
      </svg>

      {/* Brand Typography - Strictly whitespace-nowrap and flex-shrink-0 to never wrap vertically */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight flex-shrink-0 whitespace-nowrap">
          <span className="font-serif tracking-[0.2em] sm:tracking-[0.25em] text-base sm:text-lg font-bold text-gold uppercase drop-shadow-sm flex items-center gap-1.5 whitespace-nowrap">
            TARA LUXE
            <span className="text-xs text-gold-brushed">✦</span>
          </span>
          <span className="text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.28em] font-medium text-ivory-warm/80 uppercase whitespace-nowrap">
            Anti-Tarnish Jewellery
          </span>
        </div>
      )}
    </div>
  );
};
