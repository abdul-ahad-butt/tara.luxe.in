import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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
  createdAt: string;
}

export interface BagEvent {
  id: string;
  sessionId: string;
  customerName: string;
  type: 'ADD_TO_BAG' | 'UPDATE_QUANTITY' | 'REMOVE_FROM_BAG';
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
  timestamp: string;
  archived?: boolean;
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
  archived?: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'bag' | 'order' | 'stock' | 'coupon';
  timestamp: string;
  archived?: boolean;
  read?: boolean;
}

interface AdminContextType {
  // Auth
  isAuthenticated: boolean;
  adminUser: { name: string; email: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  // Data
  products: Product[];
  categories: Category[];
  highlights: Highlight[];
  collaborations: Collaboration[];
  coupons: Coupon[];
  bagEvents: BagEvent[];
  orders: Order[];
  sseConnected: boolean;
  unreadEventsCount: number;
  alerts: AlertNotification[];

  // Notification Actions
  clearAlerts: () => Promise<void>;
  markEventsRead: () => Promise<void>;
  archiveAlert: (id: string, archived?: boolean) => Promise<boolean>;
  bulkArchiveAlerts: (ids: string[], archived?: boolean) => Promise<boolean>;
  deleteAlert: (id: string) => Promise<boolean>;
  bulkDeleteAlerts: (ids: string[]) => Promise<boolean>;

  // Product Actions
  adjustStock: (productId: string, deltaOrQuantity: number, isAbsolute?: boolean) => Promise<boolean>;
  addProduct: (productData: Partial<Product>) => Promise<boolean>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  bulkDeleteProducts: (ids: string[]) => Promise<boolean>;
  uploadImage: (file: File) => Promise<string | null>;

  // Category Actions
  addCategory: (name: string) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Highlights Actions
  createHighlight: (data: Partial<Highlight>) => Promise<boolean>;
  updateHighlight: (id: string, data: Partial<Highlight>) => Promise<boolean>;
  deleteHighlight: (id: string) => Promise<boolean>;

  // Collaborations Actions
  createCollaboration: (data: Partial<Collaboration>) => Promise<boolean>;
  updateCollaboration: (id: string, data: Partial<Collaboration>) => Promise<boolean>;
  deleteCollaboration: (id: string) => Promise<boolean>;

  // Coupon Actions
  createCoupon: (couponData: Partial<Coupon>) => Promise<boolean>;
  updateCoupon: (couponId: string, updates: Partial<Coupon>) => Promise<boolean>;
  deleteCoupon: (couponId: string) => Promise<boolean>;
  bulkDeleteCoupons: (ids: string[]) => Promise<boolean>;

  // Order Actions
  updateOrderStatus: (orderId: string, status: Order['status'], customMessage?: string) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  bulkDeleteOrders: (ids: string[]) => Promise<boolean>;
  archiveOrder: (orderId: string, archived?: boolean) => Promise<boolean>;
  bulkArchiveOrders: (ids: string[], archived?: boolean) => Promise<boolean>;

  // Bag Event Actions
  deleteBagEvent: (id: string) => Promise<boolean>;
  bulkDeleteBagEvents: (ids: string[]) => Promise<boolean>;
  archiveBagEvent: (id: string, archived?: boolean) => Promise<boolean>;
  bulkArchiveBagEvents: (ids: string[], archived?: boolean) => Promise<boolean>;

  // Real-Time Analytics Calculations
  totalInventoryCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOrdersValue: number;
  ordersByStatus: {
    pending: number;
    approved: number;
    dispatched: number;
    delivered: number;
  };
  totalBagItemsAddedToday: number;
}

const getBackendUrl = (): string => {
  // 1. import.meta.env.VITE_API_URL if set and non-empty (stripping any trailing /)
  if (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim() !== '') {
    return (import.meta.env.VITE_API_URL as string).trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('tlx_api_url');
    if (savedUrl && savedUrl.trim() !== '') return savedUrl.trim().replace(/\/+$/, '');

    const { hostname } = window.location;
    // 2. http://localhost:8787 when running locally
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return 'http://localhost:8787';
    }
    // 3. In production (*.pages.dev or any custom domain), default to dedicated Worker API
    return 'https://tara-luxe-in.taraluxe180.workers.dev';
  }
  return 'https://tara-luxe-in.taraluxe180.workers.dev';
};

const BACKEND_URL = getBackendUrl();

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('tlx_admin_token'));
  });
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const u = localStorage.getItem('tlx_admin_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [bagEvents, setBagEvents] = useState<BagEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [unreadEventsCount, setUnreadEventsCount] = useState(0);

  // Admin Login
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('tlx_admin_token', data.token);
        localStorage.setItem('tlx_admin_user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setAdminUser(data.user);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Cannot reach auth server' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tlx_admin_token');
    localStorage.removeItem('tlx_admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);
  }, []);

  // Fetch initial data
  const fetchAllData = useCallback(async () => {
    try {
      const [prodRes, catRes, hlRes, colRes, coupRes, bagRes, ordRes, notifRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/products`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/categories`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/highlights`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/collaborations`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/coupons`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/bag-events`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/orders`).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch(`${BACKEND_URL}/api/notifications`).then((r) => r.json()).catch(() => ({ data: [] }))
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (hlRes.data) setHighlights(hlRes.data);
      if (colRes.data) setCollaborations(colRes.data);
      if (coupRes.data) setCoupons(coupRes.data);
      if (bagRes.data) setBagEvents(bagRes.data);
      if (ordRes.data) setOrders(ordRes.data);
      if (notifRes.data) {
        setAlerts(notifRes.data);
        const unread = notifRes.data.filter((n: AlertNotification) => !n.read).length;
        setUnreadEventsCount(unread);
      }
    } catch (err) {
      console.error('[Admin] Initial fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Connect SSE Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      eventSource = new EventSource(`${BACKEND_URL}/api/stream`);

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const { type, data } = parsed;

          if (type === 'BAG_EVENT_CREATED') {
            setBagEvents((prev) => [data, ...prev]);
            setUnreadEventsCount((c) => c + 1);
          } else if (type === 'BAG_EVENT_UPDATED') {
            setBagEvents((prev) => prev.map((b) => (b.id === data.id ? data : b)));
          } else if (type === 'BAG_EVENT_DELETED') {
            setBagEvents((prev) => prev.filter((b) => b.id !== data.id));
          } else if (type === 'BAG_EVENTS_BULK_DELETED') {
            const set = new Set(data.ids);
            setBagEvents((prev) => prev.filter((b) => !set.has(b.id)));
          } else if (type === 'BAG_EVENTS_ARCHIVED') {
            const set = new Set(data.ids);
            setBagEvents((prev) => prev.map((b) => (set.has(b.id) ? { ...b, archived: data.archived } : b)));
          } else if (type === 'ORDER_CREATED') {
            setOrders((prev) => [data, ...prev]);
            setUnreadEventsCount((c) => c + 1);
          } else if (type === 'ORDER_STATUS_UPDATED' || type === 'ORDER_UPDATED') {
            const targetOrder = data.order || data;
            setOrders((prev) =>
              prev.map((o) => (o.id === targetOrder.id ? targetOrder : o))
            );
          } else if (type === 'ORDER_DELETED') {
            setOrders((prev) => prev.filter((o) => o.id !== data.id));
          } else if (type === 'ORDERS_BULK_DELETED') {
            const set = new Set(data.ids);
            setOrders((prev) => prev.filter((o) => !set.has(o.id)));
          } else if (type === 'ORDERS_ARCHIVED') {
            const set = new Set(data.ids);
            setOrders((prev) => prev.map((o) => (set.has(o.id) ? { ...o, archived: data.archived } : o)));
          } else if (type === 'NOTIFICATION_CREATED') {
            setAlerts((prev) => [data, ...prev]);
            setUnreadEventsCount((c) => c + 1);
          } else if (type === 'NOTIFICATION_UPDATED') {
            setAlerts((prev) => prev.map((a) => (a.id === data.id ? data : a)));
          } else if (type === 'NOTIFICATION_DELETED') {
            setAlerts((prev) => prev.filter((a) => a.id !== data.id));
          } else if (type === 'NOTIFICATIONS_BULK_DELETED') {
            const set = new Set(data.ids);
            setAlerts((prev) => prev.filter((a) => !set.has(a.id)));
          } else if (type === 'NOTIFICATIONS_ARCHIVED') {
            const set = new Set(data.ids);
            setAlerts((prev) => prev.map((a) => (set.has(a.id) ? { ...a, archived: data.archived } : a)));
          } else if (type === 'NOTIFICATIONS_CLEARED') {
            setAlerts([]);
            setUnreadEventsCount(0);
          } else if (type === 'NOTIFICATIONS_READ') {
            setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
            setUnreadEventsCount(0);
          } else if (type === 'STOCK_ADJUSTED') {
            setProducts((prev) =>
              prev.map((p) => (p.id === data.productId ? { ...p, quantity: data.quantity } : p))
            );
          } else if (type === 'PRODUCT_CREATED') {
            setProducts((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
          } else if (type === 'PRODUCT_UPDATED') {
            setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
          } else if (type === 'PRODUCT_DELETED') {
            setProducts((prev) => prev.filter((p) => p.id !== data.productId));
          } else if (type === 'PRODUCTS_BULK_DELETED') {
            const set = new Set(data.ids);
            setProducts((prev) => prev.filter((p) => !set.has(p.id)));
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
                const updated = [...prev];
                updated[idx] = data;
                return updated;
              }
              return [data, ...prev];
            });
          } else if (type === 'COUPON_DELETED') {
            setCoupons((prev) => prev.filter((c) => c.id !== data.couponId));
          }
        } catch (err) {
          console.error('[Admin SSE Parse Error]:', err);
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
        if (eventSource) eventSource.close();
        reconnectTimer = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // --- Notification Actions ---
  const markEventsRead = useCallback(async () => {
    setUnreadEventsCount(0);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    await fetch(`${BACKEND_URL}/api/notifications/mark-read`, { method: 'POST' }).catch(() => {});
  }, []);

  const clearAlerts = useCallback(async () => {
    setAlerts([]);
    setUnreadEventsCount(0);
    await fetch(`${BACKEND_URL}/api/notifications`, { method: 'DELETE' }).catch(() => {});
  }, []);

  const archiveAlert = useCallback(async (id: string, archived = true) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, archived } : a)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkArchiveAlerts = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setAlerts((prev) => prev.map((a) => (set.has(a.id) ? { ...a, archived } : a)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkDeleteAlerts = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setAlerts((prev) => prev.filter((a) => !set.has(a.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Product Actions ---
  const adjustStock = useCallback(async (productId: string, deltaOrQuantity: number, isAbsolute = false) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isAbsolute ? { quantity: deltaOrQuantity } : { delta: deltaOrQuantity })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const addProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkDeleteProducts = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setProducts((prev) => prev.filter((p) => !set.has(p.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      return data.success ? data.url : null;
    } catch {
      return null;
    }
  }, []);

  // --- Category Actions ---
  const addCategory = useCallback(async (name: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Highlights Actions ---
  const createHighlight = useCallback(async (data: Partial<Highlight>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const updateHighlight = useCallback(async (id: string, data: Partial<Highlight>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteHighlight = useCallback(async (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Collaborations Actions ---
  const createCollaboration = useCallback(async (data: Partial<Collaboration>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const updateCollaboration = useCallback(async (id: string, data: Partial<Collaboration>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteCollaboration = useCallback(async (id: string) => {
    setCollaborations((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Coupon Actions ---
  const createCoupon = useCallback(async (couponData: Partial<Coupon>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const updateCoupon = useCallback(async (couponId: string, updates: Partial<Coupon>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteCoupon = useCallback(async (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons/${couponId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkDeleteCoupons = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setCoupons((prev) => prev.filter((c) => !set.has(c.id)));
    for (const id of ids) {
      await fetch(`${BACKEND_URL}/api/coupons/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    return true;
  }, []);

  // --- Order Actions ---
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], customMessage?: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusMessage: customMessage })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkDeleteOrders = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setOrders((prev) => prev.filter((o) => !set.has(o.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const archiveOrder = useCallback(async (orderId: string, archived = true) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived } : o)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkArchiveOrders = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setOrders((prev) => prev.map((o) => (set.has(o.id) ? { ...o, archived } : o)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Bag Event Actions ---
  const deleteBagEvent = useCallback(async (id: string) => {
    setBagEvents((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkDeleteBagEvents = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setBagEvents((prev) => prev.filter((b) => !set.has(b.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const archiveBagEvent = useCallback(async (id: string, archived = true) => {
    setBagEvents((prev) => prev.map((b) => (b.id === id ? { ...b, archived } : b)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  const bulkArchiveBagEvents = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setBagEvents((prev) => prev.map((b) => (set.has(b.id) ? { ...b, archived } : b)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  // --- Analytics Calculations ---
  const totalInventoryCount = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.quantity > 0 && p.quantity <= 5).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.quantity <= 0).length;
  }, [products]);

  const totalOrdersValue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.finalTotal || 0), 0);
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const res = { pending: 0, approved: 0, dispatched: 0, delivered: 0 };
    orders.forEach((o) => {
      const st = o.status.toLowerCase();
      if (st.includes('pend')) res.pending++;
      else if (st.includes('appr') || st.includes('conf')) res.approved++;
      else if (st.includes('disp')) res.dispatched++;
      else if (st.includes('deliv')) res.delivered++;
    });
    return res;
  }, [orders]);

  const totalBagItemsAddedToday = useMemo(() => {
    return bagEvents.reduce((acc, b) => acc + (b.quantity || 1), 0);
  }, [bagEvents]);

  const value = {
    isAuthenticated,
    adminUser,
    login,
    logout,
    products,
    categories,
    highlights,
    collaborations,
    coupons,
    bagEvents,
    orders,
    sseConnected,
    unreadEventsCount,
    alerts,
    clearAlerts,
    markEventsRead,
    archiveAlert,
    bulkArchiveAlerts,
    deleteAlert,
    bulkDeleteAlerts,
    adjustStock,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    uploadImage,
    addCategory,
    deleteCategory,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    createCollaboration,
    updateCollaboration,
    deleteCollaboration,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    bulkDeleteCoupons,
    updateOrderStatus,
    deleteOrder,
    bulkDeleteOrders,
    archiveOrder,
    bulkArchiveOrders,
    deleteBagEvent,
    bulkDeleteBagEvents,
    archiveBagEvent,
    bulkArchiveBagEvents,
    totalInventoryCount,
    lowStockCount,
    outOfStockCount,
    totalOrdersValue,
    ordersByStatus,
    totalBagItemsAddedToday
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminRealtimeProvider');
  }
  return context;
};
