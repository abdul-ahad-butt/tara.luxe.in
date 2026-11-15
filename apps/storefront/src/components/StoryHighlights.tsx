import React, { useState } from 'react';
import { useStore, Highlight } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { Sparkles, X, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';

export const StoryHighlights: React.FC = () => {
  const { highlights } = useStore();
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

  const openStory = (item: Highlight) => {
    setSelectedHighlight(item);
  };

  const closeStory = () => {
    setSelectedHighlight(null);
  };

  const nextStory = () => {
    if (!selectedHighlight || highlights.length === 0) return;
    const idx = highlights.findIndex((h) => h.id === selectedHighlight.id);
    const nextIdx = (idx + 1) % highlights.length;
    setSelectedHighlight(highlights[nextIdx]);
  };

  const prevStory = () => {
    if (!selectedHighlight || highlights.length === 0) return;
    const idx = highlights.findIndex((h) => h.id === selectedHighlight.id);
    const prevIdx = (idx - 1 + highlights.length) % highlights.length;
    setSelectedHighlight(highlights[prevIdx]);
  };

  if (!highlights || highlights.length === 0) return null;

  return (
    <section id="highlights" className="py-6 border-b border-gold/15 bg-espresso/40 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-3">
          <Instagram className="w-4 h-4 text-gold" />
          <span className="text-xs font-mono uppercase tracking-widest text-gold-light">
            Instagram Highlights @tara.luxe.in
          </span>
        </div>

        {/* Story Circle Highlights Bar */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-2 scrollbar-none">
          {highlights.map((item) => (
            <button
              key={item.id}
              onClick={() => openStory(item)}
              className="flex flex-col items-center gap-2 group flex-shrink-0 focus:outline-none"
            >
              {/* Instagram Story Gradient Ring */}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-gold-brushed via-gold-light to-gold group-hover:shadow-gold-glow transition-all duration-300">
                <div className="p-0.5 rounded-full bg-obsidian">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-espresso flex items-center justify-center relative">
                    <LuxuryImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-obsidian/25 flex items-center justify-center">
                      <span className="text-lg">{item.iconText || '✨'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-ivory/90 group-hover:text-gold transition-colors tracking-wide">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Story Modal */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/90 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-espresso border border-gold/30 shadow-2xl flex flex-col h-[580px]">
            {/* Top Progress & Header */}
            <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-obsidian/90 via-obsidian/50 to-transparent">
              <div className="w-full h-1 bg-ivory/20 rounded-full overflow-hidden mb-3">
                <div className="w-full h-full bg-gold animate-[goldShimmer_4s_linear]" />
              </div>

              <div className="flex items-center justify-between text-ivory">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full border border-gold/50 overflow-hidden bg-gold/20 flex items-center justify-center text-xs">
                    {selectedHighlight.iconText || '✦'}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1 text-gold">
                      tara.luxe.in ✦
                    </div>
                    <div className="text-[10px] text-ivory/70">{selectedHighlight.category}</div>
                  </div>
                </div>

                <button
                  onClick={closeStory}
                  className="p-1 rounded-full bg-obsidian/60 text-ivory hover:text-gold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Image */}
            <div className="flex-1 relative overflow-hidden bg-obsidian flex items-center justify-center">
              <LuxuryImage
                src={selectedHighlight.image}
                alt={selectedHighlight.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
            </div>

            {/* Story Caption Content */}
            <div className="p-5 bg-espresso/95 border-t border-gold/20 relative z-10">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/20 text-gold-light text-[10px] font-mono font-semibold mb-2">
                {selectedHighlight.tag}
              </span>
              <p className="text-xs sm:text-sm text-ivory leading-relaxed whitespace-pre-line font-serif italic">
                {selectedHighlight.caption}
              </p>

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-2">
                <a
                  href="https://wa.me/message/U5MPAWAN3UPFM1"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-gold-light text-obsidian text-center text-xs font-bold transition-all shadow-md"
                >
                  Message on WhatsApp →
                </a>
                <a
                  href="https://www.instagram.com/tara.luxe.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-obsidian border border-gold/40 text-gold hover:bg-gold/10"
                  title="View Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Navigation click zones */}
            <button
              onClick={prevStory}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-obsidian/60 text-ivory hover:text-gold z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextStory}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-obsidian/60 text-ivory hover:text-gold z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
