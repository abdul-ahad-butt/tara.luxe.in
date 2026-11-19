import React, { useState, useMemo } from 'react';
import { useAdmin, BagEvent, Order } from '../context/AdminRealtimeContext';
import { LuxuryImage } from './LuxuryImage';
import {
  ShoppingBag,
  PackageCheck,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  Send,
  Trash2,
  Archive,
  ArchiveRestore,
  Square,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';

export const LiveBagFeedView: React.FC = () => {
  const {
    bagEvents,
    orders,
    updateOrderStatus,
    archiveOrder,
    bulkArchiveOrders,
    deleteOrder,
    bulkDeleteOrders,
    archiveBagEvent,
    bulkArchiveBagEvents,
    deleteBagEvent,
    bulkDeleteBagEvents,
    sseConnected
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'active' | 'archived'>('active');
  const [filterType, setFilterType] = useState<'all' | 'orders' | 'bag'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Filter orders and bag events based on active/archived sub-tab
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => (activeSubTab === 'archived' ? !!o.archived : !o.archived));
  }, [orders, activeSubTab]);

  const filteredBags = useMemo(() => {
    return bagEvents.filter((b) => (activeSubTab === 'archived' ? !!b.archived : !b.archived));
  }, [bagEvents, activeSubTab]);

  const totalActiveCount = useMemo(() => {
    return orders.filter((o) => !o.archived).length + bagEvents.filter((b) => !b.archived).length;
  }, [orders, bagEvents]);

  const totalArchivedCount = useMemo(() => {
    return orders.filter((o) => !!o.archived).length + bagEvents.filter((b) => !!b.archived).length;
  }, [orders, bagEvents]);

  // Combine and sort events and orders by timestamp descending
  const combinedFeed = useMemo(() => {
    const list: Array<{
      key: string;
      rawId: string;
      kind: 'order' | 'bag';
      timestamp: string;
      orderData?: Order;
      bagData?: BagEvent;
    }> = [];

    if (filterType === 'all' || filterType === 'orders') {
      filteredOrders.forEach((o) => {
        list.push({
          key: `order:${o.id}`,
          rawId: o.id,
          kind: 'order',
          timestamp: o.createdAt,
          orderData: o
        });
      });
    }

    if (filterType === 'all' || filterType === 'bag') {
      filteredBags.forEach((b) => {
        list.push({
          key: `bag:${b.id}`,
          rawId: b.id,
          kind: 'bag',
          timestamp: b.timestamp,
          bagData: b
        });
      });
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filteredOrders, filteredBags, filterType]);

  // Selection helpers
  const allCurrentKeys = useMemo(() => combinedFeed.map((item) => item.key), [combinedFeed]);
  const isAllSelected = allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.has(k));
  const isPartiallySelected = allCurrentKeys.some((k) => selectedKeys.has(k)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(allCurrentKeys));
    }
  };

  const toggleSelectItem = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedKeys(next);
  };

  // Bulk actions
  const handleBulkArchive = async (archiveVal: boolean) => {
    if (selectedKeys.size === 0) return;
    setIsProcessingBulk(true);
    try {
      const orderIds: string[] = [];
      const bagIds: string[] = [];

      selectedKeys.forEach((key) => {
        const [kind, id] = key.split(':');
        if (kind === 'order') orderIds.push(id);
        if (kind === 'bag') bagIds.push(id);
      });

      if (orderIds.length > 0) {
        await bulkArchiveOrders(orderIds, archiveVal);
      }
      if (bagIds.length > 0) {
        await bulkArchiveBagEvents(bagIds, archiveVal);
      }
      setSelectedKeys(new Set());
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeys.size === 0) return;
    const count = selectedKeys.size;
    if (!window.confirm(`Permanently delete ${count} selected activity record(s) from disk? This cannot be undone.`)) {
      return;
    }
    setIsProcessingBulk(true);
    try {
      const orderIds: string[] = [];
      const bagIds: string[] = [];

      selectedKeys.forEach((key) => {
        const [kind, id] = key.split(':');
        if (kind === 'order') orderIds.push(id);
        if (kind === 'bag') bagIds.push(id);
      });

      if (orderIds.length > 0) {
        await bulkDeleteOrders(orderIds);
      }
      if (bagIds.length > 0) {
        await bulkDeleteBagEvents(bagIds);
      }
      setSelectedKeys(new Set());
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'Approved':
        return 'bg-blue-500/15 border-blue-500/40 text-blue-300';
      case 'Dispatched':
        return 'bg-purple-500/15 border-purple-500/40 text-purple-300';
      case 'Delivered':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      default:
        return 'bg-gold/15 border-gold/40 text-gold-light';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Active/Archived tabs & filters */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-ivory">Live Customer Stream</h2>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-stock/20 border border-emerald-stock/50 text-emerald-stock text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-stock animate-ping" />
                <span>LIVE BROADCAST</span>
              </span>
            </div>
            <p className="text-xs text-ivory/60 mt-1">
              Real-time feed where customer Add-to-Bag clicks & placed orders land instantly without browser refresh.
            </p>
          </div>

          {/* Active vs Archived Sub-Tab Toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-obsidian border border-gold/25 text-xs flex-shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                setActiveSubTab('active');
                setSelectedKeys(new Set());
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'active'
                  ? 'bg-gold text-obsidian shadow-sm'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              Active Stream ({totalActiveCount})
            </button>
            <button
              onClick={() => {
                setActiveSubTab('archived');
                setSelectedKeys(new Set());
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                activeSubTab === 'archived'
                  ? 'bg-gold text-obsidian shadow-sm'
                  : 'text-ivory/70 hover:text-ivory'
              }`}
            >
              Archived ({totalArchivedCount})
            </button>
          </div>
        </div>

        {/* Secondary Bar: Filter by Type & Select All */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gold/15">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              disabled={combinedFeed.length === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isAllSelected
                  ? 'bg-gold/20 border-gold text-gold font-bold'
                  : 'bg-espresso/80 border-gold/20 text-ivory/70 hover:text-ivory hover:border-gold/40'
              }`}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-gold" />
              ) : isPartiallySelected ? (
                <Square className="w-4 h-4 text-gold fill-gold/30" />
              ) : (
                <Square className="w-4 h-4 text-ivory/50" />
              )}
              <span>Select All ({combinedFeed.length})</span>
            </button>

            {selectedKeys.size > 0 && (
              <span className="text-xs text-gold font-mono font-bold">
                {selectedKeys.size} selected
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold/60" />
            <div className="inline-flex p-1 rounded-xl bg-obsidian border border-gold/20 text-xs">
              <button
                onClick={() => {
                  setFilterType('all');
                  setSelectedKeys(new Set());
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-gold text-obsidian font-bold shadow-sm'
                    : 'text-ivory/70 hover:text-ivory'
                }`}
              >
                All Events ({filteredOrders.length + filteredBags.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('orders');
                  setSelectedKeys(new Set());
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'orders'
                    ? 'bg-gold text-obsidian font-bold shadow-sm'
                    : 'text-ivory/70 hover:text-ivory'
                }`}
              >
                Orders ({filteredOrders.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('bag');
                  setSelectedKeys(new Set());
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filterType === 'bag'
                    ? 'bg-gold text-obsidian font-bold shadow-sm'
                    : 'text-ivory/70 hover:text-ivory'
                }`}
              >
                Add-to-Bag ({filteredBags.length})
              </button>
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedKeys.size > 0 && (
          <div className="p-3 rounded-2xl bg-gold/10 border border-gold/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
            <div className="text-xs text-ivory/90 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span>
                <strong>{selectedKeys.size}</strong> record(s) selected for bulk management
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkArchive(activeSubTab === 'active')}
                disabled={isProcessingBulk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-espresso hover:bg-gold/15 border border-gold/30 text-gold text-xs font-semibold transition-all"
              >
                {activeSubTab === 'active' ? (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Selected</span>
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Restore to Active</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={isProcessingBulk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ruby-stock/20 hover:bg-ruby-stock/30 border border-ruby-stock/50 text-rose-300 text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanent Delete Selected</span>
              </button>

              <button
                onClick={() => setSelectedKeys(new Set())}
                className="text-[11px] text-ivory/50 hover:text-ivory px-2 py-1"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Stream List */}
      <div className="space-y-4">
        {combinedFeed.length === 0 ? (
          <div className="text-center py-16 rounded-3xl glass-card border border-gold/15 p-8">
            <ShoppingBag className="w-10 h-10 text-gold/40 mx-auto mb-3" />
            <p className="font-serif text-lg text-ivory">
              {activeSubTab === 'active' ? 'No active events found' : 'No archived records'}
            </p>
            <p className="text-xs text-ivory/60 max-w-sm mx-auto mt-1">
              {activeSubTab === 'active'
                ? 'Open the customer storefront and click "Add to Bag" on any piece to watch events stream here in real time.'
                : 'Items you archive from the Active Stream will appear here.'}
            </p>
          </div>
        ) : (
          combinedFeed.map((item) => {
            const isSelected = selectedKeys.has(item.key);

            if (item.kind === 'order' && item.orderData) {
              const o = item.orderData;
              const trackingCode = o.trackingCode || `TLX-${o.id.toUpperCase().substring(0, 6)}`;
              const isOrderUpdating = updatingId === o.id;

              return (
                <div
                  key={item.key}
                  className={`p-5 rounded-2xl border-2 transition-all shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    isSelected
                      ? 'bg-espresso/95 border-gold shadow-gold/10'
                      : 'bg-espresso/90 border-gold/30 hover:border-gold/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Checkbox + Order Info */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleSelectItem(item.key)}
                        className="mt-1 p-1 rounded-lg hover:bg-gold/10 text-ivory/60 hover:text-gold transition-colors flex-shrink-0"
                        title={isSelected ? 'Deselect order' : 'Select order'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-gold" />
                        ) : (
                          <Square className="w-5 h-5 text-ivory/40" />
                        )}
                      </button>

                      <div className="w-12 h-12 rounded-xl bg-emerald-stock/20 border border-emerald-stock/60 flex items-center justify-center text-emerald-stock flex-shrink-0">
                        <PackageCheck className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-base font-bold text-ivory">
                            Order #{o.id.substring(0, 8)}
                          </span>

                          {/* PROMINENT TRACKING CODE BADGE */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 border border-gold text-gold-light text-xs font-mono font-bold tracking-wider shadow-sm">
                            <Sparkles className="w-3 h-3 text-gold" />
                            <span>{trackingCode}</span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${getStatusBadgeColor(o.status)}`}>
                            {o.status.toUpperCase()}
                          </span>

                          <span className="text-[10px] text-ivory/50 font-mono">
                            {new Date(o.createdAt).toLocaleTimeString()} • {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-xs text-ivory/80 flex flex-wrap items-center gap-3 pt-1">
                          <span className="font-semibold text-gold-light">{o.customerName}</span>
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="flex items-center gap-1 text-gold hover:underline font-mono font-bold"
                          >
                            <Phone className="w-3 h-3" /> {o.customerPhone}
                          </a>
                          <span className="text-ivory/50">| Payment: <strong className="text-ivory">{o.paymentMode}</strong></span>
                        </div>

                        {/* Customer Address */}
                        <div className="text-xs text-ivory/70 flex items-start gap-1.5 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                          <div>
                            {o.addressDetails ? (
                              <span>
                                {o.addressDetails.street}, {o.addressDetails.city}, {o.addressDetails.state} -{' '}
                                <strong className="text-gold font-mono">{o.addressDetails.pincode}</strong>
                              </span>
                            ) : (
                              <span>{o.address}</span>
                            )}
                          </div>
                        </div>

                        {/* Items Ordered Pill List */}
                        <div className="pt-2 flex flex-wrap gap-2">
                          {o.items.map((it, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-obsidian border border-gold/20 text-[11px]"
                            >
                              <div className="w-6 h-6 rounded-md overflow-hidden bg-espresso flex-shrink-0">
                                <LuxuryImage
                                  src={it.imageUrl}
                                  alt={it.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-ivory font-medium truncate max-w-[200px]">{it.title}</span>
                              <span className="text-gold font-mono font-bold">x{it.quantity}</span>
                              <span className="text-ivory/60 font-mono text-[10px]">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Order Totals, WhatsApp & Row Actions */}
                    <div className="flex flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gold/15 flex-shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-xl font-serif font-bold text-gold">
                          ₹{o.finalTotal.toLocaleString('en-IN')}
                        </div>
                        {o.discount > 0 && (
                          <div className="text-[11px] text-emerald-stock font-mono">
                            Saved ₹{o.discount.toLocaleString('en-IN')} ({o.couponCode})
                          </div>
                        )}
                        <div className="text-[10px] text-ivory/40 font-mono mt-0.5">
                          Subtotal: ₹{o.subtotal.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={o.whatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/60 text-emerald-300 text-xs font-semibold transition-all shadow-sm"
                          title="Open WhatsApp order conversation"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Individual Archive Toggle Button */}
                        <button
                          onClick={() => archiveOrder(o.id, !o.archived)}
                          className="p-1.5 rounded-xl bg-obsidian hover:bg-gold/15 border border-gold/25 text-ivory/70 hover:text-gold transition-colors"
                          title={o.archived ? 'Restore order to Active Stream' : 'Archive order'}
                        >
                          {o.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>

                        {/* Individual Permanent Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete Order #${o.id.substring(0, 8)}? This cannot be undone.`)) {
                              deleteOrder(o.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-ruby-stock/15 hover:bg-ruby-stock/30 border border-ruby-stock/40 text-rose-300 transition-colors"
                          title="Permanently Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR: 4 ONE-CLICK STATUS BUTTONS */}
                  <div className="pt-3 border-t border-gold/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-obsidian/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <div className="flex items-center gap-1.5 text-xs text-ivory/70">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      <span className="font-mono text-[11px]">Update Customer Tracking Status:</span>
                    </div>

                    {/* Status Button Stepper Group */}
                    <div className="inline-flex flex-wrap p-1 rounded-xl bg-obsidian border border-gold/25 gap-1">
                      {(['Pending', 'Approved', 'Dispatched', 'Delivered'] as const).map((st) => {
                        const isActive = o.status === st;
                        return (
                          <button
                            key={st}
                            disabled={isOrderUpdating}
                            onClick={() => handleStatusChange(o.id, st)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isActive
                                ? st === 'Delivered'
                                  ? 'bg-emerald-500 text-obsidian font-bold shadow'
                                  : st === 'Dispatched'
                                  ? 'bg-purple-500 text-white font-bold shadow'
                                  : st === 'Approved'
                                  ? 'bg-blue-500 text-white font-bold shadow'
                                  : 'bg-amber-500 text-obsidian font-bold shadow'
                                : 'text-ivory/60 hover:text-ivory hover:bg-espresso'
                            }`}
                          >
                            {isActive && <CheckCheck className="w-3 h-3" />}
                            <span>{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            if (item.kind === 'bag' && item.bagData) {
              const b = item.bagData;
              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-espresso/90 border-gold shadow-sm'
                      : 'glass-card border-gold/20 hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelectItem(item.key)}
                      className="p-1 rounded-lg hover:bg-gold/10 text-ivory/60 hover:text-gold transition-colors flex-shrink-0"
                      title={isSelected ? 'Deselect bag event' : 'Select bag event'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-gold" />
                      ) : (
                        <Square className="w-4 h-4 text-ivory/40" />
                      )}
                    </button>

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-espresso flex-shrink-0 border border-gold/20">
                      <LuxuryImage
                        src={b.productImage}
                        alt={b.productTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-light border border-gold/30 text-[9px] font-mono font-bold uppercase">
                          {b.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-ivory/50 font-mono">
                          Session: {b.sessionId}
                        </span>
                      </div>

                      <h4 className="text-xs font-serif font-bold text-ivory truncate mt-0.5">
                        {b.productTitle}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-gold">
                        Qty: {b.quantity} (₹{b.subtotal.toLocaleString('en-IN')})
                      </div>
                      <div className="text-[10px] text-ivory/40 font-mono mt-0.5">
                        {new Date(b.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => archiveBagEvent(b.id, !b.archived)}
                        className="p-1.5 rounded-lg bg-obsidian hover:bg-gold/15 border border-gold/20 text-ivory/70 hover:text-gold transition-colors"
                        title={b.archived ? 'Restore to Active Stream' : 'Archive bag event'}
                      >
                        {b.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Permanently delete this bag event record?')) {
                            deleteBagEvent(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-ruby-stock/15 hover:bg-ruby-stock/30 border border-ruby-stock/40 text-rose-300 transition-colors"
                        title="Permanently Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
};
