import React, { useState, useRef } from 'react';
import { Product, useStore } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { ShoppingBag, Eye, Sparkles, Check, Droplets, ShieldCheck, X } from 'lucide-react';

interface ProductCard3DProps {
  product: Product;
}

export const ProductCard3D: React.FC<ProductCard3DProps> = ({ product }) => {
  const { addToBag } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const isSoldOut = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    addToBag(product, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="tilt-card-wrapper relative rounded-2xl cursor-pointer select-none"
        onClick={() => setQuickViewOpen(true)}
      >
        <div
          className="tilt-card-inner rounded-2xl glass-card overflow-hidden flex flex-col justify-between border border-gold/20 hover:border-gold/50 transition-all duration-200"
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
              : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
          }}
        >
          {/* Specular glare overlay */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(212, 175, 55, 0.22) 0%, transparent 65%)`
              }}
            />
          )}

          <div>
            {/* Product Image Stage with Luxury Fallback */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-espresso">
              <LuxuryImage
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent opacity-60" />

              {/* Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-espresso/90 border border-gold/40 text-gold-light text-[10px] font-mono uppercase tracking-wider shadow-sm">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Dynamic Real-time Stock Badge */}
              <div className="absolute top-3 right-3 z-10">
                {isSoldOut ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-ruby-stock/20 border border-ruby-stock/50 text-ruby-stock text-[10px] font-mono font-bold">
                    Sold Out
                  </span>
                ) : isLowStock ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-ruby-stock/25 border border-ruby-stock/60 text-ruby-stock text-[10px] font-mono font-bold animate-pulse">
                    Only {product.quantity} left!
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-stock/20 border border-emerald-stock/50 text-emerald-stock text-[10px] font-mono font-medium">
                    In Stock: {product.quantity}
                  </span>
                )}
              </div>

              {/* Hover Quick View Trigger */}
              <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 z-10">
                <span className="px-3 py-1 rounded-full bg-obsidian/90 border border-gold/30 text-gold text-xs font-medium flex items-center gap-1.5 shadow-md">
                  <Eye className="w-3.5 h-3.5" /> Quick View
                </span>
              </div>
            </div>

            {/* Product Meta */}
            <div className="p-4 sm:p-5">
              <div className="text-[10px] uppercase font-mono tracking-wider text-gold-brushed mb-1">
                {product.category}
              </div>
              <h3 className="font-serif text-base font-bold text-ivory line-clamp-1 group-hover:text-gold transition-colors">
                {product.name}
              </h3>
              <p className="mt-1.5 text-xs text-ivory-warm/70 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Specs Pills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded bg-espresso border border-gold/20 text-ivory/80 flex items-center gap-1">
                  <Droplets className="w-2.5 h-2.5 text-cyan-400" /> Waterproof
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-espresso border border-gold/20 text-ivory/80 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-gold" /> 316L 18k
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Add to Bag CTA */}
          <div className="p-4 sm:p-5 pt-0">
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl font-bold text-gold">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-xs text-ivory/50 line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {product.compareAtPrice > product.price && (
                <span className="text-[10px] font-mono text-emerald-stock font-bold">
                  {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <button
              disabled={isSoldOut}
              onClick={handleAddClick}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                isSoldOut
                  ? 'bg-ivory/10 text-ivory/40 cursor-not-allowed border border-ivory/10'
                  : addedAnim
                  ? 'bg-emerald-stock text-obsidian shadow-emerald-stock/30'
                  : 'bg-gradient-to-r from-gold-brushed to-gold hover:from-gold hover:to-gold-light text-obsidian shadow-md hover:shadow-gold-glow'
              }`}
            >
              {addedAnim ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={() => setQuickViewOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-3xl bg-espresso border border-gold/30 shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-obsidian">
              <LuxuryImage
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setQuickViewOpen(false)}
                className="md:hidden absolute top-3 right-3 p-2 rounded-full bg-obsidian/70 text-ivory hover:text-gold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-gold-brushed">
                    {product.category}
                  </span>
                  <button
                    onClick={() => setQuickViewOpen(false)}
                    className="hidden md:block p-1 text-ivory/70 hover:text-gold"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ivory mb-2">
                  {product.name}
                </h2>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-serif text-2xl font-bold text-gold">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-sm text-ivory/50 line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-emerald-stock font-mono font-bold">
                    In Stock: {product.quantity}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-ivory-warm/80 leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Specs list */}
                <div className="space-y-1.5 mb-6">
                  {product.specs?.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-ivory/90">
                      <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  disabled={isSoldOut}
                  onClick={(e) => {
                    handleAddClick(e);
                    setQuickViewOpen(false);
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSoldOut
                      ? 'bg-ivory/10 text-ivory/40 cursor-not-allowed'
                      : 'bg-gold hover:bg-gold-light text-obsidian shadow-gold-glow'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isSoldOut ? 'Sold Out' : 'Add to Bag Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
