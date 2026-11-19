import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice: number;
  quantity: number;
  imageUrl: string;
  badge: string;
  specs: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  title: string;
  iconText: string;
  category: string;
  image: string;
  caption: string;
  tag: string;
  createdAt: string;
}

export interface Collaboration {
  id: string;
  creatorName: string;
  handle: string;
  profileUrl: string;
  image: string;
  featuredItem: string;
  quote: string;
  date: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT';
  value: number;
  minOrderAmount: number;
  active: boolean;
  description: string;
  usageCount: number;
  maxUses?: number;
}

export interface BagItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  address: string;
  addressDetails?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMode: 'COD' | 'UPI' | 'WHATSAPP';
  items: OrderItem[];
  couponCode: string | null;
  subtotal: number;
  discount: number;
  finalTotal: number;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Delivered';
  statusMessage?: string;
  whatsAppUrl: string;
  createdAt: string;
  updatedAt?: string;
}

interface AppliedCouponInfo {
  coupon: Coupon;
  discountAmount: number;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  highlights: Highlight[];
  collaborations: Collaboration[];
  coupons: Coupon[];
  bag: BagItem[];
  isBagOpen: boolean;
  appliedCoupon: AppliedCouponInfo | null;
  activeCategory: string;
  searchQuery: string;
  sortBy: string;
  loading: boolean;
  notification: string | null;
  activeOrders: Order[];
  isTrackingModalOpen: boolean;
  searchedOrder: Order | null;
  trackingError: string | null;
  isTrackingLoading: boolean;
  setIsBagOpen: (open: boolean) => void;
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  addToBag: (product: Product, quantity?: number) => void;
  updateBagQuantity: (productId: string, delta: number) => void;
  removeFromBag: (productId: string) => void;
  clearBag: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  checkout: (customerData: {
    name: string;
    phone: string;
    address: string;
    addressDetails?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMode: 'COD' | 'UPI' | 'WHATSAPP';
  }) => Promise<{ success: boolean; order?: Order; trackingCode?: string; whatsAppUrl?: string; message: string }>;
  trackOrder: (query: string) => Promise<{ success: boolean; data?: Order; message: string }>;
  setIsTrackingModalOpen: (open: boolean) => void;
  setSearchedOrder: (order: Order | null) => void;
  bagSubtotal: number;
  discountAmount: number;
  finalTotal: number;
  bagCount: number;
}

const getBackendUrl = (): string => {
  // Priority 1: import.meta.env.VITE_API_URL (when set in Cloudflare Pages → Variables and secrets)
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('tlx_api_url');
    if (savedUrl) return savedUrl.replace(/\/+$/, '');

    const { hostname } = window.location;
    // Priority 2: localhost / 127.0.0.1 in local dev
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return 'http://localhost:8787';
    }
    // Priority 3: On *.pages.dev without VITE_API_URL at build time, fall back to deployed Worker URL
    if (hostname.endsWith('.pages.dev')) {
      return 'https://tara-luxe-in.workers.dev';
    }
    // When served directly by the Cloudflare Worker (*.workers.dev or custom domain), use same-origin relative URL
    return '';
  }
  return '';
};

const BACKEND_URL = getBackendUrl();

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bag, setBag] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem('tl_bag');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Persistent Active Orders (survives page refreshes & reloads)
  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('tlx_active_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Persistent guest session ID
  const sessionId = useMemo(() => {
    let id = localStorage.getItem('tl_session_id');
    if (!id) {
      id = `guest-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('tl_session_id', id);
    }
    return id;
  }, []);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  }, []);

  // Save bag to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tl_bag', JSON.stringify(bag));
    } catch {}
  }, [bag]);

  // Save active orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tlx_active_orders', JSON.stringify(activeOrders));
    } catch {}
  }, [activeOrders]);

  // Initial Fetch: Products, Categories, Highlights, Collabs, Coupons & Order Statuses
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resProd, resCat, resHigh, resCollab, resCoup] = await Promise.all([
        fetch(`${BACKEND_URL}/api/products`),
        fetch(`${BACKEND_URL}/api/categories`),
        fetch(`${BACKEND_URL}/api/highlights`),
        fetch(`${BACKEND_URL}/api/collaborations`),
        fetch(`${BACKEND_URL}/api/coupons`)
      ]);

      const [dProd, dCat, dHigh, dCollab, dCoup] = await Promise.all([
        resProd.json(),
        resCat.json(),
        resHigh.json(),
        resCollab.json(),
        resCoup.json()
      ]);

      if (dProd.success) setProducts(dProd.data);
      if (dCat.success) setCategories(dCat.data);
      if (dHigh.success) setHighlights(dHigh.data);
      if (dCollab.success) setCollaborations(dCollab.data);
      if (dCoup.success) setCoupons(dCoup.data);

      // Re-fetch latest status for any active customer orders in localStorage
      const savedOrdersRaw = localStorage.getItem('tlx_active_orders');
      if (savedOrdersRaw) {
        try {
          const parsedOrders: Order[] = JSON.parse(savedOrdersRaw);
          if (parsedOrders.length > 0) {
            const updatedList: Order[] = [];
            for (const ord of parsedOrders) {
              const code = ord.trackingCode || ord.id;
              try {
                const trackRes = await fetch(`${BACKEND_URL}/api/orders/track/${encodeURIComponent(code)}`);
                const trackData = await trackRes.json();
                if (trackData.success && trackData.data) {
                  updatedList.push(trackData.data);
                } else {
                  updatedList.push(ord);
                }
              } catch {
                updatedList.push(ord);
              }
            }
            setActiveOrders(updatedList);
          }
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load store data from backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Connect to SSE Stream for zero-refresh real-time updates!
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      eventSource = new EventSource(`${BACKEND_URL}/api/stream`);

      eventSource.onopen = () => {
        console.log('[Storefront SSE] Connected to real-time stream.');
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (type === 'STOCK_ADJUSTED') {
            const { productId, quantity } = data;
            setProducts((prev) =>
              prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
            );

            setBag((prevBag) =>
              prevBag.map((item) => {
                if (item.productId === productId) {
                  const cappedQty = Math.min(item.quantity, quantity);
                  return {
                    ...item,
                    quantity: cappedQty,
                    product: { ...item.product, quantity }
                  };
                }
                return item;
              }).filter((item) => item.quantity > 0)
            );
          } else if (type === 'PRODUCT_UPDATED') {
            setProducts((prev) =>
              prev.map((p) => (p.id === data.id ? data : p))
            );
            setBag((prevBag) =>
              prevBag.map((item) =>
                item.productId === data.id ? { ...item, product: data } : item
              )
            );
          } else if (type === 'PRODUCT_CREATED') {
            setProducts((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
          } else if (type === 'PRODUCT_DELETED') {
            setProducts((prev) => prev.filter((p) => p.id !== data.productId));
            setBag((prev) => prev.filter((item) => item.productId !== data.productId));
          } else if (type === 'CATEGORY_CREATED') {
            setCategories((prev) => [...prev.filter((c) => c.id !== data.id), data]);
          } else if (type === 'CATEGORY_DELETED') {
            setCategories((prev) => prev.filter((c) => c.id !== data.categoryId));
          } else if (type === 'HIGHLIGHT_CREATED') {
            setHighlights((prev) => [...prev.filter((h) => h.id !== data.id), data]);
          } else if (type === 'HIGHLIGHT_UPDATED') {
            setHighlights((prev) => prev.map((h) => (h.id === data.id ? data : h)));
          } else if (type === 'HIGHLIGHT_DELETED') {
            setHighlights((prev) => prev.filter((h) => h.id !== data.highlightId));
          } else if (type === 'COLLAB_CREATED') {
            setCollaborations((prev) => [data, ...prev.filter((c) => c.id !== data.id)]);
          } else if (type === 'COLLAB_UPDATED') {
            setCollaborations((prev) => prev.map((c) => (c.id === data.id ? data : c)));
          } else if (type === 'COLLAB_DELETED') {
            setCollaborations((prev) => prev.filter((c) => c.id !== data.collabId));
          } else if (type === 'COUPON_CREATED' || type === 'COUPON_UPDATED') {
            setCoupons((prev) => {
              const idx = prev.findIndex((c) => c.id === data.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = data;
                return next;
              }
              return [data, ...prev];
            });
          } else if (type === 'COUPON_DELETED') {
            setCoupons((prev) => prev.filter((c) => c.id !== data.couponId));
            setAppliedCoupon((curr) => (curr?.coupon.id === data.couponId ? null : curr));
          } else if (type === 'ORDER_STATUS_UPDATED') {
            // Live real-time customer order status update!
            const { orderId, trackingCode, status, statusMessage, order } = data;
            setActiveOrders((prevOrders) =>
              prevOrders.map((o) => {
                if (o.id === orderId || o.trackingCode === trackingCode) {
                  return order || { ...o, status, statusMessage };
                }
                return o;
              })
            );
            setSearchedOrder((curr) =>
              curr && (curr.id === orderId || curr.trackingCode === trackingCode)
                ? order || { ...curr, status, statusMessage }
                : curr
            );
            showNotification(`Order ${trackingCode || orderId} status updated: ${status} ✦`);
          }
        } catch (err) {
          console.error('[Storefront SSE Parse Error]:', err);
        }
      };

      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [showNotification]);

  // Calculate Subtotal & Totals
  const bagSubtotal = useMemo(() => {
    return bag.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [bag]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const { coupon } = appliedCoupon;
    if (bagSubtotal < coupon.minOrderAmount) return 0;
    if (coupon.type === 'PERCENTAGE') {
      return Math.round((bagSubtotal * coupon.value) / 100);
    }
    return Math.min(coupon.value, bagSubtotal);
  }, [bagSubtotal, appliedCoupon]);

  const finalTotal = useMemo(() => {
    return Math.max(0, bagSubtotal - discountAmount);
  }, [bagSubtotal, discountAmount]);

  const bagCount = useMemo(() => {
    return bag.reduce((sum, item) => sum + item.quantity, 0);
  }, [bag]);

  // Dispatch real-time bag event to backend -> Admin Panel (for products AND hampers)
  const sendBagEvent = useCallback(
    async (type: 'ADD_TO_BAG' | 'UPDATE_QUANTITY' | 'REMOVE_FROM_BAG', product: Product, quantity: number) => {
      try {
        await fetch(`${BACKEND_URL}/api/bag-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            customerName: 'Customer (Live Session)',
            type,
            productId: product.id,
            productTitle: product.name,
            productImage: product.imageUrl,
            quantity,
            price: product.price,
            subtotal: product.price * quantity
          })
        });
      } catch (err) {
        console.error('Failed to dispatch bag event:', err);
      }
    },
    [sessionId]
  );

  // Add to Bag with real-time stock cap
  const addToBag = useCallback(
    (product: Product, quantityToAdd = 1) => {
      if (product.quantity <= 0) {
        showNotification(`Sorry! "${product.name}" is currently sold out.`);
        return;
      }

      setBag((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = currentQty + quantityToAdd;

        if (targetQty > product.quantity) {
          showNotification(`Only ${product.quantity} units available in stock!`);
          return prev;
        }

        let updatedBag: BagItem[];
        if (existing) {
          updatedBag = prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: targetQty, product } : item
          );
        } else {
          updatedBag = [...prev, { productId: product.id, product, quantity: quantityToAdd }];
        }
        return updatedBag;
      });

      sendBagEvent('ADD_TO_BAG', product, quantityToAdd);
      showNotification(`Added ${product.name} to your bag ✦`);
      setIsBagOpen(true);
    },
    [sendBagEvent, showNotification]
  );

  // Update Bag Quantity
  const updateBagQuantity = useCallback(
    (productId: string, delta: number) => {
      setBag((prev) => {
        const item = prev.find((i) => i.productId === productId);
        if (!item) return prev;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          sendBagEvent('REMOVE_FROM_BAG', item.product, 0);
          return prev.filter((i) => i.productId !== productId);
        }

        if (newQty > item.product.quantity) {
          showNotification(`Max available stock for this piece is ${item.product.quantity}`);
          return prev;
        }

        sendBagEvent('UPDATE_QUANTITY', item.product, newQty);
        return prev.map((i) => (i.productId === productId ? { ...i, quantity: newQty } : i));
      });
    },
    [sendBagEvent, showNotification]
  );

  // Remove from Bag
  const removeFromBag = useCallback(
    (productId: string) => {
      setBag((prev) => {
        const item = prev.find((i) => i.productId === productId);
        if (item) {
          sendBagEvent('REMOVE_FROM_BAG', item.product, 0);
        }
        return prev.filter((i) => i.productId !== productId);
      });
    },
    [sendBagEvent]
  );

  const clearBag = useCallback(() => {
    setBag([]);
    setAppliedCoupon(null);
  }, []);

  // Validate and Apply Coupon (Optional)
  const applyCoupon = useCallback(
    async (code: string) => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/coupons/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.trim(), bagSubtotal })
        });
        const data = await res.json();
        if (data.valid) {
          setAppliedCoupon({
            coupon: data.coupon,
            discountAmount: data.discountAmount
          });
          showNotification(data.message);
          return { success: true, message: data.message };
        } else {
          return { success: false, message: data.message };
        }
      } catch (err: any) {
        return { success: false, message: 'Failed to validate coupon code' };
      }
    },
    [bagSubtotal, showNotification]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showNotification('Discount coupon removed.');
  }, [showNotification]);

  // Checkout order with Tracking Code generation and persistence
  const checkout = useCallback(
    async (customerData: {
      name: string;
      phone: string;
      address: string;
      addressDetails?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
      };
      paymentMode: 'COD' | 'UPI' | 'WHATSAPP';
    }) => {
      try {
        const items = bag.map((item) => ({
          productId: item.productId,
          title: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          imageUrl: item.product.imageUrl
        }));

        const res = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerData.name,
            customerPhone: customerData.phone,
            address: customerData.address,
            addressDetails: customerData.addressDetails,
            paymentMode: customerData.paymentMode,
            items,
            couponCode: appliedCoupon?.coupon.code || null,
            subtotal: bagSubtotal,
            discount: discountAmount,
            finalTotal
          })
        });

        const data = await res.json();
        if (data.success && data.data) {
          const newOrder: Order = data.data;
          setActiveOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          clearBag();
          return {
            success: true,
            order: newOrder,
            trackingCode: newOrder.trackingCode,
            whatsAppUrl: data.whatsAppUrl,
            message: 'Order placed successfully!'
          };
        } else {
          return {
            success: false,
            message: data.message || 'Failed to place order'
          };
        }
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Network error placing order'
        };
      }
    },
    [bag, appliedCoupon, bagSubtotal, discountAmount, finalTotal, clearBag]
  );

  // Track Order by Tracking Code or Phone
  const trackOrder = useCallback(async (query: string) => {
    if (!query || !query.trim()) {
      setTrackingError('Please enter a valid Tracking Code (TLX-XXXXXX) or 10-digit phone number.');
      return { success: false, message: 'Empty query' };
    }

    setIsTrackingLoading(true);
    setTrackingError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/track/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setIsTrackingLoading(false);

      if (data.success && data.data) {
        setSearchedOrder(data.data);
        return { success: true, data: data.data, message: 'Order found' };
      } else {
        setSearchedOrder(null);
        setTrackingError(data.message || 'No order found with this tracking code or phone number.');
        return { success: false, message: data.message };
      }
    } catch (err: any) {
      setIsTrackingLoading(false);
      setTrackingError('Network error checking order status.');
      return { success: false, message: err.message };
    }
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        highlights,
        collaborations,
        coupons,
        bag,
        isBagOpen,
        appliedCoupon,
        activeCategory,
        searchQuery,
        sortBy,
        loading,
        notification,
        activeOrders,
        isTrackingModalOpen,
        searchedOrder,
        trackingError,
        isTrackingLoading,
        setIsBagOpen,
        setActiveCategory,
        setSearchQuery,
        setSortBy,
        addToBag,
        updateBagQuantity,
        removeFromBag,
        clearBag,
        applyCoupon,
        removeCoupon,
        checkout,
        trackOrder,
        setIsTrackingModalOpen,
        setSearchedOrder,
        bagSubtotal,
        discountAmount,
        finalTotal,
        bagCount
      }}
    >
      {children}
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-espresso border border-gold/40 text-ivory text-sm font-medium shadow-2xl flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
          <span>{notification}</span>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
