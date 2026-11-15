import React, { useState } from 'react';
import { useStore, Order } from '../context/StoreContext';
import { PackageCheck, Copy, Check, Clock, Truck, ShieldCheck, CheckCircle2, Search, X, ChevronRight, Phone } from 'lucide-react';

export const LiveOrderTracker: React.FC = () => {
  const {
    activeOrders,
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    searchedOrder,
    setSearchedOrder,
    trackOrder,
    trackingError,
    isTrackingLoading
  } = useStore();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await trackOrder(inputQuery);
  };

  const latestActiveOrder: Order | undefined = activeOrders[0];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Approved':
        return 1;
      case 'Dispatched':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { label: 'Pending', desc: 'Order Placed & Awaiting Approval', icon: Clock },
    { label: 'Approved', desc: 'Approved & Being Handcrafted', icon: ShieldCheck },
    { label: 'Dispatched', desc: 'Handed to Courier Partner', icon: Truck },
    { label: 'Delivered', desc: 'Delivered to Customer', icon: CheckCircle2 }
  ];

  return (
    <>
      {/* Persistent Active Order Banner on Storefront (Only when customer has placed an order) */}
      {latestActiveOrder && (
        <aside aria-label="Active order status" className="bg-gradient-to-r from-espresso via-obsidian to-espresso border-b border-gold/30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center text-gold flex-shrink-0 animate-pulse">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ivory">Active Order Tracker:</span>
                  <span className="font-mono text-gold font-bold tracking-wider">{latestActiveOrder.trackingCode}</span>
                  <button
                    onClick={() => handleCopy(latestActiveOrder.trackingCode)}
                    className="p-1 text-ivory/50 hover:text-gold"
                    title="Copy Tracking Code"
                  >
                    {copiedCode === latestActiveOrder.trackingCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-stock" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      latestActiveOrder.status === 'Delivered'
                        ? 'bg-emerald-stock/20 text-emerald-stock border border-emerald-stock/50'
                        : latestActiveOrder.status === 'Dispatched'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                        : latestActiveOrder.status === 'Approved'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50'
                        : 'bg-gold/20 text-gold-light border border-gold/40'
                    }`}
                  >
                    {latestActiveOrder.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-ivory/70 mt-0.5">
                  {latestActiveOrder.statusMessage || 'Live status syncing in real time'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchedOrder(latestActiveOrder);
                  setIsTrackingModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold-light text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <span>View Live Stepper</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Live Order Tracker Modal */}
      {isTrackingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
          onClick={() => setIsTrackingModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-espresso border border-gold/30 shadow-2xl p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gold/20">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-5 h-5 text-gold" />
                <h3 className="font-serif text-xl font-bold text-ivory">
                  Live Order Tracker
                </h3>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 text-ivory/60 hover:text-ivory rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Search Input */}
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70">
                Enter Tracking Code (TLX-XXXXXX) or +91 Phone
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TLX-482910 or 9876543210"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-obsidian border border-gold/30 rounded-xl px-3.5 py-2 text-xs text-ivory font-mono uppercase focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={isTrackingLoading || !inputQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-obsidian text-xs font-bold transition-all disabled:opacity-40"
                >
                  {isTrackingLoading ? 'Checking...' : 'Track'}
                </button>
              </div>
              {trackingError && (
                <p className="text-[11px] text-ruby-stock mt-1">{trackingError}</p>
              )}
            </form>

            {/* Display Order Stepper */}
            {searchedOrder ? (
              <div className="p-5 rounded-2xl bg-obsidian/70 border border-gold/25 space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-ivory/50 uppercase">Tracking Code</span>
                    <div className="font-mono text-lg font-bold text-gold flex items-center gap-2">
                      <span>{searchedOrder.trackingCode}</span>
                      <button
                        onClick={() => handleCopy(searchedOrder.trackingCode)}
                        className="text-ivory/50 hover:text-gold"
                      >
                        {copiedCode === searchedOrder.trackingCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-stock" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-ivory/50 uppercase">Order Value</span>
                    <div className="font-serif text-lg font-bold text-ivory">
                      ₹{searchedOrder.finalTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Status Message Highlight */}
                <div className="p-3 rounded-xl bg-espresso border border-gold/20 text-center">
                  <span className="text-xs text-gold-light font-medium">
                    {searchedOrder.statusMessage || 'Live status syncing in real time'}
                  </span>
                </div>

                {/* 4-Step Progress Stepper */}
                <div className="relative pt-2 pb-2">
                  <div className="grid grid-cols-4 gap-2 relative z-10">
                    {steps.map((st, idx) => {
                      const Icon = st.icon;
                      const currentIdx = getStepIndex(searchedOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={st.label} className="flex flex-col items-center text-center space-y-1.5">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                              isComplete
                                ? 'bg-gold border-gold text-obsidian shadow-gold-glow'
                                : 'bg-espresso border-gold/20 text-ivory/40'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                              isCurrent
                                ? 'text-gold'
                                : isComplete
                                ? 'text-ivory'
                                : 'text-ivory/40'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items Summary in Tracker */}
                <div className="border-t border-gold/15 pt-3 space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-gold-brushed">Items in this Order</span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {searchedOrder.items.map((it, i) => (
                      <div key={i} className="flex items-center justify-between text-ivory/80 text-[11px]">
                        <span className="truncate max-w-[220px]">{it.title} (x{it.quantity})</span>
                        <span className="font-mono text-gold">₹{(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gold/15 pt-2 flex items-center justify-between text-[11px] text-ivory/60">
                  <span>Customer: {searchedOrder.customerName}</span>
                  <a
                    href={searchedOrder.whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-stock hover:underline"
                  >
                    <Phone className="w-3 h-3" /> WhatsApp Support
                  </a>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-ivory/60">
                Enter your 10-digit phone number or TLX-XXXXXX code to view live delivery and preparation status.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
