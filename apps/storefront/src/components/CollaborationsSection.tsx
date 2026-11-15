import React from 'react';
import { useStore } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { Instagram, Sparkles, MessageCircle, Heart, Star, ExternalLink } from 'lucide-react';

export const CollaborationsSection: React.FC = () => {
  const { collaborations } = useStore();

  return (
    <section id="collaborations" className="py-16 sm:py-24 bg-espresso/30 border-b border-gold/15 relative overflow-hidden scroll-mt-20">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-mono uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Spotted In Tara Luxe</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ivory tracking-tight">
            Brand & Creator <span className="text-gold italic font-normal">Collaborations</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ivory-warm/80 leading-relaxed">
            See how creators, brides, and style icons wear Tara Luxe 18k anti-tarnish jewellery and sister label <strong className="text-gold">@aztheticlyf</strong> Korean accessories in real life.
          </p>
        </div>

        {/* Collaborations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collaborations.map((collab) => (
            <div
              key={collab.id}
              className="rounded-3xl glass-card overflow-hidden border border-gold/20 hover:border-gold/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Creator Photo */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-espresso">
                  <LuxuryImage
                    src={collab.image}
                    alt={collab.creatorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-75" />

                  {/* Date Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-espresso/90 border border-gold/30 text-[10px] font-mono text-gold-light">
                      {collab.date}
                    </span>
                  </div>

                  {/* Creator Instagram Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <a
                      href={collab.profileUrl || `https://www.instagram.com/${collab.handle.replace('@', '')}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian/80 backdrop-blur-md border border-gold/40 text-gold-light hover:text-gold text-xs font-semibold"
                    >
                      <Instagram className="w-3.5 h-3.5 text-gold" />
                      <span>{collab.handle}</span>
                      <ExternalLink className="w-3 h-3 text-gold/70" />
                    </a>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-gold mb-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    <span className="font-bold">{collab.featuredItem}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-ivory">
                    {collab.creatorName}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-ivory-warm/80 italic font-serif leading-relaxed">
                    "{collab.quote}"
                  </p>
                </div>
              </div>

              {/* Verified Collab Footer */}
              <div className="p-5 pt-0 border-t border-gold/10 flex items-center justify-between text-[11px] text-ivory/60">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>@aztheticlyf Edit</span>
                </span>
                <span className="font-mono text-gold">100% Anti-Tarnish</span>
              </div>
            </div>
          ))}
        </div>

        {/* PR Package Collaboration CTA Card */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-espresso via-obsidian to-espresso border-2 border-gold/40 shadow-luxury flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold-light text-xs font-mono font-bold tracking-wider uppercase inline-block">
              ✦ Official Creator Campaign
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ivory">
              Collab With Us — Get Your <span className="text-gold italic">@aztheticlyf PR Package</span>
            </h3>
            <p className="text-xs sm:text-sm text-ivory-warm/80 leading-relaxed">
              Post any Reel from our page and tag @tara.luxe.in in your story to receive a curated PR box with Korean hair accessories and 18k gold plated jewellery.
            </p>
          </div>

          <a
            href="https://wa.me/message/U5MPAWAN3UPFM1?text=Hi%20Tara%20Luxe!%20I%20am%20a%20creator/influencer%20interested%20in%20the%20@aztheticlyf%20PR%20package%20collaboration."
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 px-6 py-3.5 rounded-full bg-gradient-to-r from-gold-brushed to-gold hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
