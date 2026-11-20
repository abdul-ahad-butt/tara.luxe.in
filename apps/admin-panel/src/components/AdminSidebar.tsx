import React from 'react';
import { BrandLogo } from './BrandLogo';
import { useAdmin } from '../context/AdminRealtimeContext';
import { Activity, Package, Tag, BarChart3, ExternalLink, Radio, Sparkles, LogOut, Users, CreditCard } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'live-feed' | 'products' | 'coupons' | 'highlights-collabs' | 'payments-delivery' | 'overview';
  setActiveTab: (tab: 'live-feed' | 'products' | 'coupons' | 'highlights-collabs' | 'payments-delivery' | 'overview') => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const { sseConnected, unreadEventsCount, markEventsRead, logout, adminUser } = useAdmin();

  const navItems = [
    {
      id: 'live-feed' as const,
      label: 'Live Bag & Orders Feed',
      icon: Activity,
      badge: unreadEventsCount > 0 ? unreadEventsCount : null,
      pulse: unreadEventsCount > 0
    },
    {
      id: 'products' as const,
      label: 'Products & Inventory',
      icon: Package,
      badge: null,
      pulse: false
    },
    {
      id: 'highlights-collabs' as const,
      label: 'Insta Highlights & Collabs',
      icon: Users,
      badge: null,
      pulse: false
    },
    {
      id: 'coupons' as const,
      label: 'Discount Coupons',
      icon: Tag,
      badge: null,
      pulse: false
    },
    {
      id: 'payments-delivery' as const,
      label: 'Payments & Delivery',
      icon: CreditCard,
      badge: null,
      pulse: false
    },
    {
      id: 'overview' as const,
      label: 'KPIs & Analytics',
      icon: BarChart3,
      badge: null,
      pulse: false
    }
  ];

  return (
    <aside className="w-64 bg-espresso/90 border-r border-gold/15 flex flex-col justify-between flex-shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-gold/15 flex items-center justify-between">
          <BrandLogo size={42} showText={true} />
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <div className="text-[10px] uppercase font-mono tracking-widest text-gold-brushed px-3 mb-2 font-semibold">
            ADMIN CENTER
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'live-feed') markEventsRead();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gold/20 text-gold border border-gold/40 shadow-sm'
                    : 'text-ivory/70 hover:bg-obsidian/60 hover:text-ivory border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : 'text-ivory/60'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.pulse
                        ? 'bg-emerald-stock text-obsidian animate-bounce'
                        : 'bg-espresso border border-gold/40 text-gold'
                    }`}
                  >
                    +{item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Storefront Link */}
      <div className="p-4 border-t border-gold/15 space-y-3">
        {/* Real-time SSE Connection Indicator (Clean, no raw port numbers) */}
        <div className="p-3 rounded-xl bg-obsidian/70 border border-gold/20 text-[11px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-ivory/70 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-gold" />
              <span>Real-Time Sync</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-stock animate-ping' : 'bg-ruby-stock'}`} />
              <span className={sseConnected ? 'text-emerald-stock' : 'text-ruby-stock'}>
                {sseConnected ? 'Connected' : 'Syncing'}
              </span>
            </span>
          </div>
        </div>

        {/* View Customer Storefront External Link (Local: :3000 | Prod: tara-luxe-in.pages.dev) */}
        <a
          href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'https://tara-luxe-in.pages.dev'}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/40 text-gold-light text-xs font-semibold transition-all"
        >
          <span>Open Live Storefront ↗</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Logged in User & Logout button */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-ivory/60">
          <span className="truncate max-w-[130px] font-mono">{adminUser?.email || 'admin@taraluxe.in'}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-ruby-stock hover:underline font-mono"
            title="Sign out from Admin Center"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
