import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const productsRouter = Router();

// GET /api/products
productsRouter.get('/', (req, res) => {
  const products = db.getProducts();
  res.json({ success: true, count: products.length, data: products });
});

// GET /api/products/:id
productsRouter.get('/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// POST /api/products
productsRouter.post('/', (req, res) => {
  const { name, category, description, price, compareAtPrice, quantity, imageUrl, badge, specs } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }

  const newProduct = db.addProduct({
    name: String(name).trim(),
    category: category || 'Anti-Tarnish Necklaces',
    description: description || '',
    price: Number(price) || 0,
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : Math.round((Number(price) || 0) * 1.4),
    quantity: quantity !== undefined ? Math.max(0, Number(quantity)) : 10,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    badge: badge || 'New Arrival',
    specs: Array.isArray(specs) ? specs : ['18k PVD Gold Plating', '316L Stainless Steel', '100% Waterproof']
  });

  sse.broadcast('PRODUCT_CREATED', newProduct);

  res.status(201).json({ success: true, data: newProduct });
});

// PUT /api/products/:id
productsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.price !== undefined) updates.price = Number(updates.price);
  if (updates.compareAtPrice !== undefined) updates.compareAtPrice = Number(updates.compareAtPrice);
  if (updates.quantity !== undefined) updates.quantity = Math.max(0, Number(updates.quantity));

  const updated = db.updateProduct(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  sse.broadcast('PRODUCT_UPDATED', updated);

  res.json({ success: true, data: updated });
});

// PATCH /api/products/:id/quantity
productsRouter.patch('/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { delta, quantity } = req.body;

  let updated;
  if (quantity !== undefined) {
    updated = db.adjustStock(id, Number(quantity), true);
  } else if (delta !== undefined) {
    updated = db.adjustStock(id, Number(delta), false);
  } else {
    return res.status(400).json({ success: false, message: 'Provide either delta or quantity' });
  }

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  sse.broadcast('STOCK_ADJUSTED', {
    productId: id,
    product: updated,
    quantity: updated.quantity
  });

  res.json({ success: true, data: updated });
});

// DELETE /api/products/:id
productsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  sse.broadcast('PRODUCT_DELETED', { productId: id });

  res.json({ success: true, message: 'Product deleted permanently' });
});

// POST /api/products/bulk-delete
productsRouter.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }

  const count = db.bulkDeleteProducts(ids);
  sse.broadcast('PRODUCTS_BULK_DELETED', { ids, count });
  res.json({ success: true, count, message: `Deleted ${count} products permanently` });
});
