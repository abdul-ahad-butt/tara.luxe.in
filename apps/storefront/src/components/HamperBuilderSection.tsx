import React from 'react';
import { useStore } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { Gift, Check, ShoppingBag, MessageCircle } from 'lucide-react';

export const HamperBuilderSection: React.FC = () => {
  const { products, addToBag } = useStore();

  // Filter products in the "Tara Hampers" category
  const hamperProducts = products.filter(p => p.category === 'Tara Hampers');

  return (
    <section id="hampers" className="py-16 sm:py-24 bg-gradient-to-b from-espresso/40 via-obsidian to-espresso/30 border-y border-gold/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold-light text-xs font-mono uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5 text-gold" />
            <span>Festive Gifting & Wedding Suites</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory tracking-tight">
            The Signature <span className="text-gold italic font-normal">"தாRA HAMPER"</span> Collection
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ivory-warm/80 leading-relaxed">
            Curated elegance ready for gifting. Every தாRA hamper combines a hand-selected festive saree, coordinated glass bangles, traditional Accron bindi sheet, and our signature 18k gold-plated anti-tarnish jewellery in a luxury keepsake box.
          </p>
        </div>

        {/* Hampers Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {hamperProducts.map((hamper) => {
            const isSoldOut = hamper.quantity <= 0;
            const isLowStock = hamper.quantity > 0 && hamper.quantity <= 5;

            return (
              <div
                key={hamper.id}
                className="group rounded-3xl glass-card flex flex-col justify-between overflow-hidden border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:shadow-gold-glow/20"
              >
                <div>
                  {/* Hamper Image with Luxury Fallback */}
                  <div className="relative h-60 sm:h-64 overflow-hidden bg-espresso">
                    <LuxuryImage
                      src={hamper.imageUrl}
                      alt={hamper.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-gold text-obsidian text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                        {hamper.badge || 'தாRA HAMPER'}
                      </span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 right-3">
                      {isSoldOut ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-ruby-stock/20 border border-ruby-stock/50 text-ruby-stock text-[10px] font-mono font-bold">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-ruby-stock/20 border border-ruby-stock/50 text-ruby-stock text-[10px] font-mono font-bold animate-pulse">
                          Only {hamper.quantity} Left!
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-stock/20 border border-emerald-stock/50 text-emerald-stock text-[10px] font-mono font-medium">
                          In Stock: {hamper.quantity}
                        </span>
                      )}
                    </div>

                    {/* Price Tag in Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl font-bold text-gold">
                          ₹{hamper.price.toLocaleString('en-IN')}
                        </span>
                        {hamper.compareAtPrice > hamper.price && (
                          <span className="text-xs text-ivory/50 line-through">
                            ₹{hamper.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-stock font-bold">
                        Save ₹{(hamper.compareAtPrice - hamper.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Hamper Details */}
                  <div className="p-5">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-ivory group-hover:text-gold transition-colors">
                      {hamper.name}
                    </h3>
                    <p className="mt-2 text-xs text-ivory-warm/70 line-clamp-2 leading-relaxed">
                      {hamper.description}
                    </p>

                    {/* What's Inside Checklist */}
                    <div className="mt-4 pt-3 border-t border-gold/15 space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider font-mono text-gold-brushed font-semibold">
                        Included in this Box:
                      </div>
                      {hamper.specs?.slice(0, 4).map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-ivory/80">
                          <Check className="w-3 h-3 text-gold flex-shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add to Bag Action (Dispatches real-time SSE bag event to Admin Panel) */}
                <div className="p-5 pt-0">
                  <button
                    disabled={isSoldOut}
                    onClick={() => addToBag(hamper)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isSoldOut
                        ? 'bg-ivory/10 text-ivory/40 cursor-not-allowed border border-ivory/10'
                        : 'bg-gradient-to-r from-gold-brushed to-gold hover:from-gold hover:to-gold-light text-obsidian shadow-md hover:shadow-gold-glow'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSoldOut ? 'Out of Stock' : 'Add Hamper to Bag'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom bulk wedding hamper inquiry banner */}
        <div className="mt-12 p-6 rounded-2xl bg-espresso/80 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-ivory">Custom Bulk Gifting & Wedding Return Hampers</h4>
              <p className="text-xs text-ivory/70">
                Planning bulk orders for Weddings, Puberty Ceremonies, Baby Showers or Housewarming? Custom colors & sarees available.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/message/U5MPAWAN3UPFM1?text=Hi%20Tara%20Luxe!%20I%20am%20inquiring%20about%20custom%20bulk%20தாRA%20Hampers%20for%20a%20wedding/function."
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-obsidian text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
