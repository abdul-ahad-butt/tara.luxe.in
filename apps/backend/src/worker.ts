// apps/backend/src/worker.ts
// Pure Cloudflare Workers Edge Entry Point for Tara Luxe
// Uses Web Standards (Request, Response, URL, TransformStream) - Zero Node native module dependencies

export interface Env {
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  TARA_DB?: any;
}

// In-Memory Global State for Edge Worker instance
const memoryDb: any = {
  products: [
    {
      id: 'tl-prod-kundan-choker',
      name: 'Royal Heritage 18k Gold Kundan Choker',
      category: 'Anti-Tarnish Necklaces',
      description: 'Handcrafted with 316L surgical steel core and 18k PVD gold leaf finish.',
      price: 1299,
      compareAtPrice: 1999,
      quantity: 14,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      badge: 'Heritage Suite',
      specs: ['18k PVD Gold Plating', '316L Stainless Steel', '100% Waterproof'],
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
      specs: ['1 Designer Festive Saree (Silk-blend)', 'Matching Glass & Gold-Toned Bangles', 'Accron Traditional Bindi Pack', 'Curated Tara Luxe Keepsake Box'],
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
      specs: ['Charcoal & Yellow Floral Saree', 'Coordinated Velvet & Brass Bangles', 'Accron Bindi Pack', '18k Gold-Plated Jhumka Earrings', 'Anti-Tarnish 316L Delicate Necklace'],
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
      specs: ['Parrot Green Woven Festive Saree', 'Matching Glass Chudi Bangles', 'Accron Traditional Bindi Sheet', '18k Gold Plated Statement Necklace', 'Matching Jhumka Drops'],
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
      specs: ['Premium Woven Silk-Blend Rich Saree', 'Complete 18k Gold Plated Suite (Necklace + Earrings + Bracelet)', 'Korean Aesthetic Hair Claw (@aztheticlyf)', 'Handcrafted Rigid Golden Keepsake Box', 'Complimentary Greeting Card & Ribbon'],
      createdAt: '2026-11-13T14:13:25.220Z'
    },
    {
      id: 'tl-necklace-clover',
      name: 'Celestial 18k Gold-Plated Clover Chain Necklace',
      category: 'Anti-Tarnish Necklaces',
      description: 'Crafted from medical-grade 316L Stainless Steel with thick 18k PVD Gold Plating. 100% waterproof, sweatproof, hypoallergenic, and guaranteed anti-tarnish for everyday luxury wear.',
      price: 699,
      compareAtPrice: 1199,
      quantity: 23,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      badge: '18k PVD Gold',
      specs: ['316L Medical Grade Surgical Steel', 'Real 18k Vacuum PVD Gold Plating', '100% Waterproof & Sweatproof', '40cm + 5cm Adjustable Extender Chain'],
      createdAt: '2026-11-13T14:13:25.220Z'
    },
    {
      id: 'tl-earrings-hoops',
      name: 'Lumière Waterproof 316L Twisted Gold Hoops',
      category: '18k Gold Earrings',
      description: 'Featherlight sculpted 18k gold-plated chunky twisted hoops on a 316L stainless steel core. Tarnish-free brilliance that outlasts ordinary fashion jewellery.',
      price: 549,
      compareAtPrice: 899,
      quantity: 30,
      imageUrl: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
      badge: 'Waterproof 316L',
      specs: ['Chunky Twist Sculpted Silhouette', 'Zero Discoloration in Shower & Gym', 'Featherlight Comfort (4.2g per hoop)', 'Hypoallergenic Click-Top Clasp'],
      createdAt: '2026-11-13T14:13:25.220Z'
    },
    {
      id: 'tl-bracelet-cuff',
      name: 'Versailles Anti-Tarnish Cuff Bracelet',
      category: 'Bracelets & Bangles',
      description: 'Mirror-polished 18k gold-plated cuff bracelet engineered in 316L surgical steel. Scratch-resistant, waterproof, and stackable.',
      price: 799,
      compareAtPrice: 1299,
      quantity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
      badge: 'Scratch-Resistant',
      specs: ['Mirror Finish 18k Gold Lustre', 'Slightly Malleable Oval Ergonomic Shape', 'Internal Tara Luxe TL✦ Hallmark', 'Guaranteed 0% Green Skin Staining'],
      createdAt: '2026-11-13T14:13:25.220Z'
    },
    {
      id: 'tl-korean-claw',
      name: 'Seoul Muse Pearl & Gold Butterfly Hair Claw — @aztheticlyf Edit',
      category: 'Korean Accessories',
      description: 'Curated from our sister label @aztheticlyf. High-tension gold alloy hair claw accented with luminous freshwater-style pearls.',
      price: 399,
      compareAtPrice: 649,
      quantity: 22,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      badge: '@aztheticlyf Edit',
      specs: ['High-Tension Steel Spring Mechanism', 'Shimmering Hand-Set Faux Pearls', 'Polished Gold Alloy Finishing', 'Curated from Korean Sister Label @aztheticlyf'],
      createdAt: '2026-11-13T14:13:25.220Z'
    }
  ],
  categories: [
    { id: 'cat-hampers', name: 'Tara Hampers', createdAt: '2026-11-13T17:16:57.291Z' },
    { id: 'cat-necklaces', name: 'Anti-Tarnish Necklaces', createdAt: '2026-11-13T17:16:57.291Z' },
    { id: 'cat-earrings', name: '18k Gold Earrings', createdAt: '2026-11-13T17:16:57.291Z' },
    { id: 'cat-bracelets', name: 'Bracelets & Bangles', createdAt: '2026-11-13T17:16:57.291Z' },
    { id: 'cat-korean', name: 'Korean Accessories', createdAt: '2026-11-13T17:16:57.291Z' }
  ],
  coupons: [
    {
      id: 'coup-festive15',
      code: 'FESTIVE15',
      type: 'PERCENTAGE',
      value: 15,
      minOrderAmount: 1000,
      active: true,
      description: 'Festive 15% discount on orders above ₹1,000',
      maxUses: 1000,
      usageCount: 0,
      createdAt: '2026-11-13T15:54:03.598Z'
    },
    {
      id: 'coup-taraluxe10',
      code: 'TARALUXE10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 499,
      active: true,
      description: 'Welcome 10% off on 18k Anti-Tarnish Jewellery',
      usageCount: 20,
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
    }
  ],
  highlights: [
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
  ],
  collaborations: [
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
  ],
  bagEvents: [],
  orders: [],
  notifications: []
};

// Global SSE Stream Writers
const sseStreams = new Set<WritableStreamDefaultWriter<Uint8Array>>();

function broadcastSSE(type: string, data: any) {
  const encoder = new TextEncoder();
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  const bytes = encoder.encode(payload);

  for (const writer of sseStreams) {
    try {
      writer.write(bytes).catch(() => sseStreams.delete(writer));
    } catch {
      sseStreams.delete(writer);
    }
  }
}

// Helpers
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const pathname = url.pathname;

    // -------------------------------------------------------------
    // API ROUTES (/api/*)
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/')) {
      // 1. Health
      if (pathname === '/api/health' && method === 'GET') {
        return jsonResponse({
          status: 'ok',
          brand: 'Tara Luxe (@tara.luxe.in)',
          environment: 'Cloudflare Workers Edge',
          version: '2.0.0',
          timestamp: new Date().toISOString(),
          sseClients: sseStreams.size,
          totalProducts: memoryDb.products.length,
          totalCategories: memoryDb.categories.length,
          totalHighlights: memoryDb.highlights.length,
          totalCollaborations: memoryDb.collaborations.length,
          totalCoupons: memoryDb.coupons.length,
          totalOrders: memoryDb.orders.length
        });
      }

      // 2. Real-Time SSE Stream
      if (pathname === '/api/stream' && method === 'GET') {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        sseStreams.add(writer);

        const encoder = new TextEncoder();
        writer.write(encoder.encode(`event: CONNECTED\ndata: ${JSON.stringify({ clientCount: sseStreams.size })}\n\n`));

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders()
          }
        });
      }

      // 3. Products
      if (pathname === '/api/products' && method === 'GET') {
        return jsonResponse({ success: true, count: memoryDb.products.length, data: memoryDb.products });
      }

      if (pathname === '/api/products' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const newProduct = {
          id: `tl-prod-${Date.now().toString(36)}`,
          name: body.name || 'New Piece',
          category: body.category || 'Anti-Tarnish Necklaces',
          description: body.description || '',
          price: Number(body.price) || 699,
          compareAtPrice: Number(body.compareAtPrice) || 1199,
          quantity: Number(body.quantity) || 15,
          imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          badge: body.badge || '18k PVD Gold',
          specs: body.specs || ['316L Stainless Steel', '18k PVD Gold Plating', '100% Waterproof'],
          createdAt: new Date().toISOString()
        };
        memoryDb.products.unshift(newProduct);
        broadcastSSE('PRODUCT_CREATED', newProduct);
        return jsonResponse({ success: true, data: newProduct }, 201);
      }

      if (pathname.startsWith('/api/products/') && pathname.endsWith('/stock') && method === 'PATCH') {
        const id = pathname.replace('/api/products/', '').replace('/stock', '');
        const body: any = await request.json().catch(() => ({}));
        const p = memoryDb.products.find((item: any) => item.id === id);
        if (p) {
          if (body.isAbsolute) {
            p.quantity = Math.max(0, Number(body.deltaOrQuantity) || 0);
          } else {
            p.quantity = Math.max(0, p.quantity + (Number(body.deltaOrQuantity) || 0));
          }
          broadcastSSE('STOCK_UPDATED', { productId: p.id, newQuantity: p.quantity });
          return jsonResponse({ success: true, data: p });
        }
        return jsonResponse({ success: false, message: 'Product not found' }, 404);
      }

      if (pathname.startsWith('/api/products/') && method === 'PATCH') {
        const id = pathname.replace('/api/products/', '');
        const body: any = await request.json().catch(() => ({}));
        const pIndex = memoryDb.products.findIndex((item: any) => item.id === id);
        if (pIndex !== -1) {
          memoryDb.products[pIndex] = { ...memoryDb.products[pIndex], ...body };
          broadcastSSE('PRODUCT_UPDATED', memoryDb.products[pIndex]);
          return jsonResponse({ success: true, data: memoryDb.products[pIndex] });
        }
        return jsonResponse({ success: false, message: 'Product not found' }, 404);
      }

      if (pathname.startsWith('/api/products/') && method === 'DELETE') {
        const id = pathname.replace('/api/products/', '');
        const pIndex = memoryDb.products.findIndex((item: any) => item.id === id);
        if (pIndex !== -1) {
          memoryDb.products.splice(pIndex, 1);
          broadcastSSE('PRODUCT_DELETED', { productId: id });
          return jsonResponse({ success: true, message: 'Product deleted' });
        }
        return jsonResponse({ success: false, message: 'Product not found' }, 404);
      }

      if (pathname === '/api/products/bulk-delete' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const ids = new Set(body.ids || []);
        memoryDb.products = memoryDb.products.filter((p: any) => !ids.has(p.id));
        broadcastSSE('PRODUCTS_BULK_DELETED', { ids: Array.from(ids) });
        return jsonResponse({ success: true });
      }

      // 4. Categories
      if (pathname === '/api/categories' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.categories });
      }

      if (pathname === '/api/categories' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const newCat = {
          id: `cat-${Date.now().toString(36)}`,
          name: body.name || 'New Category',
          createdAt: new Date().toISOString()
        };
        memoryDb.categories.push(newCat);
        broadcastSSE('CATEGORY_CREATED', newCat);
        return jsonResponse({ success: true, data: newCat }, 201);
      }

      if (pathname.startsWith('/api/categories/') && method === 'DELETE') {
        const id = pathname.replace('/api/categories/', '');
        memoryDb.categories = memoryDb.categories.filter((c: any) => c.id !== id);
        broadcastSSE('CATEGORY_DELETED', { id });
        return jsonResponse({ success: true });
      }

      // 5. Highlights
      if (pathname === '/api/highlights' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.highlights });
      }

      if (pathname === '/api/highlights' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const newHl = {
          id: `highlight-${Date.now().toString(36)}`,
          title: body.title || 'Highlight',
          iconText: body.iconText || '✦',
          category: body.category || 'Story',
          image: body.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
          caption: body.caption || '',
          tag: body.tag || '',
          createdAt: new Date().toISOString()
        };
        memoryDb.highlights.push(newHl);
        broadcastSSE('HIGHLIGHT_CREATED', newHl);
        return jsonResponse({ success: true, data: newHl }, 201);
      }

      // 6. Collaborations
      if (pathname === '/api/collaborations' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.collaborations });
      }

      if (pathname === '/api/collaborations' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const newCollab = {
          id: `collab-${Date.now().toString(36)}`,
          creatorName: body.creatorName || 'Creator',
          handle: body.handle || '@creator',
          profileUrl: body.profileUrl || 'https://instagram.com/tara.luxe.in',
          image: body.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          featuredItem: body.featuredItem || '18k Jewellery',
          quote: body.quote || '',
          date: body.date || 'Recent',
          createdAt: new Date().toISOString()
        };
        memoryDb.collaborations.push(newCollab);
        broadcastSSE('COLLABORATION_CREATED', newCollab);
        return jsonResponse({ success: true, data: newCollab }, 201);
      }

      // 7. Coupons
      if (pathname === '/api/coupons' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.coupons });
      }

      if (pathname === '/api/coupons' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const newCoupon = {
          id: `coup-${Date.now().toString(36)}`,
          code: (body.code || '').toUpperCase().trim(),
          type: body.type || 'PERCENTAGE',
          value: Number(body.value) || 10,
          minOrderAmount: Number(body.minOrderAmount) || 499,
          active: body.active !== false,
          description: body.description || '',
          usageCount: 0,
          maxUses: Number(body.maxUses) || 500,
          createdAt: new Date().toISOString()
        };
        memoryDb.coupons.push(newCoupon);
        broadcastSSE('COUPON_CREATED', newCoupon);
        return jsonResponse({ success: true, data: newCoupon }, 201);
      }

      if (pathname === '/api/coupons/validate' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const code = (body.code || '').toUpperCase().trim();
        const subtotal = Number(body.bagSubtotal) || 0;
        const coupon = memoryDb.coupons.find((c: any) => c.code === code);
        if (!coupon) return jsonResponse({ valid: false, message: `Coupon "${code}" is invalid.` });
        if (!coupon.active) return jsonResponse({ valid: false, message: `Coupon "${code}" is inactive.` });
        if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) return jsonResponse({ valid: false, message: 'Maximum usage reached.' });
        if (subtotal < coupon.minOrderAmount) {
          return jsonResponse({
            valid: false,
            message: `Minimum order of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required.`
          });
        }
        const discountAmount = coupon.type === 'PERCENTAGE'
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(subtotal, coupon.value);
        return jsonResponse({ valid: true, coupon, discountAmount, finalTotal: Math.max(0, subtotal - discountAmount) });
      }

      if (pathname.startsWith('/api/coupons/') && method === 'DELETE') {
        const id = pathname.replace('/api/coupons/', '');
        memoryDb.coupons = memoryDb.coupons.filter((c: any) => c.id !== id);
        broadcastSSE('COUPON_DELETED', { couponId: id });
        return jsonResponse({ success: true });
      }

      // 8. Bag Events & Orders
      if (pathname === '/api/bag-events' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.bagEvents });
      }

      if (pathname === '/api/bag-events' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const event = {
          id: `bag-${Date.now().toString(36)}`,
          sessionId: body.sessionId || 'session',
          customerName: body.customerName || 'Guest Shopper',
          type: body.type || 'ADD_TO_BAG',
          productId: body.productId || '',
          productTitle: body.productTitle || '',
          productImage: body.productImage || '',
          quantity: Number(body.quantity) || 1,
          price: Number(body.price) || 0,
          subtotal: Number(body.subtotal) || 0,
          timestamp: new Date().toISOString()
        };
        memoryDb.bagEvents.unshift(event);
        broadcastSSE('BAG_EVENT', event);
        return jsonResponse({ success: true, data: event }, 201);
      }

      if (pathname === '/api/orders' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.orders });
      }

      if (pathname === '/api/orders' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const orderId = `TL-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        const trackingCode = `TLX-${Math.floor(100000 + Math.random() * 900000)}`;

        const newOrder = {
          id: orderId,
          trackingCode,
          customerName: body.customerName || 'Valued Customer',
          customerPhone: body.customerPhone || '+91 7871501939',
          address: body.address || 'India',
          addressDetails: body.addressDetails,
          paymentMode: body.paymentMode || 'COD',
          items: body.items || [],
          couponCode: body.couponCode || null,
          subtotal: Number(body.subtotal) || 0,
          discount: Number(body.discount) || 0,
          finalTotal: Number(body.finalTotal) || 0,
          status: 'Pending',
          whatsAppUrl: `https://wa.me/message/U5MPAWAN3UPFM1?text=Order%20${trackingCode}`,
          createdAt: new Date().toISOString()
        };

        memoryDb.orders.unshift(newOrder);

        // Deduct inventory
        if (Array.isArray(body.items)) {
          body.items.forEach((it: any) => {
            const p = memoryDb.products.find((prod: any) => prod.id === it.productId || prod.name === it.title);
            if (p) {
              p.quantity = Math.max(0, p.quantity - (Number(it.quantity) || 1));
              broadcastSSE('STOCK_UPDATED', { productId: p.id, newQuantity: p.quantity });
            }
          });
        }

        broadcastSSE('NEW_ORDER', newOrder);
        return jsonResponse({ success: true, order: newOrder, trackingCode }, 201);
      }

      if (pathname.startsWith('/api/orders/track/')) {
        const code = pathname.replace('/api/orders/track/', '').toUpperCase().trim();
        const o = memoryDb.orders.find((ord: any) => (ord.trackingCode || '').toUpperCase() === code);
        if (o) return jsonResponse({ success: true, order: o });
        return jsonResponse({ success: false, message: 'Order not found' }, 404);
      }

      if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'PATCH') {
        const id = pathname.replace('/api/orders/', '').replace('/status', '');
        const body: any = await request.json().catch(() => ({}));
        const o = memoryDb.orders.find((ord: any) => ord.id === id);
        if (o) {
          o.status = body.status || o.status;
          o.statusMessage = body.statusMessage || '';
          broadcastSSE('ORDER_STATUS_UPDATED', o);
          return jsonResponse({ success: true, order: o });
        }
        return jsonResponse({ success: false, message: 'Order not found' }, 404);
      }

      // 9. Notifications
      if (pathname === '/api/notifications' && method === 'GET') {
        return jsonResponse({ success: true, data: memoryDb.notifications });
      }

      if (pathname === '/api/notifications' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        const notif = {
          id: `notif-${Date.now().toString(36)}`,
          title: body.title || 'Notification',
          message: body.message || '',
          type: body.type || 'order',
          timestamp: new Date().toISOString(),
          read: false
        };
        memoryDb.notifications.unshift(notif);
        broadcastSSE('NOTIFICATION_ADDED', notif);
        return jsonResponse({ success: true, data: notif }, 201);
      }

      if (pathname === '/api/notifications/mark-read' && method === 'POST') {
        memoryDb.notifications.forEach((n: any) => (n.read = true));
        broadcastSSE('NOTIFICATIONS_READ', {});
        return jsonResponse({ success: true });
      }

      // 10. Admin Auth
      if (pathname === '/api/admin/login' && method === 'POST') {
        const body: any = await request.json().catch(() => ({}));
        if (body.email === 'admin@taraluxe.in' && body.password === 'TaraLuxe@2026') {
          return jsonResponse({
            success: true,
            token: `tlx-auth-${Date.now()}`,
            user: { name: 'Tara Luxe Admin', email: 'admin@taraluxe.in' }
          });
        }
        return jsonResponse({ success: false, message: 'Invalid credentials' }, 401);
      }

      // 11. Upload fallback
      if (pathname === '/api/upload' && method === 'POST') {
        return jsonResponse({
          success: true,
          imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
        });
      }
    }

    // -------------------------------------------------------------
    // STATIC ASSETS FALLBACK (Non-/api/* requests)
    // -------------------------------------------------------------
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Tara Luxe Cloudflare Worker Online', {
      status: 200,
      headers: { 'Content-Type': 'text/plain', ...corsHeaders() }
    });
  }
};
