import React, { useState, useEffect } from 'react';
import { useAdmin, StoreSettings } from '../context/AdminRealtimeContext';
import {
  CreditCard,
  Truck,
  QrCode,
  MessageCircle,
  Building2,
  Check,
  Save,
  AlertCircle,
  Sparkles,
  Copy,
  Upload,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const PaymentsDeliveryView: React.FC = () => {
  const { settings, updateSettings, uploadImage } = useAdmin();

  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQR(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        setFormData((prev) => ({ ...prev, upiQrImageUrl: url }));
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to upload QR image');
    } finally {
      setIsUploadingQR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const ok = await updateSettings(formData);
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError('Failed to save settings. Please check your network connection.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  // Live QR fallback preview URL
  const autoQrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    `upi://pay?pa=${formData.upiId || 'taraluxe@upi'}&pn=${encodeURIComponent(formData.upiPayeeName || 'Tara Luxe')}&cu=INR`
  )}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Configuration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ivory">
            Payments & Delivery Control Center
          </h2>
          <p className="text-xs text-ivory/60 mt-0.5">
            Manage checkout payment gateways, delivery charges, UPI QR codes, bank accounts & WhatsApp ordering in real time.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow transition-all disabled:opacity-50"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-900" />
              <span>Saved & Synced!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to D1...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Payment methods & delivery rules saved to Cloudflare D1 and broadcast live to all Storefront visitors.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-2xl bg-ruby-stock/15 border border-ruby-stock/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: MASTER PAYMENT METHOD TOGGLES */}
        <div className="p-5 sm:p-6 rounded-2xl bg-espresso/70 border border-gold/20 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gold/15">
            <CreditCard className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-base font-serif font-bold text-ivory">Checkout Payment Gateways</h3>
              <p className="text-xs text-ivory/60">Toggle payment options shown to customers during checkout.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* COD Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.codEnabled ? 'bg-gold/10 border-gold/40' : 'bg-obsidian/60 border-gold/10 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-ivory">Cash on Delivery (COD)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.codEnabled}
                    onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-obsidian peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
              <p className="text-[11px] text-ivory/60 leading-relaxed">
                Customers place order and pay upon delivery. Supports dynamic extra COD delivery charges.
              </p>
            </div>

            {/* UPI QR Pay Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.upiEnabled ? 'bg-gold/10 border-gold/40' : 'bg-obsidian/60 border-gold/10 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-ivory">UPI QR Pay & Bank Transfer</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.upiEnabled}
                    onChange={(e) => setFormData({ ...formData, upiEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-obsidian peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
              <p className="text-[11px] text-ivory/60 leading-relaxed">
                Displays scannable UPI QR code and bank account details in checkout with UTR confirmation.
              </p>
            </div>

            {/* WhatsApp Direct Toggle */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.whatsappEnabled ? 'bg-gold/10 border-gold/40' : 'bg-obsidian/60 border-gold/10 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-ivory">WhatsApp Direct Checkout</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.whatsappEnabled}
                    onChange={(e) => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-obsidian peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>
              <p className="text-[11px] text-ivory/60 leading-relaxed">
                Saves order in D1 and immediately redirects customer to pre-filled WhatsApp concierge chat.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: GLOBAL DELIVERY CHARGES */}
        <div className="p-5 sm:p-6 rounded-2xl bg-espresso/70 border border-gold/20 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gold/15">
            <Truck className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-base font-serif font-bold text-ivory">Delivery Pricing & Thresholds</h3>
              <p className="text-xs text-ivory/60">Configure automatic checkout delivery fees and free shipping minimums.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                Default Standard Delivery Charge (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gold font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.defaultDeliveryFee}
                  onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: Number(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
                />
              </div>
              <span className="text-[10px] text-ivory/40 mt-1 block">Enter 0 to offer standard Free Delivery on all eligible orders.</span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                Free Delivery Above Order Value (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gold font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.freeDeliveryAbove}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryAbove: Number(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
                />
              </div>
              <span className="text-[10px] text-ivory/40 mt-1 block">Orders equal or greater than this value get automatic 100% Free Shipping.</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
              Checkout & Pending Delivery Notice Text
            </label>
            <textarea
              rows={2}
              value={formData.deliveryNote}
              onChange={(e) => setFormData({ ...formData, deliveryNote: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs text-ivory focus:outline-none focus:border-gold"
              placeholder="Notice shown to customer in drawer and pending tracker..."
            />
          </div>
        </div>

        {/* SECTION 3: UPI QR PAY & BANK TRANSFER */}
        <div className="p-5 sm:p-6 rounded-2xl bg-espresso/70 border border-gold/20 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gold/15">
            <QrCode className="w-5 h-5 text-gold" />
            <div>
              <h3 className="text-base font-serif font-bold text-ivory">UPI QR Pay & Bank Transfer Details</h3>
              <p className="text-xs text-ivory/60">Configure your receiving UPI ID, QR image, and bank account credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: UPI Inputs & Bank Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                    Merchant UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. taraluxe@upi or 7871501939@okaxis"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                    Merchant / Payee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.upiPayeeName}
                    onChange={(e) => setFormData({ ...formData, upiPayeeName: e.target.value })}
                    placeholder="Tara Luxe Anti-Tarnish Jewellery"
                    className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                  Custom UPI QR Code Image (Upload or Image URL)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.upiQrImageUrl}
                    onChange={(e) => setFormData({ ...formData, upiQrImageUrl: e.target.value })}
                    placeholder="https://... or upload file"
                    className="flex-1 px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-espresso hover:bg-gold/20 border border-gold/30 text-gold-light text-xs font-semibold flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingQR ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={isUploadingQR}
                      className="hidden"
                    />
                  </label>
                </div>
                <span className="text-[10px] text-ivory/40 mt-1 block">
                  Leave empty to automatically generate dynamic QR codes from your UPI ID.
                </span>
              </div>

              {/* Optional Bank Transfer Card */}
              <div className="p-4 rounded-xl bg-obsidian/70 border border-gold/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gold">
                  <Building2 className="w-4 h-4" />
                  <span>Optional Bank Transfer Information (NEFT / IMPS)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ivory/60 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-gold/20 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ivory/60 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                      placeholder="Tara Luxe"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-gold/20 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ivory/60 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 50200084729182"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-gold/20 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ivory/60 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankIfsc}
                      onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-espresso border border-gold/20 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Live QR Code Preview Card */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-obsidian border-2 border-gold/30 flex flex-col items-center text-center space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-brushed font-bold">
                Customer Scan Preview
              </span>

              <div className="w-48 h-48 p-2.5 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-gold/40">
                <img
                  src={formData.upiQrImageUrl ? formData.upiQrImageUrl : autoQrPreviewUrl}
                  alt="UPI QR Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1 w-full">
                <div className="text-xs font-serif font-bold text-ivory truncate">{formData.upiPayeeName || 'Tara Luxe'}</div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-gold-light">
                  <span className="truncate">{formData.upiId || 'taraluxe@upi'}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.upiId, 'upiId')}
                    className="text-ivory/50 hover:text-gold"
                  >
                    {copiedKey === 'upiId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-ivory/50 leading-tight">
                {formData.upiQrImageUrl ? 'Using custom uploaded QR image' : 'Auto-generating dynamic UPI QR payload'}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: WHATSAPP DIRECT INTEGRATION */}
        <div className="p-5 sm:p-6 rounded-2xl bg-espresso/70 border border-gold/20 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gold/15">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-serif font-bold text-ivory">WhatsApp Direct Order Channel</h3>
              <p className="text-xs text-ivory/60">Configure your business WhatsApp number and order confirmation message.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                Business WhatsApp Number (with Country Code) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="917871501939"
                className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs font-mono text-ivory focus:outline-none focus:border-gold"
              />
              <span className="text-[10px] text-ivory/40 mt-1 block">
                Do not include + symbol or dashes (e.g., 917871501939 for +91 7871501939).
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-ivory/70 mb-1.5">
                Pre-Filled Customer Message Greeting
              </label>
              <input
                type="text"
                value={formData.whatsappMessagePrefix}
                onChange={(e) => setFormData({ ...formData, whatsappMessagePrefix: e.target.value })}
                placeholder="Hi Tara Luxe! I just placed an order on your website:"
                className="w-full px-3 py-2 rounded-xl bg-obsidian border border-gold/30 text-xs text-ivory focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Button Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gold/15">
          <button
            type="button"
            onClick={() => setFormData(settings)}
            className="px-4 py-2.5 rounded-xl bg-espresso hover:bg-gold/10 border border-gold/20 text-ivory/70 hover:text-ivory text-xs font-semibold"
          >
            Reset Changes
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow transition-all disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-900" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving to D1...' : 'Save Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
