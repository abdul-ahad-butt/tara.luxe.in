import React from 'react';
import { useAdmin } from '../context/AdminRealtimeContext';
import { AnalyticsHeader } from './AnalyticsHeader';
import { LuxuryImage } from './LuxuryImage';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  IndianRupee,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  CheckCheck,
  Plus,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';

export const ExecutiveAnalyticsView: React.FC = () => {
  const {
    products,
    categories,
    coupons,
    bagEvents,
    orders,
    ordersByStatus,
    totalOrdersValue,
    adjustStock
  } = useAdmin();

  // -------------------------------------------------------------
  // MODULE 1: ORDER FUNNEL & REVENUE CALCULATIONS
  // -------------------------------------------------------------
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalOrdersValue / totalOrders) : 0;

  const pendingRevenue = orders
    .filter((o) => o.status.toLowerCase().includes('pend'))
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const approvedRevenue = orders
    .filter((o) => o.status.toLowerCase().includes('appr') || o.status.toLowerCase().includes('conf'))
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const dispatchedRevenue = orders
    .filter((o) => o.status.toLowerCase().includes('disp'))
    .reduce((sum, o) => sum + o.finalTotal, 0);

  const deliveredRevenue = orders
    .filter((o) => o.status.toLowerCase().includes('deliv'))
    .reduce((sum, o) => sum + o.finalTotal, 0);

  // -------------------------------------------------------------
  // MODULE 2: PRODUCT & CATEGORY PERFORMANCE
  // -------------------------------------------------------------
  const productPerformance = React.useMemo(() => {
    return products.map((p) => {
      // Units in customer bags
      const bagQty = bagEvents
        .filter((b) => b.productId === p.id && b.type === 'ADD_TO_BAG')
        .reduce((sum, b) => sum + (b.quantity || 1), 0);

      // Units ordered
      let orderedQty = 0;
      let revenue = 0;
      orders.forEach((o) => {
        o.items.forEach((it) => {
          if (it.productId === p.id || it.title === p.name) {
            orderedQty += it.quantity || 1;
            revenue += (it.price || p.price) * (it.quantity || 1);
          }
        });
      });

      return {
        product: p,
        bagQty,
        orderedQty,
        revenue
      };
    }).sort((a, b) => b.revenue - a.revenue || b.orderedQty - a.orderedQty);
  }, [products, bagEvents, orders]);

  // -------------------------------------------------------------
  // MODULE 3: COUPON CONVERSION & IMPACT
  // -------------------------------------------------------------
  const couponStats = React.useMemo(() => {
    return coupons.map((c) => {
      let ordersUsingCoupon = 0;
      let totalDiscountGiven = 0;

      orders.forEach((o) => {
        if (o.couponCode && o.couponCode.toUpperCase() === c.code.toUpperCase()) {
          ordersUsingCoupon++;
          totalDiscountGiven += o.discount || 0;
        }
      });

      const max = c.maxUses || 500;
      const pct = Math.min(100, Math.round(((c.usageCount || 0) / max) * 100));

      return {
        coupon: c,
        ordersCount: ordersUsingCoupon,
        totalDiscountGiven,
        usagePercent: pct
      };
    });
  }, [coupons, orders]);

  // -------------------------------------------------------------
  // MODULE 4: LOW STOCK WATCHLIST
  // -------------------------------------------------------------
  const lowStockProducts = React.useMemo(() => {
    return products.filter((p) => p.quantity <= 5).sort((a, b) => a.quantity - b.quantity);
  }, [products]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 TOP REAL-TIME KPI CARDS (RENDERED EXCLUSIVELY ON THIS TAB) */}
      <AnalyticsHeader />

      {/* ------------------------------------------------------------- */}
      {/* MODULE 1: REVENUE & ORDER FUNNEL BREAKDOWN                     */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl glass-card border border-gold/25 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold" />
              <h3 className="font-serif font-bold text-lg text-ivory">
                Revenue & Order Lifecycle Funnel
              </h3>
            </div>
            <p className="text-xs text-ivory/60 mt-1">
              Real-time pipeline monitoring customer orders from request placement to doorstep delivery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-espresso border border-gold/20 text-xs text-right">
              <span className="text-[10px] font-mono uppercase text-ivory/50 block">Average Order Value</span>
              <span className="text-gold font-bold font-mono text-base">₹{avgOrderValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-stock/15 border border-emerald-stock/30 text-xs text-right">
              <span className="text-[10px] font-mono uppercase text-emerald-stock/70 block">Total Pipeline</span>
              <span className="text-emerald-stock font-bold font-mono text-base">{totalOrders} Orders</span>
            </div>
          </div>
        </div>

        {/* 4-Stage Funnel Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Pending */}
          <div className="p-4 rounded-2xl bg-obsidian/70 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono uppercase">
                <Clock className="w-3.5 h-3.5" /> Pending
              </span>
              <span className="text-[11px] font-mono text-amber-200/70 font-bold">
                {ordersByStatus.pending} orders
              </span>
            </div>
            <div className="text-xl font-serif font-bold text-ivory">
              ₹{pendingRevenue.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-espresso rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${totalOrders > 0 ? (ordersByStatus.pending / totalOrders) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-ivory/40 font-mono block">Awaiting packaging & approval</span>
          </div>

          {/* Approved */}
          <div className="p-4 rounded-2xl bg-obsidian/70 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-300 flex items-center gap-1.5 font-mono uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
              </span>
              <span className="text-[11px] font-mono text-blue-200/70 font-bold">
                {ordersByStatus.approved} orders
              </span>
            </div>
            <div className="text-xl font-serif font-bold text-ivory">
              ₹{approvedRevenue.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-espresso rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-400 h-1.5 rounded-full"
                style={{ width: `${totalOrders > 0 ? (ordersByStatus.approved / totalOrders) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-ivory/40 font-mono block">Packaged in velvet luxury box</span>
          </div>

          {/* Dispatched */}
          <div className="p-4 rounded-2xl bg-obsidian/70 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 font-mono uppercase">
                <Truck className="w-3.5 h-3.5" /> Dispatched
              </span>
              <span className="text-[11px] font-mono text-purple-200/70 font-bold">
                {ordersByStatus.dispatched} orders
              </span>
            </div>
            <div className="text-xl font-serif font-bold text-ivory">
              ₹{dispatchedRevenue.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-espresso rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-400 h-1.5 rounded-full"
                style={{ width: `${totalOrders > 0 ? (ordersByStatus.dispatched / totalOrders) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-ivory/40 font-mono block">In transit with courier partner</span>
          </div>

          {/* Delivered */}
          <div className="p-4 rounded-2xl bg-obsidian/70 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono uppercase">
                <CheckCheck className="w-3.5 h-3.5" /> Delivered
              </span>
              <span className="text-[11px] font-mono text-emerald-200/70 font-bold">
                {ordersByStatus.delivered} orders
              </span>
            </div>
            <div className="text-xl font-serif font-bold text-ivory">
              ₹{deliveredRevenue.toLocaleString('en-IN')}
            </div>
            <div className="w-full bg-espresso rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${totalOrders > 0 ? (ordersByStatus.delivered / totalOrders) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-ivory/40 font-mono block">Delivered to customer doorstep</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODULE 2: TOP-PERFORMING PRODUCTS TABLE                       */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 rounded-3xl glass-card border border-gold/25 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-gold" />
              <h3 className="font-serif font-bold text-lg text-ivory">
                Top-Performing Products & Real-Time Demand
              </h3>
            </div>
            <p className="text-xs text-ivory/60 mt-1">
              Cross-analyzing active customer bag interest vs. completed customer orders.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gold/15 bg-espresso/90 text-[10.5px] font-mono uppercase tracking-wider text-gold-brushed">
                <th className="p-3.5">Piece Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">In Customer Bags</th>
                <th className="p-3.5">Units Ordered</th>
                <th className="p-3.5">Gross Revenue</th>
                <th className="p-3.5 text-right">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-xs">
              {productPerformance.map(({ product: p, bagQty, orderedQty, revenue }) => (
                <tr key={p.id} className="hover:bg-espresso/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-espresso border border-gold/20 flex-shrink-0">
                        <LuxuryImage src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-serif font-bold text-ivory truncate">{p.name}</div>
                        <div className="text-[10px] font-mono text-gold">₹{p.price.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-ivory/70 whitespace-nowrap text-[11px] font-mono">
                    {p.category}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold">
                      <ShoppingBag className="w-3 h-3" /> {bagQty} in bag
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-mono font-bold text-ivory">
                    {orderedQty} ordered
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-mono font-bold text-gold">
                    ₹{revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        p.quantity <= 0
                          ? 'bg-ruby-stock/20 text-ruby-stock border border-ruby-stock/40'
                          : p.quantity <= 5
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-emerald-stock/20 text-emerald-stock border border-emerald-stock/40'
                      }`}
                    >
                      {p.quantity <= 0 ? 'Sold Out' : `${p.quantity} units left`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODULE 3: COUPON CONVERSION & MODULE 4: INVENTORY HEALTH     */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 3: Coupon Breakdown */}
        <div className="p-6 rounded-3xl glass-card border border-gold/25 space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-gold" />
            <h3 className="font-serif font-bold text-lg text-ivory">
              Coupon Performance & Impact
            </h3>
          </div>
          <p className="text-xs text-ivory/60">
            Real-time tracking of promo code redemptions and discounts applied at checkout.
          </p>

          <div className="space-y-3 pt-2">
            {couponStats.map(({ coupon: c, ordersCount, totalDiscountGiven, usagePercent }) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-obsidian/70 border border-gold/15 space-y-2 hover:border-gold/35 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gold px-2.5 py-0.5 rounded-lg bg-gold/15 border border-gold/30">
                      {c.code}
                    </span>
                    <span className="text-[11px] font-semibold text-ivory">
                      {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                      c.active ? 'bg-emerald-stock/20 text-emerald-stock' : 'bg-ruby-stock/20 text-ruby-stock'
                    }`}
                  >
                    {c.active ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-ivory/70 pt-1">
                  <span>Redemptions: <strong className="text-ivory">{c.usageCount}</strong></span>
                  <span>Orders Logged: <strong className="text-gold">{ordersCount}</strong></span>
                  <span>Discount Given: <strong className="text-emerald-stock">₹{totalDiscountGiven.toLocaleString('en-IN')}</strong></span>
                </div>

                <div className="w-full bg-espresso rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-gold h-1 rounded-full"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 4: Low-Stock Watchlist & Instant Restock */}
        <div className="p-6 rounded-3xl glass-card border border-gold/25 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-ruby-stock" />
              <h3 className="font-serif font-bold text-lg text-ivory">
                Inventory Health Watchlist
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-ruby-stock/20 text-ruby-stock border border-ruby-stock/40 font-bold">
              {lowStockProducts.length} Needs Attention
            </span>
          </div>
          <p className="text-xs text-ivory/60">
            Automated alerts for any piece with ≤ 5 units or zero stock remaining.
          </p>

          <div className="space-y-3 pt-2">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-emerald-stock/10 border border-emerald-stock/30 text-emerald-300 text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="font-serif font-bold text-sm">All Inventory Healthy</p>
                <p className="text-[11px] text-emerald-200/60">
                  Every piece in the catalog is stocked above minimum threshold levels.
                </p>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-obsidian/70 border border-ruby-stock/30 flex items-center justify-between gap-3 hover:border-ruby-stock/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-espresso border border-ruby-stock/40 flex-shrink-0">
                      <LuxuryImage src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-xs text-ivory truncate">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gold font-mono">₹{p.price}</span>
                        <span className="text-[10px] text-ruby-stock font-mono font-bold">
                          {p.quantity <= 0 ? 'SOLD OUT' : `${p.quantity} LEFT`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => adjustStock(p.id, 10)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold/30 border border-gold/40 text-gold-light text-xs font-mono font-bold flex-shrink-0 transition-all cursor-pointer shadow-sm"
                    title="Quick Restock +10 units"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+10 Stock</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
