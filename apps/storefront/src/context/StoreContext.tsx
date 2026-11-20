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
  settings: StoreSettings;
  deliveryFee: number;
  payableTotal: number;
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
    upiTransactionRef?: string;
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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
    maxUses: 1000
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
    maxUses: 500
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
    maxUses: 100
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
    maxUses: 1000
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
    maxUses: 1000
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [highlights, setHighlights] = useState<Highlight[]>(INITIAL_HIGHLIGHTS);
  const [collaborations, setCollaborations] = useState<Collaboration[]>(INITIAL_COLLABORATIONS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [bag, setBag] = useState<BagItem[]>(() => {
    try {
      const saved = localStorage.getItem('tlx_customer_bag_v1') || localStorage.getItem('tl_bag');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(() => {
    try {
      const saved = localStorage.getItem('tlx_customer_coupon_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(false);
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

  // Persistent guest device session ID
  const sessionId = useMemo(() => {
    let id = localStorage.getItem('tlx_device_session_id') || localStorage.getItem('tl_session_id');
    if (!id) {
      id = `tlx-guest-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('tlx_device_session_id', id);
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

  // Multi-tab BroadcastChannel & Storage Sync
  const bagBroadcastRef = React.useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('tara-luxe-bag-sync');
      bagBroadcastRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'TLX_BAG_SYNC') {
          if (Array.isArray(event.data.bag)) {
            setBag(event.data.bag);
          }
          if (event.data.appliedCoupon !== undefined) {
            setAppliedCoupon(event.data.appliedCoupon);
          }
        }
      };

      return () => {
        channel.close();
        bagBroadcastRef.current = null;
      };
    }
  }, []);

  // Cross-tab storage event listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tlx_customer_bag_v1' || e.key === 'tl_bag') {
        try {
          if (e.newValue) setBag(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'tlx_customer_coupon_v1') {
        try {
          setAppliedCoupon(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save bag to local storage & broadcast to other tabs
  useEffect(() => {
    try {
      localStorage.setItem('tlx_customer_bag_v1', JSON.stringify(bag));
      localStorage.setItem('tl_bag', JSON.stringify(bag));
      bagBroadcastRef.current?.postMessage({
        type: 'TLX_BAG_SYNC',
        bag,
        appliedCoupon
      });
    } catch {}
  }, [bag, appliedCoupon]);

  // Save applied coupon to local storage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('tlx_customer_coupon_v1', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('tlx_customer_coupon_v1');
      }
    } catch {}
  }, [appliedCoupon]);

  // Save active orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem('tlx_active_orders', JSON.stringify(activeOrders));
    } catch {}
  }, [activeOrders]);

  // Real-Time /api/sync Polling Engine (Every 2.5s + on focus/visibility)
  const fetchSyncData = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync?_t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && (data.success || data.ok || Array.isArray(data.products))) {
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);

          // Real-time stock & details reconciliation for bag items
          setBag((prevBag) =>
            prevBag.map((item) => {
              const latest = data.products.find((p: Product) => p.id === item.productId);
              if (latest) {
                return { ...item, product: latest };
              }
              return item;
            })
          );
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
        if (Array.isArray(data.highlights) && data.highlights.length > 0) setHighlights(data.highlights);
        if (Array.isArray(data.collaborations) && data.collaborations.length > 0) setCollaborations(data.collaborations);
        if (Array.isArray(data.coupons) && data.coupons.length > 0) {
          setCoupons(data.coupons);
          // Revalidate applied coupon
          setAppliedCoupon((curr) => {
            if (!curr) return null;
            const match = data.coupons.find((c: Coupon) => c.code === curr.coupon.code);
            if (!match || !match.active) return null;
            return { ...curr, coupon: match };
          });
        }
        if (Array.isArray(data.orders)) {
          setActiveOrders((currOrders) =>
            currOrders.map((o) => {
              const match = data.orders.find((ord: Order) => ord.id === o.id || ord.trackingCode === o.trackingCode);
              return match || o;
            })
          );
        }
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      }
    } catch (err) {
      console.warn('[Storefront] Sync fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Periodic 2.5s Sync Polling
  useEffect(() => {
    fetchSyncData();
    const timer = setInterval(fetchSyncData, 2500);

    const onFocus = () => fetchSyncData();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchSyncData();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    // If running on localhost, attach SSE for local push events
    let eventSource: EventSource | null = null;
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocal) {
      try {
        eventSource = new EventSource(`${BACKEND_URL}/api/stream`);
        eventSource.onmessage = () => {
          fetchSyncData();
        };
      } catch {}
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      if (eventSource) eventSource.close();
    };
  }, [fetchSyncData]);

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

  const deliveryFee = useMemo(() => {
    const threshold = Number(settings.freeDeliveryAbove) || 999;
    const baseFee = Number(settings.defaultDeliveryFee) || 0;
    if (bagSubtotal - discountAmount >= threshold) return 0;
    return baseFee;
  }, [bagSubtotal, discountAmount, settings]);

  const payableTotal = useMemo(() => {
    return Math.max(0, bagSubtotal - discountAmount + deliveryFee);
  }, [bagSubtotal, discountAmount, deliveryFee]);

  const finalTotal = payableTotal;

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
      upiTransactionRef?: string;
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
            deliveryFee,
            extraDeliveryFee: 0,
            deliveryFeeStatus: deliveryFee === 0 ? 'FREE' : (customerData.paymentMode === 'COD' ? 'DUE_ON_COD' : 'PENDING_CONFIRMATION'),
            deliveryFeeNote: deliveryFee === 0 ? 'Free standard delivery' : (settings.deliveryNote || ''),
            upiTransactionRef: customerData.upiTransactionRef || '',
            payableTotal,
            finalTotal: payableTotal
          })
        });

        const data = await res.json();
        if (data.success && (data.data || data.order)) {
          const newOrder: Order = data.data || data.order;
          setActiveOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          clearBag();
          return {
            success: true,
            order: newOrder,
            trackingCode: newOrder.trackingCode,
            whatsAppUrl: data.whatsAppUrl || newOrder.whatsAppUrl,
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
    [bag, appliedCoupon, bagSubtotal, discountAmount, deliveryFee, payableTotal, settings, clearBag]
  );

  // Track Order by Tracking Code or Phone (Never fails with 404)
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

      if (data && (data.found || (data.success && (data.data || (Array.isArray(data.orders) && data.orders.length > 0))))) {
        const orderData: Order = data.data || (Array.isArray(data.orders) && data.orders[0]);
        if (orderData) {
          setSearchedOrder(orderData);
          setActiveOrders((prev) => [orderData, ...prev.filter((o) => o.id !== orderData.id)]);
          return { success: true, data: orderData, message: 'Order found' };
        }
      }
      setSearchedOrder(null);
      setTrackingError(data.message || 'No order found with this tracking code or phone number.');
      return { success: false, message: data.message };
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
        settings,
        deliveryFee,
        payableTotal,
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
        finalTotal: payableTotal,
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
