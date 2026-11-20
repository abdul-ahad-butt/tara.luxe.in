import React, { useState } from 'react';
import { AdminRealtimeProvider, useAdmin } from './context/AdminRealtimeContext';
import { AdminSidebar } from './components/AdminSidebar';
import { LiveBagFeedView } from './components/LiveBagFeedView';
import { ProductManagerView } from './components/ProductManagerView';
import { CouponManagerView } from './components/CouponManagerView';
import { HighlightsCollabManagerView } from './components/HighlightsCollabManagerView';
import { PaymentsDeliveryView } from './components/PaymentsDeliveryView';
import { ExecutiveAnalyticsView } from './components/ExecutiveAnalyticsView';
import { NotificationPanel } from './components/NotificationPanel';
import { AdminLoginGate } from './components/AdminLoginGate';
import { BrandLogo } from './components/BrandLogo';
import { Bell, Menu, X, ExternalLink } from 'lucide-react';

const AdminDashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live-feed' | 'products' | 'coupons' | 'highlights-collabs' | 'payments-delivery' | 'overview'>('live-feed');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const {
    isAuthenticated,
    sseConnected,
    unreadEventsCount,
    markEventsRead
  } = useAdmin();

  // If not authenticated, show luxury login gate
  if (!isAuthenticated) {
    return <AdminLoginGate />;
  }

  return (
    <div className="flex h-screen bg-obsidian text-ivory overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-espresso z-10">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-ivory hover:text-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AdminSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab as any);
                setMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-gold/15 bg-espresso/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-ivory hover:text-gold rounded-lg bg-espresso border border-gold/20"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="lg:hidden flex-shrink-0">
                <BrandLogo size={32} showText={false} />
              </div>
              <h1 className="font-serif text-base sm:text-xl font-bold text-ivory flex items-center gap-2 whitespace-nowrap">
                <span>Tara Luxe Admin Center</span>
                <span className="text-xs text-gold">✦</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live SSE Pulse Pill (No raw :8787 port) */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian border border-gold/25 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-stock animate-ping' : 'bg-ruby-stock'}`} />
              <span className={sseConnected ? 'text-emerald-stock font-medium' : 'text-ruby-stock font-medium'}>
                {sseConnected ? '🟢 Live Sync Active' : 'Connecting...'}
              </span>
            </div>

            {/* Notification Bell with live counter & Portal Panel */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAlertsDropdown(!showAlertsDropdown);
                  markEventsRead();
                }}
                className={`p-2 rounded-xl border text-ivory hover:text-gold relative transition-colors ${
                  showAlertsDropdown
                    ? 'bg-gold/20 border-gold text-gold shadow-md'
                    : 'bg-espresso hover:bg-gold/10 border-gold/20'
                }`}
                title="Live Events Stream & Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadEventsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-obsidian text-[10px] font-mono font-bold flex items-center justify-center animate-bounce shadow">
                    {unreadEventsCount}
                  </span>
                )}
              </button>

              {/* Notification Panel rendered via Portal at z-99999 */}
              <NotificationPanel
                isOpen={showAlertsDropdown}
                onClose={() => setShowAlertsDropdown(false)}
              />
            </div>

            {/* External Storefront link (Local: :3000 | Prod: tara-luxe-in.pages.dev) */}
            <a
              href={typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3000' : 'https://tara-luxe-in.pages.dev'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold-light text-xs font-semibold transition-all shadow-sm"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Active Tab View (Distinct view per tab; 4 KPI cards render exclusively in ExecutiveAnalyticsView) */}
          {activeTab === 'live-feed' && <LiveBagFeedView />}
          {activeTab === 'products' && <ProductManagerView />}
          {activeTab === 'highlights-collabs' && <HighlightsCollabManagerView />}
          {activeTab === 'coupons' && <CouponManagerView />}
          {activeTab === 'payments-delivery' && <PaymentsDeliveryView />}
          {activeTab === 'overview' && <ExecutiveAnalyticsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AdminRealtimeProvider>
      <AdminDashboardContent />
    </AdminRealtimeProvider>
  );
}
