import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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
  trackingCode: string; // e.g. TLX-482910
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

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'bag' | 'stock' | 'coupon';
  timestamp: string;
  archived?: boolean;
  read?: boolean;
}

export interface DatabaseSchema {
  isSeeded?: boolean;
  products: Product[];
  categories: Category[];
  highlights: Highlight[];
  collaborations: Collaboration[];
  coupons: Coupon[];
  bagEvents: BagEvent[];
  orders: Order[];
  notifications?: NotificationItem[];
}

// Verified high-res working jewellery imagery
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-hampers', name: 'Tara Hampers', createdAt: new Date().toISOString() },
  { id: 'cat-necklaces', name: 'Anti-Tarnish Necklaces', createdAt: new Date().toISOString() },
  { id: 'cat-earrings', name: '18k Gold Earrings', createdAt: new Date().toISOString() },
  { id: 'cat-bracelets', name: 'Bracelets & Bangles', createdAt: new Date().toISOString() },
  { id: 'cat-korean', name: 'Korean Accessories', createdAt: new Date().toISOString() }
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
    createdAt: new Date().toISOString()
  },
  {
    id: 'highlight-orders',
    title: 'Orders✨',
    iconText: '📦',
    category: 'Daily Dispatch',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    caption: 'Over 850+ festive தாRA Hampers and anti-tarnish parcels packed and dispatched across India this week! Every order includes our rigid keepsake box.',
    tag: 'Dispatched in 24 Hours',
    createdAt: new Date().toISOString()
  },
  {
    id: 'highlight-product',
    title: 'Product✨',
    iconText: '💎',
    category: 'Macro Brilliance',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
    caption: 'Water droplets on 18k PVD Vacuum Gold Plating. Notice the mirror reflection and zero oxidation under medical 316L testing.',
    tag: '316L Waterproof Macro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'highlight-collab',
    title: 'Collab✨',
    iconText: '🎁',
    category: '@aztheticlyf PR Campaign',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    caption: '✦ OFFICIAL PR CAMPAIGN with sister label @aztheticlyf ✦\nPost any Reel from our page & tag @tara.luxe.in in your story to get your complimentary PR package! DM us on WhatsApp or Instagram after tagging.',
    tag: 'Win a Free PR Package',
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  }
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
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
    createdAt: new Date().toISOString()
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // If database was already seeded once, PRESERVE exact arrays (even if empty or modified by user)
        if (parsed.isSeeded) {
          parsed.products = Array.isArray(parsed.products) ? parsed.products : [];
          parsed.categories = Array.isArray(parsed.categories) ? parsed.categories : [];
          parsed.highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];
          parsed.collaborations = Array.isArray(parsed.collaborations) ? parsed.collaborations : [];
          parsed.coupons = Array.isArray(parsed.coupons) ? parsed.coupons : [];
          parsed.bagEvents = Array.isArray(parsed.bagEvents) ? parsed.bagEvents : [];
          parsed.orders = Array.isArray(parsed.orders) ? parsed.orders : [];
          parsed.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];
          return parsed;
        }

        // First-time seed verification
        if (parsed.products && parsed.coupons) {
          parsed.isSeeded = true;
          parsed.notifications = parsed.notifications || [];
          this.save(parsed);
          return parsed;
        }
      } catch (err) {
        console.error('Error reading db.json, re-initializing...', err);
      }
    }

    const initial: DatabaseSchema = {
      isSeeded: true,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      highlights: INITIAL_HIGHLIGHTS,
      collaborations: INITIAL_COLLABORATIONS,
      coupons: INITIAL_COUPONS,
      bagEvents: [],
      orders: [],
      notifications: [
        {
          id: 'notif-welcome',
          title: 'Tara Luxe Live System Active',
          message: 'All 3 services synchronized over real-time SSE broadcaster.',
          type: 'stock',
          timestamp: new Date().toISOString(),
          archived: false,
          read: true
        }
      ]
    };
    this.save(initial);
    return initial;
  }

  private save(data: DatabaseSchema): void {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
      this.data = data;
    } catch (err) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    }
  }

  // --- Products ---
  public getProducts(): Product[] {
    return [...this.data.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `tl-prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const products = [newProduct, ...this.data.products];
    this.save({ ...this.data, products });
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.products[index], ...updates };
    const products = [...this.data.products];
    products[index] = updated;
    this.save({ ...this.data, products });
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    const products = this.data.products.filter(p => p.id !== id);
    if (products.length === initialLen) return false;
    this.save({ ...this.data, products });
    return true;
  }

  public bulkDeleteProducts(ids: string[]): number {
    const idSet = new Set(ids);
    const initialLen = this.data.products.length;
    const products = this.data.products.filter(p => !idSet.has(p.id));
    const deletedCount = initialLen - products.length;
    if (deletedCount > 0) {
      this.save({ ...this.data, products });
    }
    return deletedCount;
  }

  public adjustStock(id: string, deltaOrQuantity: number, isAbsolute = false): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;

    const newQty = isAbsolute
      ? Math.max(0, deltaOrQuantity)
      : Math.max(0, product.quantity + deltaOrQuantity);

    return this.updateProduct(id, { quantity: newQty });
  }

  // --- Categories ---
  public getCategories(): Category[] {
    return [...this.data.categories];
  }

  public addCategory(name: string): Category {
    const newCat: Category = {
      id: `cat-${Date.now().toString(36)}`,
      name: name.trim(),
      createdAt: new Date().toISOString()
    };
    const categories = [...this.data.categories, newCat];
    this.save({ ...this.data, categories });
    return newCat;
  }

  public deleteCategory(id: string): boolean {
    const initialLen = this.data.categories.length;
    const categories = this.data.categories.filter(c => c.id !== id);
    if (categories.length === initialLen) return false;
    this.save({ ...this.data, categories });
    return true;
  }

  // --- Highlights ---
  public getHighlights(): Highlight[] {
    return [...this.data.highlights];
  }

  public addHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Highlight {
    const newHighlight: Highlight = {
      ...highlight,
      id: `highlight-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    const highlights = [...this.data.highlights, newHighlight];
    this.save({ ...this.data, highlights });
    return newHighlight;
  }

  public updateHighlight(id: string, updates: Partial<Highlight>): Highlight | null {
    const index = this.data.highlights.findIndex(h => h.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.highlights[index], ...updates };
    const highlights = [...this.data.highlights];
    highlights[index] = updated;
    this.save({ ...this.data, highlights });
    return updated;
  }

  public deleteHighlight(id: string): boolean {
    const initialLen = this.data.highlights.length;
    const highlights = this.data.highlights.filter(h => h.id !== id);
    if (highlights.length === initialLen) return false;
    this.save({ ...this.data, highlights });
    return true;
  }

  // --- Collaborations ---
  public getCollaborations(): Collaboration[] {
    return [...this.data.collaborations];
  }

  public addCollaboration(collab: Omit<Collaboration, 'id' | 'createdAt'>): Collaboration {
    const newCollab: Collaboration = {
      ...collab,
      id: `collab-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    const collaborations = [newCollab, ...this.data.collaborations];
    this.save({ ...this.data, collaborations });
    return newCollab;
  }

  public updateCollaboration(id: string, updates: Partial<Collaboration>): Collaboration | null {
    const index = this.data.collaborations.findIndex(c => c.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.collaborations[index], ...updates };
    const collaborations = [...this.data.collaborations];
    collaborations[index] = updated;
    this.save({ ...this.data, collaborations });
    return updated;
  }

  public deleteCollaboration(id: string): boolean {
    const initialLen = this.data.collaborations.length;
    const collaborations = this.data.collaborations.filter(c => c.id !== id);
    if (collaborations.length === initialLen) return false;
    this.save({ ...this.data, collaborations });
    return true;
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return [...this.data.coupons];
  }

  public getCouponById(id: string): Coupon | undefined {
    return this.data.coupons.find(c => c.id === id);
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.trim().toUpperCase() === code.trim().toUpperCase());
  }

  public addCoupon(coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      code: coupon.code.trim().toUpperCase(),
      id: `coup-${Date.now().toString(36)}`,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    const coupons = [newCoupon, ...this.data.coupons];
    this.save({ ...this.data, coupons });
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const index = this.data.coupons.findIndex(c => c.id === id);
    if (index === -1) return null;

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }
    const updated = { ...this.data.coupons[index], ...updates };
    const coupons = [...this.data.coupons];
    coupons[index] = updated;
    this.save({ ...this.data, coupons });
    return updated;
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.data.coupons.length;
    const coupons = this.data.coupons.filter(c => c.id !== id);
    if (coupons.length === initialLen) return false;
    this.save({ ...this.data, coupons });
    return true;
  }

  public bulkDeleteCoupons(ids: string[]): number {
    const idSet = new Set(ids);
    const initialLen = this.data.coupons.length;
    const coupons = this.data.coupons.filter(c => !idSet.has(c.id));
    const deletedCount = initialLen - coupons.length;
    if (deletedCount > 0) {
      this.save({ ...this.data, coupons });
    }
    return deletedCount;
  }

  public incrementCouponUsage(code: string): void {
    const coupon = this.getCouponByCode(code);
    if (coupon) {
      this.updateCoupon(coupon.id, { usageCount: (coupon.usageCount || 0) + 1 });
    }
  }

  // --- Bag Events ---
  public getBagEvents(limit = 200): BagEvent[] {
    return [...this.data.bagEvents].slice(0, limit);
  }

  public addBagEvent(event: Omit<BagEvent, 'id' | 'timestamp'>): BagEvent {
    const newEvent: BagEvent = {
      ...event,
      id: `bag-evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      archived: false
    };
    const bagEvents = [newEvent, ...this.data.bagEvents].slice(0, 300);
    this.save({ ...this.data, bagEvents });
    return newEvent;
  }

  public deleteBagEvent(id: string): boolean {
    const initialLen = this.data.bagEvents.length;
    const bagEvents = this.data.bagEvents.filter(b => b.id !== id);
    if (bagEvents.length === initialLen) return false;
    this.save({ ...this.data, bagEvents });
    return true;
  }

  public bulkDeleteBagEvents(ids: string[]): number {
    const idSet = new Set(ids);
    const initialLen = this.data.bagEvents.length;
    const bagEvents = this.data.bagEvents.filter(b => !idSet.has(b.id));
    const count = initialLen - bagEvents.length;
    if (count > 0) {
      this.save({ ...this.data, bagEvents });
    }
    return count;
  }

  public archiveBagEvent(id: string, archived = true): BagEvent | null {
    const index = this.data.bagEvents.findIndex(b => b.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.bagEvents[index], archived };
    const bagEvents = [...this.data.bagEvents];
    bagEvents[index] = updated;
    this.save({ ...this.data, bagEvents });
    return updated;
  }

  public bulkArchiveBagEvents(ids: string[], archived = true): number {
    const idSet = new Set(ids);
    let count = 0;
    const bagEvents = this.data.bagEvents.map(b => {
      if (idSet.has(b.id)) {
        count++;
        return { ...b, archived };
      }
      return b;
    });
    if (count > 0) {
      this.save({ ...this.data, bagEvents });
    }
    return count;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return [...this.data.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getOrderByTrackingOrPhone(query: string): Order | undefined {
    const clean = query.trim().toUpperCase();
    const cleanDigits = query.replace(/\D/g, '');
    return this.data.orders.find(o =>
      (o.trackingCode && o.trackingCode.toUpperCase() === clean) ||
      o.id.toUpperCase() === clean ||
      (cleanDigits.length >= 10 && o.customerPhone.replace(/\D/g, '').endsWith(cleanDigits))
    );
  }

  public addOrder(order: Omit<Order, 'id' | 'trackingCode' | 'createdAt'>): Order {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const trackingRand = Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...order,
      id: `TL-ORD-${rand}`,
      trackingCode: `TLX-${trackingRand}`,
      status: 'Pending',
      statusMessage: 'Your order request is Pending Admin Approval',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: false
    };
    const orders = [newOrder, ...this.data.orders];
    this.save({ ...this.data, orders });
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status'], customMessage?: string): Order | null {
    const index = this.data.orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    let statusMessage = customMessage || '';
    if (!statusMessage) {
      switch (status) {
        case 'Pending':
          statusMessage = 'Your order request is Pending Admin Approval';
          break;
        case 'Approved':
          statusMessage = 'Order Approved & Being Prepared';
          break;
        case 'Dispatched':
          statusMessage = 'Order Dispatched & On the Way';
          break;
        case 'Delivered':
          statusMessage = 'Order Delivered Successfully';
          break;
      }
    }

    const updated: Order = {
      ...this.data.orders[index],
      status,
      statusMessage,
      updatedAt: new Date().toISOString()
    };
    const orders = [...this.data.orders];
    orders[index] = updated;
    this.save({ ...this.data, orders });
    return updated;
  }

  public deleteOrder(id: string): boolean {
    const initialLen = this.data.orders.length;
    const orders = this.data.orders.filter(o => o.id !== id);
    if (orders.length === initialLen) return false;
    this.save({ ...this.data, orders });
    return true;
  }

  public bulkDeleteOrders(ids: string[]): number {
    const idSet = new Set(ids);
    const initialLen = this.data.orders.length;
    const orders = this.data.orders.filter(o => !idSet.has(o.id));
    const count = initialLen - orders.length;
    if (count > 0) {
      this.save({ ...this.data, orders });
    }
    return count;
  }

  public archiveOrder(id: string, archived = true): Order | null {
    const index = this.data.orders.findIndex(o => o.id === id);
    if (index === -1) return null;
    const updated = { ...this.data.orders[index], archived };
    const orders = [...this.data.orders];
    orders[index] = updated;
    this.save({ ...this.data, orders });
    return updated;
  }

  public bulkArchiveOrders(ids: string[], archived = true): number {
    const idSet = new Set(ids);
    let count = 0;
    const orders = this.data.orders.map(o => {
      if (idSet.has(o.id)) {
        count++;
        return { ...o, archived };
      }
      return o;
    });
    if (count > 0) {
      this.save({ ...this.data, orders });
    }
    return count;
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    return [...(this.data.notifications || [])];
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      archived: false,
      read: false
    };
    const notifications = [newNotif, ...(this.data.notifications || [])].slice(0, 200);
    this.save({ ...this.data, notifications });
    return newNotif;
  }

  public archiveNotification(id: string, archived = true): NotificationItem | null {
    const notifs = this.data.notifications || [];
    const index = notifs.findIndex(n => n.id === id);
    if (index === -1) return null;
    const updated = { ...notifs[index], archived };
    const notifications = [...notifs];
    notifications[index] = updated;
    this.save({ ...this.data, notifications });
    return updated;
  }

  public bulkArchiveNotifications(ids: string[], archived = true): number {
    const idSet = new Set(ids);
    let count = 0;
    const notifs = this.data.notifications || [];
    const notifications = notifs.map(n => {
      if (idSet.has(n.id)) {
        count++;
        return { ...n, archived };
      }
      return n;
    });
    if (count > 0) {
      this.save({ ...this.data, notifications });
    }
    return count;
  }

  public deleteNotification(id: string): boolean {
    const notifs = this.data.notifications || [];
    const initialLen = notifs.length;
    const notifications = notifs.filter(n => n.id !== id);
    if (notifications.length === initialLen) return false;
    this.save({ ...this.data, notifications });
    return true;
  }

  public bulkDeleteNotifications(ids: string[]): number {
    const idSet = new Set(ids);
    const notifs = this.data.notifications || [];
    const initialLen = notifs.length;
    const notifications = notifs.filter(n => !idSet.has(n.id));
    const count = initialLen - notifications.length;
    if (count > 0) {
      this.save({ ...this.data, notifications });
    }
    return count;
  }

  public clearNotifications(): void {
    this.save({ ...this.data, notifications: [] });
  }

  public markNotificationsRead(): void {
    const notifs = this.data.notifications || [];
    const notifications = notifs.map(n => ({ ...n, read: true }));
    this.save({ ...this.data, notifications });
  }
}

export const db = new Database();
