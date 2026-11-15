import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const couponsRouter = Router();

// GET /api/coupons
couponsRouter.get('/', (req, res) => {
  const coupons = db.getCoupons();
  res.json({ success: true, count: coupons.length, data: coupons });
});

// POST /api/coupons
couponsRouter.post('/', (req, res) => {
  const { code, type, value, minOrderAmount, active, description, maxUses } = req.body;

  if (!code || value === undefined) {
    return res.status(400).json({ success: false, message: 'Code and value are required' });
  }

  const existing = db.getCouponByCode(code);
  if (existing) {
    return res.status(409).json({ success: false, message: `Coupon ${code.toUpperCase()} already exists` });
  }

  const newCoupon = db.addCoupon({
    code: String(code).trim().toUpperCase(),
    type: type === 'FLAT' ? 'FLAT' : 'PERCENTAGE',
    value: Math.max(0, Number(value)),
    minOrderAmount: minOrderAmount ? Math.max(0, Number(minOrderAmount)) : 0,
    active: active !== undefined ? Boolean(active) : true,
    description: description || 'Exclusive Tara Luxe Discount',
    maxUses: maxUses ? Number(maxUses) : 1000
  });

  sse.broadcast('COUPON_CREATED', newCoupon);

  res.status(201).json({ success: true, data: newCoupon });
});

// PUT /api/coupons/:id
couponsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.value !== undefined) updates.value = Number(updates.value);
  if (updates.minOrderAmount !== undefined) updates.minOrderAmount = Number(updates.minOrderAmount);
  if (updates.maxUses !== undefined) updates.maxUses = Number(updates.maxUses);
  if (updates.active !== undefined) updates.active = Boolean(updates.active);

  const updated = db.updateCoupon(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  sse.broadcast('COUPON_UPDATED', updated);

  res.json({ success: true, data: updated });
});

// DELETE /api/coupons/:id
couponsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteCoupon(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  sse.broadcast('COUPON_DELETED', { couponId: id });

  res.json({ success: true, message: 'Coupon deleted' });
});

// POST /api/coupons/validate
couponsRouter.post('/validate', (req, res) => {
  const { code, bagSubtotal } = req.body;

  if (!code) {
    return res.status(400).json({ valid: false, message: 'Coupon code is required' });
  }

  const subtotal = Number(bagSubtotal) || 0;
  const coupon = db.getCouponByCode(code);

  if (!coupon) {
    return res.json({ valid: false, message: `Coupon "${code}" is invalid or does not exist.` });
  }

  if (!coupon.active) {
    return res.json({ valid: false, message: `Coupon "${coupon.code}" has expired or is inactive.` });
  }

  if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
    return res.json({ valid: false, message: `Coupon "${coupon.code}" has reached its maximum redemptions.` });
  }

  if (subtotal < coupon.minOrderAmount) {
    return res.json({
      valid: false,
      message: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for ${coupon.code}. Add ₹${(coupon.minOrderAmount - subtotal).toLocaleString('en-IN')} more to qualify.`
    });
  }

  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = Math.round((subtotal * coupon.value) / 100);
  } else {
    discountAmount = Math.min(coupon.value, subtotal);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  res.json({
    valid: true,
    message: `Applied ${coupon.code}! You save ₹${discountAmount.toLocaleString('en-IN')}`,
    coupon,
    discountAmount,
    subtotal,
    finalTotal
  });
});
