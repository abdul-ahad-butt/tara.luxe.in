import React from 'react';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';
import { Phone, Instagram, Heart, Sparkles, MessageCircle, ArrowUp, PackageCheck, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsTrackingModalOpen } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-obsidian border-t border-gold/20 pt-16 pb-12 text-ivory relative overflow-hidden">
      {/* Golden glow decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gold/15">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <BrandLogo size={52} showText={true} />
            <p className="text-xs text-ivory-warm/70 leading-relaxed font-serif italic">
              "Curating timeless 18k gold-plated 316L anti-tarnish everyday luxury jewellery and signature festive தாRA hampers for unforgettable moments."
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full bg-espresso border border-gold/30 text-[10px] font-mono text-gold-light">
                100% Anti-Tarnish
              </span>
              <span className="px-2.5 py-1 rounded-full bg-espresso border border-gold/30 text-[10px] font-mono text-cyan-300">
                Waterproof 316L
              </span>
            </div>
          </div>

          {/* Col 2: Collections & Hampers */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold-brushed mb-4 font-semibold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-ivory-warm/80">
              <li>
                <a href="#hampers" className="hover:text-gold transition-colors">
                  Signature "தாRA HAMPER" Suite
                </a>
              </li>
              <li>
                <a href="#collection-grid" className="hover:text-gold transition-colors">
                  18k PVD Anti-Tarnish Necklaces
                </a>
              </li>
              <li>
                <a href="#collection-grid" className="hover:text-gold transition-colors">
                  Waterproof 316L Earrings & Hoops
                </a>
              </li>
              <li>
                <a href="#collection-grid" className="hover:text-gold transition-colors">
                  Surgical Steel Cuff Bracelets & Bangles
                </a>
              </li>
              <li>
                <a href="#collaborations" className="hover:text-gold transition-colors flex items-center gap-1.5 text-gold-light">
                  <Users className="w-3 h-3 text-gold" />
                  <span>Brand & Creator Collaborations</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Retail & Wholesale Inquiries (clean, no WHOLESALE25 hardcoded text) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold-brushed mb-4 font-semibold">
              Retail & Wholesale Orders
            </h4>
            <p className="text-xs text-ivory-warm/70 leading-relaxed mb-4">
              We supply retail boutiques and provide bulk orders for wedding return gifts, corporate events, and festive celebrations across India.
            </p>
            <div className="space-y-2.5 text-xs">
              <a
                href="https://wa.me/message/U5MPAWAN3UPFM1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-gold hover:text-gold-light"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Wholesale WhatsApp: +91 7871501939</span>
              </a>
              <button
                onClick={() => setIsTrackingModalOpen(true)}
                className="flex items-center gap-2 text-gold-light hover:underline font-mono text-[11px]"
              >
                <PackageCheck className="w-3.5 h-3.5 text-gold" />
                <span>Track Your Live Order (TLX-XXXXXX)</span>
              </button>
            </div>
          </div>

          {/* Col 4: Verified Channels (No admin link) */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-gold-brushed mb-4 font-semibold">
              Connect With Us
            </h4>
            <div className="space-y-3 text-xs">
              <a
                href="https://www.instagram.com/tara.luxe.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-ivory-warm/80 hover:text-gold transition-colors"
              >
                <Instagram className="w-4 h-4 text-gold" />
                <span>Instagram: @tara.luxe.in</span>
              </a>
              <a
                href="https://www.instagram.com/aztheticlyf/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-ivory-warm/80 hover:text-gold transition-colors"
              >
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Sister Label: @aztheticlyf</span>
              </a>
              <a
                href="https://wa.me/message/U5MPAWAN3UPFM1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-ivory-warm/80 hover:text-gold transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-stock" />
                <span>Direct WhatsApp: +91 7871501939</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ivory/50">
          <div>
            © {new Date().getFullYear()} Tara Luxe (@tara.luxe.in). All rights reserved. 316L Stainless Steel 18k Gold Plated Luxury.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
