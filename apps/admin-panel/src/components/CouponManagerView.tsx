import React, { useState } from 'react';
import { useAdmin, Coupon } from '../context/AdminRealtimeContext';
import { Plus, Tag, Check, Copy, Trash2, Edit2, X, AlertCircle, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

export const CouponManagerView: React.FC = () => {
  const { coupons, createCoupon, updateCoupon, deleteCoupon } = useAdmin();

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    value: 10,
    minOrderAmount: 499,
    active: true,
    description: 'Special Tara Luxe Discount',
    maxUses: 500
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'PERCENTAGE',
      value: 15,
      minOrderAmount: 799,
      active: true,
      description: 'Exclusive 15% off on 18k Anti-Tarnish pieces',
      maxUses: 500
    });
    setFormError(null);
    setModalMode('create');
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      active: c.active,
      description: c.description || '',
      maxUses: c.maxUses || 1000
    });
    setFormError(null);
    setModalMode('edit');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (c: Coupon) => {
    await updateCoupon(c.id, { active: !c.active });
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon ${code}?`)) {
      await deleteCoupon(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }

    setIsSubmitting(true);
    let success = false;

    if (modalMode === 'create') {
      success = await createCoupon({
        ...formData,
        code: formData.code.trim().toUpperCase()
      });
    } else if (modalMode === 'edit' && editingCoupon) {
      success = await updateCoupon(editingCoupon.id, {
        ...formData,
        code: formData.code.trim().toUpperCase()
      });
    }

    setIsSubmitting(false);

    if (success) {
      setModalMode(null);
    } else {
      setFormError('Failed to save coupon. The code may already exist.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div>
          <h2 className="text-xl font-serif font-bold text-ivory">Discount Coupons & Offers</h2>
          <p className="text-xs text-ivory/60 mt-1">
            Create, toggle, and manage promo codes that broadcast live to the customer storefront ticker and checkout.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE / TABLET CARDS VIEW (<900px)                           */}
      {/* ------------------------------------------------------------- */}
      <div className="block min-[900px]:hidden space-y-3">
        {coupons.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-card text-ivory/50 text-xs">
            No active coupons found.
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl glass-card border border-gold/20 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="font-mono font-bold text-gold text-sm tracking-wider flex items-center gap-1.5 hover:underline"
                    >
                      <span>{c.code}</span>
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-stock" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gold/60" />
                      )}
                    </button>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        c.active
                          ? 'bg-emerald-stock/20 text-emerald-stock border border-emerald-stock/40'
                          : 'bg-ruby-stock/20 text-ruby-stock border border-ruby-stock/40'
                      }`}
                    >
                      {c.active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-ivory/60 mt-1">{c.description}</p>
                </div>

                <button
                  onClick={() => handleToggleActive(c)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    c.active
                      ? 'bg-emerald-stock/15 border-emerald-stock/40 text-emerald-400'
                      : 'bg-ruby-stock/15 border-ruby-stock/40 text-ruby-stock'
                  }`}
                  title={c.active ? 'Click to pause' : 'Click to activate'}
                >
                  {c.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-gold/15">
                <div className="space-y-0.5">
                  <div className="font-semibold text-ivory">
                    {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                  </div>
                  <div className="text-[10px] text-ivory/50 font-mono">
                    Min: ₹{c.minOrderAmount} | Uses: {c.usageCount}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-gold-light"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1.5 rounded-lg bg-espresso hover:bg-ruby-stock/20 border border-ruby-stock/30 text-ruby-stock"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (>=900px)                                  */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden min-[900px]:block rounded-2xl glass-card overflow-hidden border border-gold/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gold/15 bg-espresso/90 text-[11px] font-mono uppercase tracking-wider text-gold-brushed">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4">Usage Stats</th>
                <th className="p-4">Status & Live Toggle</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10 text-xs">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-espresso/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(c.code)}
                        className="font-mono font-bold text-gold text-sm tracking-wider flex items-center gap-1.5 hover:underline"
                        title="Click to copy code"
                      >
                        <span>{c.code}</span>
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-stock" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gold/60" />
                        )}
                      </button>
                    </div>
                    <div className="text-[10px] text-ivory/50 mt-0.5">{c.description}</div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className="font-semibold text-ivory">
                      {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} FLAT`}
                    </span>
                  </td>

                  <td className="p-4 whitespace-nowrap font-mono text-ivory/80">
                    ₹{c.minOrderAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="p-4 whitespace-nowrap font-mono">
                    <span className="text-gold font-bold">{c.usageCount}</span>
                    <span className="text-ivory/40"> / {c.maxUses || '∞'}</span>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        c.active
                          ? 'bg-emerald-stock/15 border-emerald-stock/40 text-emerald-400'
                          : 'bg-ruby-stock/15 border-ruby-stock/40 text-ruby-stock'
                      }`}
                    >
                      {c.active ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg bg-espresso hover:bg-gold/20 border border-gold/30 text-gold-light hover:text-gold transition-colors"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 rounded-lg bg-espresso hover:bg-ruby-stock/20 border border-ruby-stock/30 text-ruby-stock transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl bg-espresso border border-gold/30 shadow-2xl p-5 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">
                {modalMode === 'create' ? 'Create New Promo Code' : 'Edit Coupon Settings'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-ivory/60 hover:text-ivory rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl mb-4 text-xs bg-ruby-stock/20 text-ruby-stock border border-ruby-stock/40 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20, WHOLESALE25"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory font-mono uppercase tracking-wider focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Cash (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                  Description / Storefront Banner Note
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Special Festive 15% discount on all 18k jewellery"
                  className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gold/30 bg-obsidian text-gold focus:ring-gold"
                />
                <label htmlFor="couponActive" className="text-xs text-ivory/80 cursor-pointer">
                  Activate this promo code immediately across Storefront ticker & checkout
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gold/20">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-espresso hover:bg-espresso/80 text-ivory/70 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-gold-brushed via-gold to-gold-light hover:from-gold hover:to-gold-light text-obsidian font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
