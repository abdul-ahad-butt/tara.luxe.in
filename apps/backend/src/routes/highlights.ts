import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const highlightsRouter = Router();

// GET /api/highlights
highlightsRouter.get('/', (req, res) => {
  const highlights = db.getHighlights();
  res.json({ success: true, count: highlights.length, data: highlights });
});

// POST /api/highlights
highlightsRouter.post('/', (req, res) => {
  const { title, iconText, category, image, caption, tag } = req.body;
  if (!title || !image) {
    return res.status(400).json({ success: false, message: 'Title and image are required' });
  }

  const newHighlight = db.addHighlight({
    title: String(title).trim(),
    iconText: iconText || '✨',
    category: category || 'Tara Luxe Highlight',
    image: String(image).trim(),
    caption: caption || '',
    tag: tag || 'Featured Story'
  });

  sse.broadcast('HIGHLIGHT_CREATED', newHighlight);
  res.status(201).json({ success: true, data: newHighlight });
});

// PUT /api/highlights/:id
highlightsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateHighlight(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Highlight not found' });
  }

  sse.broadcast('HIGHLIGHT_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/highlights/:id
highlightsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteHighlight(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Highlight not found' });
  }

  sse.broadcast('HIGHLIGHT_DELETED', { highlightId: id });
  res.json({ success: true, message: 'Highlight deleted' });
});
