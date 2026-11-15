import React from 'react';
import { useAdmin } from '../context/AdminRealtimeContext';
import { Package, ShoppingBag, IndianRupee, Tag, AlertTriangle, CheckCircle2, Clock, Truck, ShieldCheck } from 'lucide-react';

export const AnalyticsHeader: React.FC = () => {
  const {
    products,
    totalInventoryCount,
    lowStockCount,
    outOfStockCount,
    bagEvents,
    orders,
    totalOrdersValue,
    ordersByStatus,
    totalBagItemsAddedToday,
    coupons
  } = useAdmin();

  // Active bags count
  const uniqueSessions = new Set(bagEvents.map((e) => e.sessionId)).size;
  const activeCouponsCount = coupons.filter((c) => c.active).length;
  const totalCouponUses = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  const kpis = [
    {
      title: 'Live Bag Activity',
      value: `${uniqueSessions} Active Bags`,
      sub: `${totalBagItemsAddedToday} total pieces added to bag`,
      icon: ShoppingBag,
      accent: 'text-cyan-400',
      badge: 'Live Sync',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
    },
    {
      title: 'Active Coupons',
      value: `${activeCouponsCount} Active`,
      sub: `${totalCouponUses} redemptions logged`,
      icon: Tag,
      accent: 'text-gold-light',
      badge: 'Promo Codes',
      badgeColor: 'bg-gold/20 text-gold-light border-gold/40'
    },
    {
      title: 'Gross Orders Revenue',
      value: `₹${totalOrdersValue.toLocaleString('en-IN')}`,
      sub: `${ordersByStatus.pending} Pending • ${ordersByStatus.approved} Approved • ${ordersByStatus.dispatched} Dispatched`,
      icon: IndianRupee,
      accent: 'text-emerald-stock',
      badge: `${orders.length} Orders`,
      badgeColor: 'bg-emerald-stock/20 text-emerald-stock border-emerald-stock/40'
    },
    {
      title: 'Inventory & Stock Units',
      value: `${totalInventoryCount.toLocaleString('en-IN')} units`,
      sub: `${products.length} products • ${lowStockCount} low stock • ${outOfStockCount} sold out`,
      icon: Package,
      accent: 'text-gold',
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : 'Optimal',
      badgeColor: lowStockCount > 0 ? 'bg-ruby-stock/20 text-ruby-stock border-ruby-stock/40' : 'bg-emerald-stock/20 text-emerald-stock border-emerald-stock/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl glass-card border border-gold/15 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-ivory/60">
                {kpi.title}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                {kpi.badge}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-serif font-bold text-ivory">
                  {kpi.value}
                </div>
                <div className="text-[10.5px] text-ivory/60 mt-1 leading-snug">
                  {kpi.sub}
                </div>
              </div>

              <div className={`w-11 h-11 rounded-xl bg-espresso border border-gold/20 flex items-center justify-center flex-shrink-0 ${kpi.accent}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
