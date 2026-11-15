import React, { useState } from 'react';

interface LuxuryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const LUXURY_GOLD_FALLBACK = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23161311'/><circle cx='200' cy='200' r='140' fill='none' stroke='%23C5A059' stroke-width='3' stroke-dasharray='4 3'/><circle cx='200' cy='200' r='120' fill='%230B0A09' stroke='%23D4AF37' stroke-width='2'/><text x='200' y='195' font-family='serif' font-size='28' font-weight='bold' text-anchor='middle' fill='%23D4AF37'>TARA LUXE</text><text x='200' y='230' font-family='monospace' font-size='12' letter-spacing='3' text-anchor='middle' fill='%23F5E6BE'>18k ANTI-TARNISH</text><path d='M200 80 Q200 95 210 95 Q200 95 200 110 Q200 95 190 95 Q200 95 200 80 Z' fill='%23D4AF37'/></svg>";

export const LuxuryImage: React.FC<LuxuryImageProps> = ({
  src,
  alt = 'Tara Luxe 18k Jewellery',
  className = '',
  fallbackSrc = LUXURY_GOLD_FALLBACK,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  return (
    <img
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      loading="lazy"
      {...props}
    />
  );
};
