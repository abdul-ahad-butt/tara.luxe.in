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
  payableTotal?: number;
  deliveryFee?: number;
  extraDeliveryFee?: number;
  deliveryFeeStatus?: 'FREE' | 'PAID' | 'DUE_ON_COD' | 'PENDING_CONFIRMATION';
  deliveryFeeNote?: string;
  upiTransactionRef?: string;
  status: 'Pending' | 'Approved' | 'Dispatched' | 'Delivered';
  statusMessage?: string;
  whatsAppUrl: string;
  createdAt: string;
  updatedAt?: string;
  archived?: boolean;
}

export interface StoreSettings {
  codEnabled: boolean;
  upiEnabled: boolean;
  whatsappEnabled: boolean;
  defaultDeliveryFee: number;
  freeDeliveryAbove: number;
  deliveryNote: string;
  upiId: string;
  upiPayeeName: string;
  upiQrImageUrl: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  whatsappNumber: string;
  whatsappMessagePrefix: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  codEnabled: true,
  upiEnabled: true,
  whatsappEnabled: true,
  defaultDeliveryFee: 0,
  freeDeliveryAbove: 999,
  deliveryNote: 'Free festive delivery on standard orders. Out-of-zone or express COD orders may include an extra delivery charge confirmed during Pending review.',
  upiId: 'taraluxe@upi',
  upiPayeeName: 'Tara Luxe Anti-Tarnish Jewellery',
  upiQrImageUrl: '',
  bankName: '',
  bankAccountName: 'Tara Luxe',
  bankAccountNumber: '',
  bankIfsc: '',
  whatsappNumber: '917871501939',
  whatsappMessagePrefix: 'Hi Tara Luxe! I just placed an order on your website:'
};

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
  updateOrderDelivery: (orderId: string, deliveryData: { extraDeliveryFee: number; deliveryFeeStatus: Order['deliveryFeeStatus']; deliveryFeeNote: string }) => Promise<boolean>;
  deleteOrder: (orderId: string) => Promise<boolean>;
  bulkDeleteOrders: (ids: string[]) => Promise<boolean>;
  archiveOrder: (orderId: string, archived?: boolean) => Promise<boolean>;
  bulkArchiveOrders: (ids: string[], archived?: boolean) => Promise<boolean>;

  // Store Settings (Payments, Delivery, Bank, WhatsApp)
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;

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

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'tl-prod-kundan-choker',
    name: 'Royal Heritage 18k Gold Kundan Choker',
    category: 'Anti-Tarnish Necklaces',
    description: 'Handcrafted with 316L surgical steel core and 18k PVD gold leaf finish. 100% waterproof and hypoallergenic statement luxury piece.',
    price: 1299,
    compareAtPrice: 1999,
    quantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    badge: 'Heritage Suite',
    specs: [
      '18k PVD Gold Leaf Finish',
      '316L Medical Grade Surgical Steel',
      '100% Waterproof & Sweatproof',
      'Hypoallergenic Intricate Setting'
    ],
    createdAt: '2026-11-13T15:54:03.158Z'
  },
  {
    id: 'tl-hamper-mini',
    name: 'Signature "தாRA HAMPER" — Mini Edition',
    category: 'Tara Hampers',
    description: 'Traditional Elegance, Beautifully Packed. Includes 1 Designer Festive Saree + Matching Glass/Gold-Toned Bangles + Accron Bindi Pack in curated gift packaging.',
    price: 999,
    compareAtPrice: 1499,
    quantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    badge: 'Signature Hamper',
    specs: [
      '1 Designer Festive Saree (Silk-blend)',
      'Matching Glass & Gold-Toned Bangles',
      'Accron Traditional Bindi Pack',
      'Curated Tara Luxe Keepsake Box'
    ],
    createdAt: '2026-11-13T14:13:25.219Z'
  },
  {
    id: 'tl-hamper-charcoal-yellow',
    name: 'Signature "தாRA HAMPER" — Classic Charcoal & Yellow Floral Set',
    category: 'Tara Hampers',
    description: 'Complete festive gifting hamper featuring our signature Charcoal Grey & Yellow Floral Motif Saree + Matching Yellow Bangles + Accron Bindi Pack + 18k Gold-Plated Jhumka Earrings + Anti-Tarnish Necklace.',
    price: 1499,
    compareAtPrice: 2199,
    quantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    badge: 'Bestseller Hamper',
    specs: [
      'Charcoal & Yellow Floral Saree',
      'Coordinated Velvet & Brass Bangles',
      'Accron Bindi Pack',
      '18k Gold-Plated Jhumka Earrings',
      'Anti-Tarnish 316L Delicate Necklace'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-hamper-parrot-green',
    name: 'Signature "தாRA HAMPER" — Classic Parrot Green Festive Set',
    category: 'Tara Hampers',
    description: 'Vibrant Parrot Green Festive Saree paired with coordinated Bangles, Accron Bindi Pack, 18k Gold-Plated Necklace, and Traditional Jhumka Earrings. Ideal for Weddings, Engagements & Festive Gifting.',
    price: 1499,
    compareAtPrice: 2199,
    quantity: 10,
    imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80',
    badge: 'Festive Favorite',
    specs: [
      'Parrot Green Woven Festive Saree',
      'Matching Glass Chudi Bangles',
      'Accron Traditional Bindi Sheet',
      '18k Gold Plated Statement Necklace',
      'Matching Jhumka Drops'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-hamper-grand-royal',
    name: 'Signature "தாRA HAMPER" — Grand Royal Suite',
    category: 'Tara Hampers',
    description: 'Our flagship luxury gift hamper for Weddings, Baby Showers, Puberty Functions, Housewarming & Birthdays. Features a Premium Silk-Blend Saree, Complete 18k Gold-Plated Anti-Tarnish Jewellery Suite, Korean Accessories accent, and Rigid Keepsake Gift Box.',
    price: 1999,
    compareAtPrice: 2999,
    quantity: 8,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    badge: 'Grand Luxury',
    specs: [
      'Premium Woven Silk-Blend Rich Saree',
      'Complete 18k Gold Plated Suite (Necklace + Earrings + Bracelet)',
      'Korean Aesthetic Hair Claw (@aztheticlyf)',
      'Handcrafted Rigid Golden Keepsake Box',
      'Complimentary Greeting Card & Ribbon'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-necklace-clover',
    name: 'Celestial 18k Gold-Plated Clover Chain Necklace',
    category: 'Anti-Tarnish Necklaces',
    description: 'Crafted from medical-grade 316L Stainless Steel with thick 18k PVD Gold Plating. 100% waterproof, sweatproof, hypoallergenic, and guaranteed anti-tarnish for everyday luxury wear.',
    price: 699,
    compareAtPrice: 1199,
    quantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    badge: '18k PVD Gold',
    specs: [
      '316L Medical Grade Surgical Steel',
      'Real 18k Vacuum PVD Gold Plating',
      '100% Waterproof & Sweatproof',
      '40cm + 5cm Adjustable Extender Chain'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-earrings-hoops',
    name: 'Lumière Waterproof 316L Twisted Gold Hoops',
    category: '18k Gold Earrings',
    description: 'Featherlight sculpted 18k gold-plated chunky twisted hoops on a 316L stainless steel core. Tarnish-free brilliance that outlasts ordinary fashion jewellery.',
    price: 549,
    compareAtPrice: 899,
    quantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    badge: 'Waterproof 316L',
    specs: [
      '316L Stainless Steel Core',
      'Thick 18k Vacuum Gold Plated',
      'Snap-bar Closure',
      'Weight: 4.8g per hoop'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-bracelet-cuff',
    name: 'Versailles Anti-Tarnish Cuff Bracelet',
    category: 'Bracelets & Bangles',
    description: 'Mirror-polished 18k gold-plated cuff bracelet engineered in 316L surgical steel. Scratch-resistant, waterproof, and stackable for daily opulence.',
    price: 799,
    compareAtPrice: 1299,
    quantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    badge: 'Scratch-Resistant',
    specs: [
      '316L Surgical Grade Steel',
      'Micro-Etched Roman Numeral Accents',
      'Oval Wrist Contour (58mm Diameter)',
      '100% Anti-Tarnish Guaranteed'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'tl-korean-claw',
    name: 'Seoul Muse Pearl & Gold Butterfly Hair Claw — @aztheticlyf Edit',
    category: 'Korean Accessories',
    description: 'Curated from our sister label @aztheticlyf. High-tension gold alloy hair claw accented with luminous freshwater-style pearls for Korean glass-hair aesthetics.',
    price: 399,
    compareAtPrice: 649,
    quantity: 22,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    badge: '@aztheticlyf Edit',
    specs: [
      'Curated Korean Accessory (@aztheticlyf)',
      'Reinforced Metal Spring Tension',
      'Faux Baroque Freshwater Pearls',
      'Zero Hair Snagging Design'
    ],
    createdAt: '2026-11-13T14:13:25.220Z'
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-hampers', name: 'Tara Hampers', createdAt: '2026-11-13T17:16:57.291Z' },
  { id: 'cat-necklaces', name: 'Anti-Tarnish Necklaces', createdAt: '2026-11-13T17:16:57.291Z' },
  { id: 'cat-earrings', name: '18k Gold Earrings', createdAt: '2026-11-13T17:16:57.291Z' },
  { id: 'cat-bracelets', name: 'Bracelets & Bangles', createdAt: '2026-11-13T17:16:57.291Z' },
  { id: 'cat-korean', name: 'Korean Accessories', createdAt: '2026-11-13T17:16:57.291Z' }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-taraluxe10',
    code: 'TARALUXE10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: 499,
    active: true,
    description: 'Welcome 10% off on 18k Anti-Tarnish Jewellery',
    usageCount: 18,
    maxUses: 1000,
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'coup-hamper200',
    code: 'HAMPER200',
    type: 'FLAT',
    value: 200,
    minOrderAmount: 1499,
    active: true,
    description: '₹200 instant discount on Classic & Grand தாRA Hampers',
    usageCount: 8,
    maxUses: 500,
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'coup-wholesale25',
    code: 'WHOLESALE25',
    type: 'PERCENTAGE',
    value: 25,
    minOrderAmount: 4999,
    active: true,
    description: 'Wholesale & bulk order tier discount',
    usageCount: 3,
    maxUses: 100,
    createdAt: '2026-11-13T14:13:25.220Z'
  },
  {
    id: 'coup-festive15',
    code: 'FESTIVE15',
    type: 'PERCENTAGE',
    value: 15,
    minOrderAmount: 1000,
    active: true,
    description: 'Festive 15% discount on orders above ₹1,000',
    usageCount: 0,
    maxUses: 1000,
    createdAt: '2026-11-13T15:54:03.598Z'
  },
  {
    id: 'coup-abc',
    code: 'ABC',
    type: 'PERCENTAGE',
    value: 20,
    minOrderAmount: 1000,
    active: true,
    description: 'Exclusive 20% off on 18k Anti-Tarnish pieces',
    usageCount: 0,
    maxUses: 1000,
    createdAt: '2026-11-19T00:00:00.000Z'
  }
];

const INITIAL_HIGHLIGHTS: Highlight[] = [
  {
    id: 'highlight-reviews',
    title: 'Reviews✨',
    iconText: '⭐',
    category: 'Customer Love',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
    caption: '"Wore my clover necklace for 3 weeks straight including beach baths and gym—literally 0% tarnish! My friends thought it was pure solid gold." — Divya K., Chennai',
    tag: '5.0 ★★★★★ Verified Customer',
    createdAt: '2026-11-13T17:16:57.291Z'
  },
  {
    id: 'highlight-orders',
    title: 'Orders✨',
    iconText: '📦',
    category: 'Daily Dispatch',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    caption: 'Over 850+ festive தாRA Hampers and anti-tarnish parcels packed and dispatched across India this week! Every order includes our rigid keepsake box.',
    tag: 'Dispatched in 24 Hours',
    createdAt: '2026-11-13T17:16:57.291Z'
  },
  {
    id: 'highlight-product',
    title: 'Product✨',
    iconText: '💎',
    category: 'Macro Brilliance',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    caption: 'Water droplets on 18k PVD Vacuum Gold Plating. Notice the mirror reflection and zero oxidation under medical 316L testing.',
    tag: '316L Waterproof Macro',
    createdAt: '2026-11-13T17:16:57.291Z'
  },
  {
    id: 'highlight-collab',
    title: 'Collab✨',
    iconText: '🎁',
    category: '@aztheticlyf PR Campaign',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    caption: '✦ OFFICIAL PR CAMPAIGN with sister label @aztheticlyf ✦\nPost any Reel from our page & tag @tara.luxe.in in your story to get your complimentary PR package! DM us on WhatsApp or Instagram after tagging.',
    tag: 'Win a Free PR Package',
    createdAt: '2026-11-13T17:16:57.291Z'
  }
];

const INITIAL_COLLABORATIONS: Collaboration[] = [
  {
    id: 'collab-divya',
    creatorName: 'Divya Sundaram',
    handle: '@divya_azthetics',
    profileUrl: 'https://www.instagram.com/tara.luxe.in/',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    featuredItem: 'Celestial Clover Chain & Pearl Claw',
    quote: 'Obsessed with how durable these pieces are! Wore them during my beach getaway in Goa—zero fading, pure 18k shine.',
    date: 'November 2026',
    createdAt: '2026-11-13T17:16:57.291Z'
  },
  {
    id: 'collab-sneha',
    creatorName: 'Sneha Reddy',
    handle: '@sneha.glow',
    profileUrl: 'https://www.instagram.com/tara.luxe.in/',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    featuredItem: 'தாRA HAMPER — Grand Royal Suite',
    quote: 'Unboxed the Grand Royal தாRA Hamper for my sister’s engagement. The silk saree + full 18k anti-tarnish suite had all our guests asking where it was from!',
    date: 'October 2026',
    createdAt: '2026-11-13T17:16:57.291Z'
  },
  {
    id: 'collab-rhea',
    creatorName: 'Rhea Malhotra',
    handle: '@rhea.looks',
    profileUrl: 'https://www.instagram.com/tara.luxe.in/',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    featuredItem: 'Lumière Twisted Hoops & Versailles Cuff',
    quote: 'Finally everyday jewellery that doesn’t turn my neck or wrists green. 316L surgical steel is a total game changer.',
    date: 'September 2026',
    createdAt: '2026-11-13T17:16:57.291Z'
  }
];

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

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [highlights, setHighlights] = useState<Highlight[]>(INITIAL_HIGHLIGHTS);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(INITIAL_COLLABORATIONS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [bagEvents, setBagEvents] = useState<BagEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [sseConnected, setSseConnected] = useState(true);
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

  // Real-Time /api/sync Polling Engine (Zero Worker timeout errors, sub-2.5s live sync)
  const consecutiveFailuresRef = React.useRef(0);

  const fetchSyncData = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && (data.success || data.ok || Array.isArray(data.products))) {
        consecutiveFailuresRef.current = 0;
        setSseConnected(true);

        if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.highlights) && data.highlights.length > 0) setHighlights(data.highlights);
        if (Array.isArray(data.collaborations) && data.collaborations.length > 0) setCollaborations(data.collaborations);
        if (Array.isArray(data.coupons) && data.coupons.length > 0) setCoupons(data.coupons);
        if (Array.isArray(data.bagEvents)) setBagEvents(data.bagEvents);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (data.settings) setSettings(data.settings);
        if (Array.isArray(data.notifications)) {
          setAlerts(data.notifications);
          const unread = data.notifications.filter((n: AlertNotification) => !n.read).length;
          setUnreadEventsCount(unread);
        }
      }
    } catch {
      consecutiveFailuresRef.current += 1;
      if (consecutiveFailuresRef.current >= 4) {
        setSseConnected(false);
      }
    }
  }, []);

  // Periodic 2.5-second live sync polling + window focus & visibility triggers
  useEffect(() => {
    fetchSyncData();
    const intervalTimer = setInterval(fetchSyncData, 2500);

    const onFocus = () => fetchSyncData();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchSyncData();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    // If running in local development, also attach SSE stream for instant local pushes
    let eventSource: EventSource | null = null;
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocal) {
      try {
        eventSource = new EventSource(`${BACKEND_URL}/api/stream`);
        eventSource.onopen = () => setSseConnected(true);
        eventSource.onmessage = () => {
          fetchSyncData();
        };
      } catch {}
    }

    return () => {
      clearInterval(intervalTimer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      if (eventSource) eventSource.close();
    };
  }, [fetchSyncData]);

  // --- Notification Actions ---
  const markEventsRead = useCallback(async () => {
    setUnreadEventsCount(0);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    await fetch(`${BACKEND_URL}/api/notifications/mark-read`, { method: 'POST' }).catch(() => {});
    fetchSyncData();
  }, [fetchSyncData]);

  const clearAlerts = useCallback(async () => {
    setAlerts([]);
    setUnreadEventsCount(0);
    await fetch(`${BACKEND_URL}/api/notifications`, { method: 'DELETE' }).catch(() => {});
    fetchSyncData();
  }, [fetchSyncData]);

  const archiveAlert = useCallback(async (id: string, archived = true) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, archived } : a)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkArchiveAlerts = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setAlerts((prev) => prev.map((a) => (set.has(a.id) ? { ...a, archived } : a)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const deleteAlert = useCallback(async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkDeleteAlerts = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setAlerts((prev) => prev.filter((a) => !set.has(a.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  // --- Product Actions ---
  const adjustStock = useCallback(async (productId: string, deltaOrQuantity: number, isAbsolute = false) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isAbsolute ? { quantity: deltaOrQuantity } : { delta: deltaOrQuantity })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const addProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkDeleteProducts = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setProducts((prev) => prev.filter((p) => !set.has(p.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/products/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

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
      if (data.success) fetchSyncData();
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  }, [fetchSyncData]);

  const deleteCategory = useCallback(async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  // --- Highlights Actions ---
  const createHighlight = useCallback(async (data: Partial<Highlight>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateHighlight = useCallback(async (id: string, data: Partial<Highlight>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const deleteHighlight = useCallback(async (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/highlights/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  // --- Collaborations Actions ---
  const createCollaboration = useCallback(async (data: Partial<Collaboration>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateCollaboration = useCallback(async (id: string, data: Partial<Collaboration>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const deleteCollaboration = useCallback(async (id: string) => {
    setCollaborations((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/collaborations/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  // --- Coupon Actions ---
  const createCoupon = useCallback(async (couponData: Partial<Coupon>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateCoupon = useCallback(async (couponId: string, updates: Partial<Coupon>) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const deleteCoupon = useCallback(async (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/coupons/${couponId}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkDeleteCoupons = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setCoupons((prev) => prev.filter((c) => !set.has(c.id)));
    for (const id of ids) {
      await fetch(`${BACKEND_URL}/api/coupons/${id}`, { method: 'DELETE' }).catch(() => {});
    }
    fetchSyncData();
    return true;
  }, [fetchSyncData]);

  // --- Order Actions ---
  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status'], customMessage?: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, statusMessage: customMessage })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateOrderDelivery = useCallback(async (orderId: string, deliveryData: { extraDeliveryFee: number; deliveryFeeStatus: Order['deliveryFeeStatus']; deliveryFeeNote: string }) => {
    try {
      setOrders((prev) => prev.map((o) => {
        if (o.id === orderId) {
          const payableTotal = Math.max(0, (o.subtotal || 0) - (o.discount || 0) + (o.deliveryFee || 0) + Number(deliveryData.extraDeliveryFee || 0));
          return {
            ...o,
            ...deliveryData,
            payableTotal,
            finalTotal: payableTotal,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      }));

      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData)
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const updateSettings = useCallback(async (newSettings: Partial<StoreSettings>) => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      const res = await fetch(`${BACKEND_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        fetchSyncData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [settings, fetchSyncData]);

  const deleteOrder = useCallback(async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkDeleteOrders = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setOrders((prev) => prev.filter((o) => !set.has(o.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const archiveOrder = useCallback(async (orderId: string, archived = true) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, archived } : o)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${orderId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkArchiveOrders = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setOrders((prev) => prev.map((o) => (set.has(o.id) ? { ...o, archived } : o)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  // --- Bag Event Actions ---
  const deleteBagEvent = useCallback(async (id: string) => {
    setBagEvents((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkDeleteBagEvents = useCallback(async (ids: string[]) => {
    const set = new Set(ids);
    setBagEvents((prev) => prev.filter((b) => !set.has(b.id)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const archiveBagEvent = useCallback(async (id: string, archived = true) => {
    setBagEvents((prev) => prev.map((b) => (b.id === id ? { ...b, archived } : b)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

  const bulkArchiveBagEvents = useCallback(async (ids: string[], archived = true) => {
    const set = new Set(ids);
    setBagEvents((prev) => prev.map((b) => (set.has(b.id) ? { ...b, archived } : b)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/bag-events/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, archived })
      });
      if (res.ok) fetchSyncData();
      return res.ok;
    } catch {
      return false;
    }
  }, [fetchSyncData]);

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
    updateOrderDelivery,
    deleteOrder,
    bulkDeleteOrders,
    archiveOrder,
    bulkArchiveOrders,
    settings,
    updateSettings,
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
