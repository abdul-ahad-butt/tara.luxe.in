import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { X, Trash2, Plus, Minus, Tag, Check, ArrowRight, ShoppingBag, Phone, MapPin, User, Sparkles, AlertCircle, Copy, QrCode, CreditCard, Send, ShieldCheck, Building } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SlideOverBagDrawer: React.FC = () => {
  const {
    isBagOpen,
    setIsBagOpen,
    bag,
    updateBagQuantity,
    removeFromBag,
    bagSubtotal,
    discountAmount,
    deliveryFee,
    payableTotal,
    finalTotal,
    settings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    coupons,
    checkout
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderId: string;
    trackingCode: string;
    whatsAppUrl: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState(''); // strictly 10 digits after +91
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMode, setPaymentMode] = useState<'COD' | 'UPI' | 'WHATSAPP'>('COD');
  const [upiTransactionRef, setUpiTransactionRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter payment modes based on admin controls in settings
  const availablePaymentModes = useMemo(() => {
    const list: Array<{ mode: 'COD' | 'UPI' | 'WHATSAPP'; label: string; desc: string }> = [];
    if (settings?.codEnabled !== false) {
      list.push({ mode: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay cash upon doorstep delivery' });
    }
    if (settings?.upiEnabled !== false) {
      list.push({ mode: 'UPI', label: 'UPI QR Pay / Bank', desc: 'Scan QR with GPay, PhonePe, Paytm, etc.' });
    }
    if (settings?.whatsappEnabled !== false) {
      list.push({ mode: 'WHATSAPP', label: 'WhatsApp Direct', desc: 'Order directly via concierge chat' });
    }
    return list;
  }, [settings]);

  // Ensure selected paymentMode is enabled
  useEffect(() => {
    if (availablePaymentModes.length > 0 && !availablePaymentModes.some(p => p.mode === paymentMode)) {
      setPaymentMode(availablePaymentModes[0].mode);
    }
  }, [availablePaymentModes, paymentMode]);

  const hasStockDeficit = bag.some((i) => i.product.quantity <= 0 || i.quantity > i.product.quantity);

  if (!isBagOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, max 10 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(val);
    setFormError(null);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    const result = await applyCoupon(code);
    setIsApplyingCoupon(false);

    if (!result.success) {
      setCouponError(result.message);
    } else {
      setCouponInput('');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (hasStockDeficit) {
      setFormError('Some pieces in your bag exceed currently available stock. Please adjust quantities to available levels before confirming your order.');
      return;
    }

    if (!customerName.trim()) {
      setFormError('Please enter your full customer name.');
      return;
    }

    // Strict 10-digit Indian Mobile Validation
    if (phoneDigits.length !== 10) {
      setFormError(`Please enter a valid 10-digit mobile number (${phoneDigits.length}/10 digits entered).`);
      return;
    }

    const firstDigit = phoneDigits[0];
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      setFormError('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    if (!streetAddress.trim() || !city.trim() || !stateName.trim()) {
      setFormError('Please complete your street address, city, and state.');
      return;
    }

    if (pincode.length !== 6) {
      setFormError('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setIsCheckingOut(true);

    const fullFormattedAddress = `${streetAddress.trim()}, ${city.trim()}, ${stateName.trim()} - PIN: ${pincode.trim()}`;
    const fullPhone = `+91 ${phoneDigits}`;

    const result = await checkout({
      name: customerName.trim(),
      phone: fullPhone,
      address: fullFormattedAddress,
      addressDetails: {
        street: streetAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim()
      },
      paymentMode,
      upiTransactionRef: paymentMode === 'UPI' ? upiTransactionRef.trim() : undefined
    });

    setIsCheckingOut(false);

    if (result.success && result.order) {
      setPlacedOrderInfo({
        orderId: result.order.id,
        trackingCode: result.order.trackingCode,
        whatsAppUrl: result.whatsAppUrl || result.order.whatsAppUrl
      });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F5E6BE', '#C5A059', '#10B981']
        });
      } catch {}
    } else {
      setFormError(result.message);
    }
  };

  const resetAndClose = () => {
    setIsBagOpen(false);
    setShowCheckoutForm(false);
    setPlacedOrderInfo(null);
    setFormError(null);
    setCouponError(null);
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeCoupons = coupons.filter(c => c.active);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-obsidian/85 backdrop-blur-sm transition-opacity"
        onClick={resetAndClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-espresso border-l border-gold/25 shadow-2xl flex flex-col justify-between text-ivory">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-gold/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold" />
              <h2 className="font-serif text-xl font-bold tracking-wide text-ivory">
                Your Shopping Bag
              </h2>
              {bag.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold-light font-mono font-bold">
                  {bag.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              )}
            </div>

            <button
              onClick={resetAndClose}
              className="p-1.5 rounded-full hover:bg-obsidian/50 text-ivory/70 hover:text-ivory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {placedOrderInfo ? (
              /* Order Completed Screen with TLX-XXXXXX Tracking Code */
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-stock/20 border-2 border-emerald-stock mx-auto flex items-center justify-center text-emerald-stock">
                  <Check className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-gold">Order Placed Successfully! ✦</h3>
                  <p className="text-xs text-ivory/70 mt-1">Status: Pending Admin Approval</p>
                </div>

                {/* Tracking Code Highlight Box */}
                <div className="p-4 rounded-2xl bg-obsidian border-2 border-gold/40 text-center space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-brushed">
                    Your Unique Tracking Code
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-gold tracking-widest">
                      {placedOrderInfo.trackingCode}
                    </span>
                    <button
                      onClick={() => copyTrackingCode(placedOrderInfo.trackingCode)}
                      className="p-1.5 rounded-lg bg-gold/20 hover:bg-gold/30 text-gold text-xs"
                      title="Copy Tracking Code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-stock" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-ivory/50">
                    Saved in your browser. You can track this order at any time using this code!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-espresso/80 border border-gold/20 text-xs text-ivory-warm/80 leading-relaxed text-left space-y-2">
                  <p>Thank you, <strong className="text-ivory">{customerName}</strong>! Your Tara Luxe order <span className="font-mono text-gold">{placedOrderInfo.orderId}</span> has been logged and live inventory has been deducted.</p>
                  <p>Confirm directly with our support team on WhatsApp for express priority dispatch:</p>
                </div>

                <a
                  href={placedOrderInfo.whatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Send Order to WhatsApp (+91 7871501939)</span>
                </a>

                <button
                  onClick={resetAndClose}
                  className="text-xs text-gold-light hover:underline font-mono"
                >
                  Continue Shopping
                </button>
              </div>
            ) : bag.length === 0 ? (
              /* Empty Bag State */
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mx-auto flex items-center justify-center text-gold">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="font-serif text-lg font-bold text-ivory">Your bag is empty</p>
                <p className="text-xs text-ivory/60 max-w-xs mx-auto leading-relaxed">
                  Explore our 18k gold-plated 316L anti-tarnish jewellery and handcrafted festive தாRA hampers.
                </p>
                <button
                  onClick={() => setIsBagOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-gold text-obsidian text-xs font-bold uppercase tracking-wider"
                >
                  Explore Collection
                </button>
              </div>
            ) : showCheckoutForm ? (
              /* Checkout Form View */
              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gold/20">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <User className="w-4 h-4" /> Shipping & Contact Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="text-xs text-gold-light hover:underline"
                  >
                    ← Back to Items
                  </button>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-ruby-stock/20 border border-ruby-stock/50 text-ruby-stock text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sundaram"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Mandatory +91 Fixed Badge + 10-Digit Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-ivory/70">
                      WhatsApp / Phone Number *
                    </label>
                    <span className="text-[10px] font-mono text-gold">
                      {phoneDigits.length}/10 digits
                    </span>
                  </div>

                  <div className="flex rounded-xl overflow-hidden border border-gold/30 focus-within:border-gold bg-obsidian">
                    {/* Fixed Non-Removable +91 Badge */}
                    <div className="px-3 py-2.5 bg-espresso border-r border-gold/30 text-gold text-xs font-mono font-bold flex items-center gap-1.5 select-none flex-shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>

                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phoneDigits}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className="flex-1 bg-transparent px-3 py-2.5 text-xs text-ivory font-mono tracking-wider focus:outline-none placeholder-ivory/30"
                    />
                  </div>
                  <p className="text-[10px] text-ivory/50 mt-1">
                    Must be 10 digits starting with 6, 7, 8, or 9.
                  </p>
                </div>

                {/* House/Flat & Street Address */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                    Flat / House No. & Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Royal Residency, 12th Cross"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full bg-obsidian border border-gold/30 rounded-xl px-3.5 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                  />
                </div>

                {/* City, State & PIN Code */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Chennai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-obsidian border border-gold/30 rounded-xl px-2.5 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tamil Nadu"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-obsidian border border-gold/30 rounded-xl px-2.5 py-2 text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="600001"
                      value={pincode}
                      onChange={handlePincodeChange}
                      maxLength={6}
                      className="w-full bg-obsidian border border-gold/30 rounded-xl px-2.5 py-2 text-xs text-ivory font-mono focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1.5">
                    Payment Mode
                  </label>
                  <div className={`grid ${availablePaymentModes.length === 1 ? 'grid-cols-1' : availablePaymentModes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                    {availablePaymentModes.map((p) => (
                      <button
                        type="button"
                        key={p.mode}
                        onClick={() => setPaymentMode(p.mode)}
                        className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                          paymentMode === p.mode
                            ? 'bg-gold/20 border-gold text-gold-light shadow-sm'
                            : 'bg-obsidian border-gold/20 text-ivory/60 hover:text-ivory hover:border-gold/40'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode 1: Cash on Delivery (COD) Details */}
                {paymentMode === 'COD' && (
                  <div className="p-3.5 rounded-2xl bg-espresso/90 border border-gold/30 text-xs space-y-1.5 animate-in fade-in">
                    <div className="font-serif font-bold text-gold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-ivory/70 leading-relaxed">
                      {settings?.deliveryNote || 'Standard delivery. Out-of-zone or express COD orders may include an extra delivery charge confirmed during Pending review.'}
                    </p>
                  </div>
                )}

                {/* Mode 2: UPI QR Pay / Bank Details */}
                {paymentMode === 'UPI' && (
                  <div className="p-4 rounded-2xl bg-espresso/90 border border-gold/40 space-y-3.5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-gold/15 pb-2">
                      <div className="flex items-center gap-2 text-xs font-serif font-bold text-gold">
                        <QrCode className="w-4 h-4 text-gold" />
                        <span>Scan UPI QR Code (₹{payableTotal.toLocaleString('en-IN')})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-stock font-bold">Zero Gateway Fees</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Live Generated or Admin-Uploaded QR Code */}
                      <div className="w-32 h-32 p-1.5 rounded-xl bg-white border border-gold/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <img
                          src={
                            settings?.upiQrImageUrl && settings.upiQrImageUrl.trim() !== ''
                              ? settings.upiQrImageUrl
                              : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                  `upi://pay?pa=${settings?.upiId || 'taraluxe@upi'}&pn=${encodeURIComponent(
                                    settings?.upiPayeeName || 'Tara Luxe Anti-Tarnish Jewellery'
                                  )}&am=${payableTotal}&cu=INR&tn=${encodeURIComponent('Tara Luxe Jewellery Order')}`
                                )}`
                          }
                          alt="Tara Luxe UPI QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-2 text-xs w-full">
                        <div>
                          <div className="text-[10px] font-mono text-ivory/50 uppercase">UPI ID / VPA</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-bold text-gold-light truncate">
                              {settings?.upiId || 'taraluxe@upi'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(settings?.upiId || 'taraluxe@upi');
                                setCopiedUpi(true);
                                setTimeout(() => setCopiedUpi(false), 2000);
                              }}
                              className="p-1 rounded-md bg-obsidian border border-gold/30 text-ivory/70 hover:text-gold"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-stock" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] text-ivory/60 mt-0.5">
                            {settings?.upiPayeeName || 'Tara Luxe Anti-Tarnish Jewellery'}
                          </div>
                        </div>

                        {/* Bank Account Details if populated */}
                        {settings?.bankAccountNumber && (
                          <div className="pt-2 border-t border-gold/15 text-[10px] font-mono text-ivory/70 space-y-0.5">
                            <div>Bank: {settings.bankName || 'Direct NEFT/IMPS'}</div>
                            <div>A/C: {settings.bankAccountNumber} ({settings.bankAccountName || 'Tara Luxe'})</div>
                            <div>IFSC: {settings.bankIfsc}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* UTR Input Field */}
                    <div className="pt-2 border-t border-gold/15">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-ivory/70 mb-1">
                        12-Digit UPI Ref / UTR Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 432109876543 (from GPay / PhonePe / Paytm)"
                        value={upiTransactionRef}
                        onChange={(e) => setUpiTransactionRef(e.target.value.trim())}
                        className="w-full bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-xs text-ivory font-mono focus:border-gold"
                      />
                      <p className="text-[10px] text-ivory/50 mt-1">
                        Enter your 12-digit UPI reference number after scanning & paying to accelerate your dispatch confirmation.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mode 3: WhatsApp Direct Details */}
                {paymentMode === 'WHATSAPP' && (
                  <div className="p-3.5 rounded-2xl bg-espresso/90 border border-emerald-500/40 text-xs space-y-1.5 animate-in fade-in">
                    <div className="font-serif font-bold text-emerald-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp Direct Order Concierge</span>
                    </div>
                    <p className="text-[11px] text-ivory/70 leading-relaxed">
                      Confirm order and delivery charges directly with Tara Luxe on WhatsApp (+{settings?.whatsappNumber || '917871501939'}). Your bag and delivery address will be pre-filled into the chat window upon clicking Confirm Order.
                    </p>
                  </div>
                )}

                {/* Final Order Confirmation Button */}
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-obsidian font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCheckingOut ? 'Securing Stock & Generating Tracking Code...' : `Confirm Order (₹${payableTotal.toLocaleString('en-IN')})`}</span>
                </button>
              </form>
            ) : (
              /* Bag Items List View */
              <>
                {hasStockDeficit && (
                  <div className="p-3.5 rounded-2xl bg-ruby-stock/20 border border-ruby-stock/40 text-ruby-stock text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Live Stock Alert: Some pieces exceed current inventory. Please adjust quantities below to proceed.</span>
                  </div>
                )}

                <div className="space-y-4">
                  {bag.map((item) => {
                    const available = item.product.quantity;
                    const isOutOfStock = available <= 0;
                    const isOverOrdered = item.quantity > available && available > 0;
                    const excess = isOverOrdered ? item.quantity - available : 0;

                    return (
                      <div
                        key={item.productId}
                        className={`p-3.5 rounded-2xl bg-obsidian/70 border flex flex-col gap-3 relative transition-all ${
                          isOutOfStock || isOverOrdered ? 'border-ruby-stock/50 bg-ruby-stock/5' : 'border-gold/15'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <LuxuryImage
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover bg-espresso flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-serif font-bold text-ivory truncate">
                              {item.product.name}
                            </h4>
                            <div className="text-[11px] font-mono text-gold mt-0.5">
                              ₹{item.product.price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-ivory/50 mt-0.5 flex items-center gap-2">
                              <span>In stock: {available}</span>
                              {isOutOfStock && (
                                <span className="px-1.5 py-0.2 rounded bg-ruby-stock/20 text-ruby-stock text-[9px] font-mono font-bold">
                                  Out of stock
                                </span>
                              )}
                            </div>

                            {/* Quantity Counter */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center bg-espresso rounded-lg border border-gold/30">
                                <button
                                  onClick={() => updateBagQuantity(item.productId, -1)}
                                  className="p-1 hover:text-gold transition-colors text-ivory/80"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className={`px-2 text-xs font-mono font-bold ${isOverOrdered ? 'text-ruby-stock' : 'text-gold'}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  disabled={item.quantity >= available}
                                  onClick={() => updateBagQuantity(item.productId, 1)}
                                  className="p-1 hover:text-gold transition-colors text-ivory/80 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromBag(item.productId)}
                            className="p-2 text-ivory/40 hover:text-ruby-stock transition-colors self-start"
                            title="Remove piece"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Over-order Warning Banner with 1-click 'Adjust to Available' button */}
                        {isOverOrdered && (
                          <div className="p-2.5 rounded-xl bg-ruby-stock/15 border border-ruby-stock/30 text-xs space-y-1.5">
                            <p className="text-[11px] text-ruby-stock flex items-center gap-1.5 leading-snug">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>Only {available} unit(s) left in stock for {item.product.name}. Please reduce your quantity by {excess} unit(s) to proceed, otherwise this item is out of stock.</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => updateBagQuantity(item.productId, available - item.quantity)}
                              className="px-2.5 py-1 rounded-lg bg-ruby-stock/25 hover:bg-ruby-stock/40 text-ruby-stock border border-ruby-stock/50 text-[10px] font-bold font-mono transition-all"
                            >
                              Adjust to {available} Available
                            </button>
                          </div>
                        )}

                        {isOutOfStock && (
                          <div className="p-2.5 rounded-xl bg-ruby-stock/15 border border-ruby-stock/30 text-[11px] text-ruby-stock flex items-center justify-between">
                            <span>Piece is sold out. Please remove to continue.</span>
                            <button
                              type="button"
                              onClick={() => removeFromBag(item.productId)}
                              className="text-[10px] font-bold underline font-mono"
                            >
                              Remove Piece
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Optional Discount Coupon Section */}
                <div className="pt-2 border-t border-gold/15">
                  <div className="text-xs font-mono uppercase tracking-wider text-gold-brushed mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Discount Coupon (Optional)
                    </span>
                    <span className="text-[10px] text-ivory/40 lowercase">optional</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="p-3 rounded-xl bg-gold/10 border border-gold/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold" />
                        <div>
                          <span className="font-mono text-xs font-bold text-gold">
                            {appliedCoupon.coupon.code}
                          </span>
                          <div className="text-[10px] text-emerald-stock">
                            Saved ₹{discountAmount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] text-ruby-stock hover:underline font-mono"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. TARALUXE10 (optional)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-obsidian border border-gold/30 rounded-xl px-3 py-2 text-xs text-ivory font-mono uppercase focus:outline-none focus:border-gold"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="px-4 py-2 rounded-xl bg-gold/20 hover:bg-gold/30 border border-gold/50 text-gold-light text-xs font-semibold disabled:opacity-40"
                        >
                          {isApplyingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>

                      {couponError && (
                        <p className="mt-1.5 text-[11px] text-ruby-stock flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {couponError}
                        </p>
                      )}

                      {/* Clickable Active Coupon Shortcuts */}
                      {activeCoupons.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {activeCoupons.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleApplyCoupon(c.code)}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-espresso border border-gold/30 text-gold-light/90 hover:border-gold hover:text-gold font-mono"
                            >
                              +{c.code} ({c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Summary */}
          {bag.length > 0 && !placedOrderInfo && (
            <div className="p-5 sm:p-6 border-t border-gold/20 bg-obsidian/90 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-ivory/70">
                  <span>Bag Subtotal</span>
                  <span className="font-mono">₹{bagSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-stock">
                    <span>Coupon Savings</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-ivory/70">
                  <span>Delivery Charges</span>
                  <span className={deliveryFee === 0 ? "text-emerald-stock font-mono" : "text-gold font-mono"}>
                    {deliveryFee === 0 ? 'FREE (Festive Offer)' : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-gold pt-2 border-t border-gold/15">
                  <span>Payable Total</span>
                  <span className="font-mono">₹{payableTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {!showCheckoutForm && (
                <button
                  onClick={() => setShowCheckoutForm(true)}
                  disabled={hasStockDeficit}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    hasStockDeficit
                      ? 'bg-espresso border border-ruby-stock/40 text-ruby-stock cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-gold-brushed to-gold hover:from-gold hover:to-gold-light text-obsidian shadow-gold-glow'
                  }`}
                >
                  <span>{hasStockDeficit ? 'Adjust Quantities to Proceed' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
