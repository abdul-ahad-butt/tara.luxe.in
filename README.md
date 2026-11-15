# Tara Luxe (@tara.luxe.in) — 3D Luxury E-Commerce Platform

Production-grade, zero-error luxury e-commerce platform for **Tara Luxe ([@tara.luxe.in](https://www.instagram.com/tara.luxe.in/))**, built with two independent frontends powered by a single shared real-time backend API with Server-Sent Events (SSE).

---

## 🏛️ System Architecture

```text
tara-luxe-platform/
├── package.json                 # Monorepo runner (concurrent dev, builds, install)
├── test-e2e-audit.mjs           # 24-point automated audit verification suite
├── apps/
│   ├── backend/                 # Shared REST + SSE Real-Time Backend (Port 8787)
│   │   ├── data/
│   │   │   ├── db.json          # Disk-persisted atomic store (with isSeeded safeguard)
│   │   │   └── uploads/         # Static storage for uploaded product photography
│   │   └── src/
│   │       ├── index.ts         # Express server with CORS (0.0.0.0:8787) & SSE stream
│   │       ├── db.ts            # Atomic file database with permanent deletion & seed safeguard
│   │       ├── sse.ts           # Real-time event broadcaster
│   │       └── routes/          # products, coupons, bagAndOrders, notifications, categories, highlights, collabs
│   │
│   ├── storefront/              # Luxury Customer Website (Port 3000)
│   │   ├── src/
│   │   │   ├── components/      # BrandLogo, Navbar, Hero3DCanvas (18k Gold Halo & Clover),
│   │   │   │                    # WhyTaraLuxe3D, StoryHighlights, HamperBuilderSection,
│   │   │   │                    # ProductGrid, ProductCard3D, SlideOverBagDrawer, OrderTrackerModal, Footer
│   │   │   └── context/         # StoreContext.tsx (live SSE listener)
│   │
│   └── admin-panel/             # Standalone Command Center (Port 3002)
│       └── src/
│           ├── components/      # AdminSidebar (5 Distinct Tabs), NotificationPanel (Portal z-99999),
│           │                    # LiveBagFeedView (Bulk Archive & Delete), ProductManagerView,
│           │                    # HighlightsCollabManagerView, CouponManagerView, ExecutiveAnalyticsView
│           └── context/         # AdminRealtimeContext.tsx (live SSE stream & actions)
```

---

## 🚀 Live Working Localhost URLs

| Application | Localhost URL | Port | Description |
| :--- | :--- | :--- | :--- |
| **Customer Storefront** | [http://localhost:3000](http://localhost:3000) | `3000` | 18k Gold Halo & Diamond Clover 3D centerpiece, Story Highlights, Bag Drawer & WhatsApp order generator |
| **Admin Command Center** | [http://localhost:3002](http://localhost:3002) | `3002` | Live Add-to-Bag feed, Portal alerts, 5 distinct tabs, Product/Coupon CRUD & Executive Analytics |
| **Backend Health Check** | [http://localhost:8787/api/health](http://localhost:8787/api/health) | `8787` | API healthcheck, uptime & real-time SSE client count |
| **SSE Real-Time Stream** | [http://localhost:8787/api/stream](http://localhost:8787/api/stream) | `8787` | Zero-refresh live event broadcaster |

---

## ⚡ Quick Start & Development

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Boot All 3 Servers Concurrently
```bash
npm run dev
```
This runs `npm run dev:backend` (8787), `npm run dev:storefront` (3000), and `npm run dev:admin` (3002) concurrently.

### 3. Run Automated E2E Audit
```bash
node test-e2e-audit.mjs
```
Runs 24 automated assertions covering backend health, product image reachability, dynamic category/highlight/collab CRUD, admin auth gate, order placement with `TLX-XXXXXX` tracking, SSE sync, notification portal actions, and permanent deletion.

---

## ✨ Verified Brand Specification Grounded in @tara.luxe.in

- **Tagline & Bio Positioning**: Anti-Tarnish Jewellery | 18k Gold Plated | 316L Stainless Steel | Waterproof | Korean Accessories (@aztheticlyf) | Retail & Wholesale
- **Monogram & Logo**: Circular warm-ivory badge (`#F7F1E3`) with a thin champagne-gold inner ring (`#C5A059`), intertwined serif TL monogram with a four-point sparkle (✦), primary text **TARA LUXE**, and sub-caption **ANTI-TARNISH JEWELLERY**.
- **Contact & WhatsApp**:
  - Phone: `+91 7871501939`
  - WhatsApp Direct: `https://wa.me/message/U5MPAWAN3UPFM1`
  - Instagram: `https://www.instagram.com/tara.luxe.in/`
  - Sister Label: `@aztheticlyf`
- **Color Palette**: Obsidian Noir (`#0B0A09`), Espresso Velvet (`#161311`), Champagne Gold (`#D4AF37`), Brushed 18k Gold (`#C5A059`), Warm Ivory Silk (`#FBF8F3`), Emerald In-Stock (`#10B981`), Ruby Low-Stock (`#EF4444`).

---

## 💎 Key Features & Architecture Highlights

1. **Hardware-Accelerated 3D Hero Centerpiece**:
   - Built with Three.js / React Three Fiber (`@react-three/fiber` + `@react-three/drei`).
   - Primary 18k Gold Halo Ring (`#E6CA65`, metalness: `0.98`, roughness: `0.12`, clearcoat: `1.0`) with 24 micro-pavé radial diamond studs (`IOR: 2.42`, `transmission: 0.92`).
   - Secondary Interlocking Band tilted at 38° counter-rotating slowly to create dynamic depth.
   - Suspended Centerpiece Diamond / Four-Leaf Clover Medallion with faceted refraction and 18k gold petal bezel.
   - Interactive on-canvas **"Test Waterproof 316L"** toggle activating orbiting water droplets (`IOR: 1.33`) and specular reflections.
   - Studio lighting with dual directional lights, point lights, overhead spotlight, tone mapping exposure `1.35`, and pulled-back non-clipping camera positioning (`fov: 36`, `position: [0, 0.2, 5.6]`).

2. **Portal Notification Panel (`z-index: 99999`)**:
   - Notification dropdown rendered via React `createPortal` directly to `document.body` with solid `#12100E` obsidian styling.
   - Active vs. Archived sub-tabs, multi-select checkboxes, Select All, bulk Archive/Restore, and permanent deletion.
   - Outside-click and `Escape` key listeners for smooth dismissal.

3. **5 Distinct Admin Center Tabs**:
   - **Tab 1 — Live Bag & Orders Feed**: Real-time customer bag activity, order cards with `TLX-XXXXXX` tracking badges, one-click status stepper (`Pending` ➔ `Approved` ➔ `Dispatched` ➔ `Delivered`), and WhatsApp customer launch.
   - **Tab 2 — Products & Inventory**: Stock controls, instant image file uploads, inline category manager, and permanent deletion.
   - **Tab 3 — Insta Highlights & Collabs**: Real-time sync of official Instagram highlights (`Reviews✨`, `Orders✨`, `Product✨`, `Collab✨`) and creator collaborations.
   - **Tab 4 — Discount Coupons**: Coupon generator (percentage & flat discounts, minimum order threshold validation, toggle active status).
   - **Tab 5 — KPIs & Analytics**: Dedicated executive dashboard featuring the 4 top KPI cards, Revenue Funnel, Top-Performing Products Table, Coupon Impact Breakdown, and Low-Stock Watchlist with `+10 Stock` restock buttons.

4. **Permanent Disk Deletion & Seed Safeguard**:
   - All delete actions permanently purge records from `db.json`.
   - Protected by `isSeeded: true` meta flag so deleted items are never restored upon server restarts.

---

## ☁️ Cloudflare Pages & Workers Deployment Architecture

- **Storefront**: Deployable to Cloudflare Pages via `npm --prefix apps/storefront run build` (`dist/` directory).
- **Admin Panel**: Deployable to Cloudflare Pages (or password-protected sub-domain) via `npm --prefix apps/admin-panel run build` (`dist/` directory).
- **Backend**: Can be deployed to Cloudflare Workers with D1 / KV or a Node.js container (Railway/Render) with persistent disk.
