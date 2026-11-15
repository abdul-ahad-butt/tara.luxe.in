import { Router } from 'express';
import { db, type OrderItem, type Order } from '../db.js';
import { sse } from '../sse.js';

export const bagAndOrdersRouter = Router();

// GET /api/bag-events (Recent bag events for Admin Panel)
bagAndOrdersRouter.get('/bag-events', (req, res) => {
  const events = db.getBagEvents(200);
  res.json({ success: true, count: events.length, data: events });
});

// POST /api/bag-events (Live Add to Bag trigger from Storefront for products OR hampers)
bagAndOrdersRouter.post('/bag-events', (req, res) => {
  const { sessionId, customerName, type, productId, productTitle, productImage, quantity, price, subtotal } = req.body;

  if (!productId || !productTitle) {
    return res.status(400).json({ success: false, message: 'productId and productTitle are required' });
  }

  const event = db.addBagEvent({
    sessionId: sessionId || `session-${Math.random().toString(36).substring(2, 8)}`,
    customerName: customerName || 'Browsing Customer',
    type: type || 'ADD_TO_BAG',
    productId,
    productTitle,
    productImage: productImage || '',
    quantity: Number(quantity) || 1,
    price: Number(price) || 0,
    subtotal: subtotal !== undefined ? Number(subtotal) : (Number(price) || 0) * (Number(quantity) || 1)
  });

  // Also log notification in DB
  const notif = db.addNotification({
    title: 'Customer Bag Activity',
    message: `${productTitle} (x${event.quantity}) added to bag.`,
    type: 'bag'
  });
  sse.broadcast('NOTIFICATION_CREATED', notif);

  // Broadcast to Admin Panel in real time!
  sse.broadcast('BAG_EVENT_CREATED', event);

  res.status(201).json({ success: true, data: event });
});

// PATCH /api/bag-events/:id/archive
bagAndOrdersRouter.patch('/bag-events/:id/archive', (req, res) => {
  const { id } = req.params;
  const { archived = true } = req.body;
  const updated = db.archiveBagEvent(id, Boolean(archived));
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Bag event not found' });
  }
  sse.broadcast('BAG_EVENT_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// PATCH /api/bag-events/archive (Bulk archive)
bagAndOrdersRouter.patch('/bag-events/archive', (req, res) => {
  const { ids, archived = true } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }
  const count = db.bulkArchiveBagEvents(ids, Boolean(archived));
  sse.broadcast('BAG_EVENTS_ARCHIVED', { ids, archived: Boolean(archived) });
  res.json({ success: true, count, message: `Archived ${count} bag events` });
});

// DELETE /api/bag-events/:id
bagAndOrdersRouter.delete('/bag-events/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteBagEvent(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Bag event not found' });
  }
  sse.broadcast('BAG_EVENT_DELETED', { id });
  res.json({ success: true, message: 'Bag event deleted permanently' });
});

// POST /api/bag-events/bulk-delete
bagAndOrdersRouter.post('/bag-events/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }
  const count = db.bulkDeleteBagEvents(ids);
  sse.broadcast('BAG_EVENTS_BULK_DELETED', { ids, count });
  res.json({ success: true, count, message: `Deleted ${count} bag events permanently` });
});

// DELETE /api/bag-events (Bulk delete via body)
bagAndOrdersRouter.delete('/bag-events', (req, res) => {
  const { ids } = req.body || {};
  if (Array.isArray(ids) && ids.length > 0) {
    const count = db.bulkDeleteBagEvents(ids);
    sse.broadcast('BAG_EVENTS_BULK_DELETED', { ids, count });
    return res.json({ success: true, count, message: `Deleted ${count} bag events permanently` });
  }
  res.status(400).json({ success: false, message: 'Ids required for bulk deletion' });
});

// GET /api/orders
bagAndOrdersRouter.get('/orders', (req, res) => {
  const orders = db.getOrders();
  res.json({ success: true, count: orders.length, data: orders });
});

// GET /api/orders/track/:query (Live tracking by trackingCode e.g. TLX-482910 or Phone)
bagAndOrdersRouter.get('/orders/track/:query', (req, res) => {
  const order = db.getOrderByTrackingOrPhone(req.params.query);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: `No active order found for "${req.params.query}". Please check your Tracking Code (TLX-XXXXXX) or 10-digit phone number.`
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// POST /api/orders (Customer checkout & stock deduction)
bagAndOrdersRouter.post('/orders', (req, res) => {
  const {
    customerName,
    customerPhone,
    address,
    addressDetails,
    paymentMode,
    items,
    couponCode,
    subtotal,
    discount,
    finalTotal
  } = req.body;

  if (!customerName || !customerPhone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name, 10-digit phone number, address, and at least one item are required.'
    });
  }

  // 1. Verify stock availability for all items atomically
  for (const item of items as OrderItem[]) {
    const product = db.getProductById(item.productId);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `Product "${item.title || item.productId}" is no longer available.`
      });
    }
    if (product.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}.`
      });
    }
  }

  // 2. Atomically deduct stock and broadcast adjustments
  for (const item of items as OrderItem[]) {
    const updated = db.adjustStock(item.productId, -item.quantity, false);
    if (updated) {
      sse.broadcast('STOCK_ADJUSTED', {
        productId: item.productId,
        product: updated,
        quantity: updated.quantity,
        reason: 'ORDER_PURCHASE'
      });
    }
  }

  // 3. Increment coupon usage if applied
  if (couponCode) {
    db.incrementCouponUsage(couponCode);
    const updatedCoupon = db.getCouponByCode(couponCode);
    if (updatedCoupon) {
      sse.broadcast('COUPON_UPDATED', updatedCoupon);
    }
  }

  // 4. Create Order record (with TLX-XXXXXX tracking code)
  const order = db.addOrder({
    customerName,
    customerPhone,
    address,
    addressDetails,
    paymentMode: paymentMode || 'COD',
    items,
    couponCode: couponCode || null,
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    finalTotal: Number(finalTotal) || 0,
    status: 'Pending',
    statusMessage: 'Your order request is Pending Admin Approval',
    whatsAppUrl: ''
  });

  // 5. Generate formatted WhatsApp message & URL with Tracking Code
  const itemsText = (items as OrderItem[])
    .map(i => `• ${i.title} (x${i.quantity}) - ₹${(i.price * i.quantity).toLocaleString('en-IN')}`)
    .join('\n');

  const waRawMessage = `✨ *TARA LUXE (@tara.luxe.in) ORDER REQUEST* ✨\n\n` +
    `🔖 *Tracking Code:* *${order.trackingCode}*\n` +
    `👤 *Customer:* ${customerName}\n` +
    `📞 *Phone:* ${customerPhone}\n` +
    `📍 *Delivery Address:* ${address}\n` +
    `💳 *Payment Mode:* ${paymentMode || 'Cash on Delivery (COD)'}\n\n` +
    `🛍️ *Ordered Pieces:*\n${itemsText}\n\n` +
    `Subtotal: ₹${Number(subtotal).toLocaleString('en-IN')}\n` +
    (couponCode ? `Coupon (${couponCode}): -₹${Number(discount).toLocaleString('en-IN')}\n` : '') +
    `*Payable Total: ₹${Number(finalTotal).toLocaleString('en-IN')}*\n\n` +
    `_Anti-Tarnish 18k Gold Plated Jewellery & Luxury Gift Hampers_`;

  const whatsAppUrl = `https://wa.me/message/U5MPAWAN3UPFM1?text=${encodeURIComponent(waRawMessage)}`;
  order.whatsAppUrl = whatsAppUrl;

  // Log in notification database
  const notif = db.addNotification({
    title: `New Order: ${order.trackingCode}`,
    message: `${customerName} placed order for ₹${order.finalTotal.toLocaleString('en-IN')} (${items.length} items).`,
    type: 'order'
  });
  sse.broadcast('NOTIFICATION_CREATED', notif);

  // Broadcast real-time ORDER_CREATED event
  sse.broadcast('ORDER_CREATED', order);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
    trackingCode: order.trackingCode,
    whatsAppUrl
  });
});

// PATCH /api/orders/:id/status
bagAndOrdersRouter.patch('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, statusMessage } = req.body;

  const validStatuses: Order['status'][] = ['Pending', 'Approved', 'Dispatched', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updated = db.updateOrderStatus(id, status, statusMessage);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Broadcast specific ORDER_STATUS_UPDATED event for real-time tracking
  sse.broadcast('ORDER_STATUS_UPDATED', {
    orderId: updated.id,
    trackingCode: updated.trackingCode,
    status: updated.status,
    statusMessage: updated.statusMessage,
    order: updated
  });

  sse.broadcast('ORDER_UPDATED', updated);

  res.json({ success: true, data: updated });
});

// PATCH /api/orders/:id/archive
bagAndOrdersRouter.patch('/orders/:id/archive', (req, res) => {
  const { id } = req.params;
  const { archived = true } = req.body;
  const updated = db.archiveOrder(id, Boolean(archived));
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  sse.broadcast('ORDER_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// PATCH /api/orders/archive (Bulk archive)
bagAndOrdersRouter.patch('/orders/archive', (req, res) => {
  const { ids, archived = true } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }
  const count = db.bulkArchiveOrders(ids, Boolean(archived));
  sse.broadcast('ORDERS_ARCHIVED', { ids, archived: Boolean(archived) });
  res.json({ success: true, count, message: `Archived ${count} orders` });
});

// DELETE /api/orders/:id
bagAndOrdersRouter.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteOrder(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  sse.broadcast('ORDER_DELETED', { id });
  res.json({ success: true, message: 'Order deleted permanently' });
});

// POST /api/orders/bulk-delete
bagAndOrdersRouter.post('/orders/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }
  const count = db.bulkDeleteOrders(ids);
  sse.broadcast('ORDERS_BULK_DELETED', { ids, count });
  res.json({ success: true, count, message: `Deleted ${count} orders permanently` });
});

// DELETE /api/orders (Bulk delete)
bagAndOrdersRouter.delete('/orders', (req, res) => {
  const { ids } = req.body || {};
  if (Array.isArray(ids) && ids.length > 0) {
    const count = db.bulkDeleteOrders(ids);
    sse.broadcast('ORDERS_BULK_DELETED', { ids, count });
    return res.json({ success: true, count, message: `Deleted ${count} orders permanently` });
  }
  res.status(400).json({ success: false, message: 'Ids required for bulk deletion' });
});
