import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const categoriesRouter = Router();

// GET /api/categories
categoriesRouter.get('/', (req, res) => {
  const categories = db.getCategories();
  res.json({ success: true, count: categories.length, data: categories });
});

// POST /api/categories
categoriesRouter.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const category = db.addCategory(name);
  sse.broadcast('CATEGORY_CREATED', category);

  res.status(201).json({ success: true, data: category });
});

// DELETE /api/categories/:id
categoriesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteCategory(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  sse.broadcast('CATEGORY_DELETED', { categoryId: id });
  res.json({ success: true, message: 'Category deleted' });
});
