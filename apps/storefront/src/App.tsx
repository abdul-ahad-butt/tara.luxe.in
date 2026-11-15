import React from 'react';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { Hero3DCanvas } from './components/Hero3DCanvas';
import { StoryHighlights } from './components/StoryHighlights';
import { HamperBuilderSection } from './components/HamperBuilderSection';
import { WhyTaraLuxe3D } from './components/WhyTaraLuxe3D';
import { ProductGrid } from './components/ProductGrid';
import { CollaborationsSection } from './components/CollaborationsSection';
import { SlideOverBagDrawer } from './components/SlideOverBagDrawer';
import { Footer } from './components/Footer';
import { Sparkles, ShieldCheck, Droplets, Gift, ArrowRight, MessageCircle } from 'lucide-react';

export const StorefrontContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-ivory selection:bg-gold selection:text-obsidian">
      {/* Navigation Bar */}
      <Navbar />

      {/* Persistent Active Order Live Tracker (Survives refreshes) */}
      <LiveOrderTracker />

      {/* Hero 3D Stage Section */}
      <section className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden border-b border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Brand Hero Editorial Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-mono uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>18k PVD Plated • 316L Surgical Steel</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ivory tracking-tight leading-[1.12]">
                Everyday Luxury <br />
                <span className="gold-gradient-text italic font-normal">That Never Tarnishes.</span>
              </h1>

              <p className="text-sm sm:text-base text-ivory-warm/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Engineered for daily life. Shower, workout, swim, and celebrate without taking off your pieces. 100% waterproof, hypoallergenic surgical steel meets thick vacuum-bonded 18-karat gold plating.
              </p>

              {/* USP Feature Micro-badges */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
                <div className="p-2.5 rounded-2xl glass-card flex flex-col items-center lg:items-start text-center lg:text-left">
                  <Droplets className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-[11px] font-bold text-ivory">100% Waterproof</span>
                  <span className="text-[9px] text-ivory/60 font-mono">Shower & Gym Safe</span>
                </div>
                <div className="p-2.5 rounded-2xl glass-card flex flex-col items-center lg:items-start text-center lg:text-left">
                  <ShieldCheck className="w-4 h-4 text-gold mb-1" />
                  <span className="text-[11px] font-bold text-ivory">316L Steel</span>
                  <span className="text-[9px] text-ivory/60 font-mono">Zero Green Skin</span>
                </div>
                <div className="p-2.5 rounded-2xl glass-card flex flex-col items-center lg:items-start text-center lg:text-left">
                  <Gift className="w-4 h-4 text-gold-light mb-1" />
                  <span className="text-[11px] font-bold text-ivory">தாRA Hampers</span>
                  <span className="text-[9px] text-ivory/60 font-mono">Festive Gift Boxes</span>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#collection-grid"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-gold-brushed to-gold hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow transition-all"
                >
                  <span>Explore Jewellery</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#hampers"
                  className="px-6 py-3.5 rounded-full bg-espresso/90 hover:bg-gold/15 text-gold-light border border-gold/40 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  View தாRA Hampers
                </a>

                <a
                  href="https://wa.me/message/U5MPAWAN3UPFM1"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-full bg-espresso border border-emerald-stock/40 text-emerald-stock hover:bg-emerald-stock/15 transition-all"
                  title="Chat on WhatsApp (+91 7871501939)"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Three.js Interactive 3D Canvas */}
            <div className="lg:col-span-6 w-full">
              <Hero3DCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Instagram Story Highlights */}
      <StoryHighlights />

      {/* Signature "தாRA HAMPER" Builder Showcase */}
      <HamperBuilderSection />

      {/* Why Tara Luxe vs ₹100 Jewellery Section */}
      <WhyTaraLuxe3D />

      {/* Curated Product Grid with Dynamic Categories */}
      <ProductGrid />

      {/* Spotted in Tara Luxe — Brand & Creator Collaborations */}
      <CollaborationsSection />

      {/* Slide-over Bag Drawer & +91 Checkout */}
      <SlideOverBagDrawer />

      {/* Footer (No Admin Links, Clean Layout) */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
