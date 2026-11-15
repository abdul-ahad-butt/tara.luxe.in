import React, { useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle, Sparkles, Droplets, HeartHandshake, Award } from 'lucide-react';

export const WhyTaraLuxe3D: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'science'>('comparison');
  const [sliderPosition, setSliderPosition] = useState(50);

  const comparisonRows = [
    {
      label: 'Core Metal Substrate',
      cheap: 'Zinc Alloy / Scrap Brass (oxidizes fast)',
      tara: '316L Medical-Grade Surgical Steel'
    },
    {
      label: 'Gold Plating Quality',
      cheap: 'Cheap Flash Dip (wears off in days)',
      tara: '18k Real Gold Vacuum PVD Plating'
    },
    {
      label: 'Water, Shower & Sweat',
      cheap: 'Turns black/green on water contact',
      tara: '100% Waterproof, Shower & Gym Safe'
    },
    {
      label: 'Skin Safety & Allergies',
      cheap: 'Leaves green rings & itchy nickel rashes',
      tara: '100% Hypoallergenic & Nickel-Free'
    },
    {
      label: 'Lifespan & Cost per Wear',
      cheap: 'Trash in 2 weeks (₹100 wasted)',
      tara: 'Years of Daily Luxury Wear (₹0.50/day)'
    }
  ];

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>@tara.luxe.in Brand Philosophy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory tracking-tight">
            Why Tara Luxe vs. <span className="text-gold italic font-normal">₹100 Market Jewellery?</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ivory-warm/80 leading-relaxed">
            Inspired by our viral Instagram reel answering customer questions: why medical-grade 316L stainless steel & 18k PVD gold plating is an investment that outlasts hundreds of disposable fast-fashion pieces.
          </p>

          {/* Toggle Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-full bg-espresso border border-gold/25">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'comparison'
                  ? 'bg-gold text-obsidian shadow-gold-glow'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              Side-by-Side Breakdown
            </button>
            <button
              onClick={() => setActiveTab('science')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'science'
                  ? 'bg-gold text-obsidian shadow-gold-glow'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              The 316L PVD Science
            </button>
          </div>
        </div>

        {activeTab === 'comparison' ? (
          /* Side-by-Side Comparison Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The ₹100 Market Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-espresso/50 border border-ruby-stock/30 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-ruby-stock/20 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ruby-stock/15 border border-ruby-stock/40 flex items-center justify-center text-ruby-stock">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-ivory">₹100 Market Jewellery</h3>
                      <p className="text-xs text-ruby-stock/80 font-mono">Disposable Fast-Fashion Brass</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-ruby-stock/10 text-ruby-stock border border-ruby-stock/30 font-semibold">
                    Turns Green
                  </span>
                </div>

                <div className="space-y-4">
                  {comparisonRows.map((row, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                      <XCircle className="w-4 h-4 text-ruby-stock flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-ivory/90">{row.label}: </span>
                        <span className="text-ivory/60">{row.cheap}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-ruby-stock/20 text-xs text-ruby-stock/90 italic">
                ⚠️ Result: Green skin discoloration, allergic rashes, and rust after a single rain shower or gym workout.
              </div>
            </div>

            {/* The Tara Luxe 18k 316L Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-espresso/80 via-obsidian to-espresso border-2 border-gold/50 shadow-luxury flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-gold/15 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gold/30 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-gold">Tara Luxe Signature Pieces</h3>
                      <p className="text-xs text-gold-light/80 font-mono">18k PVD Plated 316L Surgical Steel</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-stock/20 text-emerald-stock border border-emerald-stock/40 font-semibold">
                    Lifetime Anti-Tarnish
                  </span>
                </div>

                <div className="space-y-4">
                  {comparisonRows.map((row, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-stock flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-gold-light">{row.label}: </span>
                        <span className="text-ivory/90">{row.tara}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gold/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gold font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
                <a
                  href="#collection-grid"
                  className="px-4 py-2 rounded-full bg-gold hover:bg-gold-light text-obsidian text-xs font-bold transition-all shadow-md"
                >
                  Explore Collection →
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* The 316L PVD Science View */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-ivory mb-2">316L Surgical Steel</h4>
              <p className="text-xs sm:text-sm text-ivory-warm/80 leading-relaxed">
                The exact grade used in high-end Swiss watches and biomedical implants. Completely immune to salt water, perfumes, chlorine, and sweat.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-4">
                <Droplets className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-ivory mb-2">Vacuum PVD Plating</h4>
              <p className="text-xs sm:text-sm text-ivory-warm/80 leading-relaxed">
                Physical Vapor Deposition bonds real 18-karat gold to the core steel at high temperatures in a vacuum chamber, making it 10x thicker and virtually scratch-proof.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif font-bold text-ivory mb-2">0% Green Skin Promise</h4>
              <p className="text-xs sm:text-sm text-ivory-warm/80 leading-relaxed">
                Zero copper, zero nickel, zero toxic alloys. Even those with ultra-sensitive skin can wear Tara Luxe pieces to sleep, shower, and workout with total peace of mind.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
