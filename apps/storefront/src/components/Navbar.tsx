import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Search,
  PackageCheck,
  Menu,
  X,
  Check,
  Sparkles,
  Instagram,
  Phone,
  Users,
  Gift,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    bagCount,
    setIsBagOpen,
    coupons,
    categories,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    setIsTrackingModalOpen,
    activeOrders
  } = useStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Active coupons for promo ticker
  const activeCoupons = coupons.filter(c => c.active);

  const announcementMessages = [
    ...(activeCoupons.length > 0
      ? activeCoupons.map(c => ({
          text: `Use code ${c.code} for ${c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`} (Min: ₹${c.minOrderAmount})`,
          code: c.code
        }))
      : [{ text: '✨ Anti-Tarnish 18k Gold Plated Jewellery & Luxury Festive Hampers ✨', code: null }]),
    { text: '🌊 100% Waterproof, Sweatproof & Hypoallergenic 316L Stainless Steel', code: null },
    { text: '🎁 Sister Label Korean Accessories Edit (@aztheticlyf) Available', code: null }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % announcementMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcementMessages.length]);

  // Lock body scroll when mobile/drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleSelectCategory = (catName: string) => {
    setActiveCategory(catName);
    setDrawerOpen(false);
    const el = document.getElementById('collection-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentMsg = announcementMessages[tickerIndex] || announcementMessages[0];
  const hasActiveOrders = activeOrders.length > 0;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-obsidian/95 border-b border-gold/15 transition-all">
      {/* ------------------------------------------------------------- */}
      {/* TOP ANNOUNCEMENT BAR: Centered rotating promo message ONLY     */}
      {/* Strictly NO phone number in top bar (per user instruction)    */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-espresso via-obsidian to-espresso border-b border-gold/20 text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <div className="flex items-center justify-center gap-2 text-ivory-warm font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-pulse" />
            <span className="tracking-wide text-[11px] sm:text-xs truncate">{currentMsg.text}</span>
            {currentMsg.code && (
              <button
                onClick={() => copyCoupon(currentMsg.code!)}
                className="ml-1 sm:ml-2 px-2 py-0.5 rounded bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold-light text-[10px] font-mono font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer"
                title="Click to copy coupon code"
              >
                {copiedCoupon === currentMsg.code ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-stock" /> Copied!
                  </>
                ) : (
                  <>Copy Code</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN NAVBAR ROW: Exactly 5 items locked left to right         */}
      {/* 1. Brand Logo & Name (flex-shrink: 0, whitespace-nowrap)       */}
      {/* 2. Search Bar (Center, flex: 1, max-w-md, min-w-[180px])       */}
      {/* 3. Track Order Button (pill, flex-shrink: 0)                   */}
      {/* 4. BAG Button (gold pill, flex-shrink: 0)                      */}
      {/* 5. Hamburger Menu ☰ (Always visible on all screens)           */}
      {/* ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          {/* 1. Brand Logo & Name (Left) */}
          <a
            href="#"
            className="flex items-center flex-shrink-0 group focus:outline-none"
            aria-label="Tara Luxe Home"
          >
            <BrandLogo size={46} showText={true} />
          </a>

          {/* 2. Search Bar (Center - Hidden on <640px mobile, displayed in compact second row below) */}
          <div className="hidden sm:flex items-center flex-1 max-w-md min-w-[180px] mx-2 lg:mx-4 relative">
            <Search className="w-4 h-4 text-gold/60 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 18k jewellery, hampers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-espresso/90 border border-gold/25 hover:border-gold/50 rounded-full pl-9 pr-8 py-2 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-ivory/50 hover:text-gold p-0.5"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Action Cluster: 3. Track Order | 4. BAG | 5. Hamburger ☰ */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* 3. Track Order Button */}
            <button
              onClick={() => setIsTrackingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full bg-espresso/90 border border-gold/30 hover:border-gold/70 text-gold-light hover:text-ivory text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all shadow-sm cursor-pointer"
              title="Track live order status"
            >
              <PackageCheck className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span className="hidden md:inline whitespace-nowrap">Track Order</span>
              <span className="md:hidden text-[11px] whitespace-nowrap">Track</span>
              {hasActiveOrders && (
                <span className="w-2 h-2 rounded-full bg-gold animate-ping flex-shrink-0" />
              )}
            </button>

            {/* 4. BAG Button (Gold Pill) */}
            <button
              onClick={() => setIsBagOpen(true)}
              className="relative flex items-center justify-center px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-gold-brushed via-gold to-gold-light hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs tracking-wider uppercase whitespace-nowrap flex-shrink-0 transition-all shadow-md hover:shadow-gold-glow cursor-pointer"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Bag</span>
              {bagCount > 0 && (
                <span className="ml-1 sm:ml-1.5 flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 rounded-full bg-obsidian text-gold text-[10px] sm:text-[11px] font-mono font-bold animate-pulse">
                  {bagCount}
                </span>
              )}
            </button>

            {/* 5. Three-Line Hamburger Menu Button (☰) - ALWAYS VISIBLE ON ALL SCREENS */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 sm:p-2.5 rounded-full bg-espresso/90 border border-gold/30 hover:border-gold/70 text-gold hover:text-ivory transition-all flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm"
              aria-label="Open Navigation Drawer"
              title="Menu & Collections"
            >
              <Menu className="w-5 h-5 sm:w-5 sm:h-5 text-gold" />
            </button>
          </div>
        </div>

        {/* Compact Second Row Search Bar for Mobile (<640px) */}
        <div className="sm:hidden pb-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gold/60 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 18k jewellery, hampers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-espresso/90 border border-gold/25 rounded-full pl-9 pr-8 py-2 text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2 text-xs text-ivory/50 hover:text-gold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SLIDE-OVER HAMBURGER MENU DRAWER (Right Side Glassmorphic)    */}
      {/* ------------------------------------------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-espresso/95 backdrop-blur-2xl border-l border-gold/30 h-[100dvh] flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-gold/15 flex items-center justify-between">
              <BrandLogo size={40} showText={true} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full bg-obsidian border border-gold/30 text-ivory/70 hover:text-gold transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              {/* SECTION 1: Product Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-gold-light font-bold">
                    Jewellery & Hampers
                  </span>
                  <span className="text-[10px] text-ivory/40 font-mono">
                    {categories.length + 1} Collections
                  </span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => handleSelectCategory('All')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeCategory === 'All'
                        ? 'bg-gradient-to-r from-gold/25 to-gold/10 text-gold-light border border-gold/50 shadow-sm'
                        : 'text-ivory/80 hover:bg-obsidian/60 hover:text-ivory'
                    }`}
                  >
                    <span>✦ All Collection</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gold/60" />
                  </button>

                  {categories.map((cat) => {
                    const isSelected = activeCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-gold/25 to-gold/10 text-gold-light border border-gold/50 shadow-sm'
                            : 'text-ivory/80 hover:bg-obsidian/60 hover:text-ivory'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gold/60 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Quick Features & Highlights */}
              <div className="pt-4 border-t border-gold/15">
                <div className="text-[11px] font-mono uppercase tracking-widest text-gold-light font-bold mb-3">
                  Curated Showcase
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => scrollToSection('highlights')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-obsidian/60 hover:bg-obsidian border border-gold/15 hover:border-gold/30 text-xs text-ivory/85 hover:text-gold transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ivory truncate">Instagram Story Highlights</div>
                      <div className="text-[10px] text-ivory/50 truncate">Reviews, Orders, Macro 316L & Collabs</div>
                    </div>
                  </button>

                  <button
                    onClick={() => scrollToSection('collaborations')}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-obsidian/60 hover:bg-obsidian border border-gold/15 hover:border-gold/30 text-xs text-ivory/85 hover:text-gold transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ivory truncate">Spotted in Tara Luxe</div>
                      <div className="text-[10px] text-ivory/50 truncate">Brand & Creator Collaborations</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveCategory('Tara Hampers');
                      scrollToSection('collection-grid');
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-obsidian/60 hover:bg-obsidian border border-gold/15 hover:border-gold/30 text-xs text-ivory/85 hover:text-gold transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ivory truncate">Signature தாRA Hampers</div>
                      <div className="text-[10px] text-ivory/50 truncate">Curated Festive Sarees & Bangles</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      setIsTrackingModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-xs text-gold-light transition-all text-left cursor-pointer shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold/20 border border-gold/40 flex items-center justify-center text-gold flex-shrink-0">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gold-light truncate">Track Live Order Status</div>
                      <div className="text-[10px] text-ivory/60 truncate">Enter TLX-XXXXXX code or phone</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: Quality Guarantee */}
              <div className="p-3.5 rounded-2xl bg-obsidian/80 border border-gold/20 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-gold font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>The Tara Luxe Promise</span>
                </div>
                <p className="text-[11px] text-ivory/70 leading-relaxed">
                  Every piece is forged from medical-grade 316L Stainless Steel with thick 18k PVD gold plating. 100% waterproof, sweatproof, and guaranteed anti-tarnish.
                </p>
              </div>
            </div>

            {/* Drawer Footer: Official Channels */}
            <div className="p-5 sm:p-6 border-t border-gold/15 bg-obsidian/60 space-y-2.5 text-xs">
              <a
                href="https://wa.me/message/U5MPAWAN3UPFM1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold transition-all"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Orders & Support</span>
                </span>
                <span className="text-[10px] font-mono">+91 7871501939</span>
              </a>

              <div className="flex items-center justify-between text-[11px] pt-1 px-1">
                <a
                  href="https://www.instagram.com/tara.luxe.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-gold hover:text-gold-light transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>@tara.luxe.in</span>
                </a>

                <a
                  href="https://www.instagram.com/aztheticlyf/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-ivory/70 hover:text-gold transition-colors"
                >
                  <span>@aztheticlyf</span>
                  <ExternalLink className="w-3 h-3 text-gold/60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
