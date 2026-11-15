import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const collaborationsRouter = Router();

// GET /api/collaborations
collaborationsRouter.get('/', (req, res) => {
  const collabs = db.getCollaborations();
  res.json({ success: true, count: collabs.length, data: collabs });
});

// POST /api/collaborations
collaborationsRouter.post('/', (req, res) => {
  const { creatorName, handle, profileUrl, image, featuredItem, quote, date } = req.body;
  if (!creatorName || !handle || !image) {
    return res.status(400).json({ success: false, message: 'Creator name, handle, and image are required' });
  }

  const newCollab = db.addCollaboration({
    creatorName: String(creatorName).trim(),
    handle: String(handle).trim(),
    profileUrl: profileUrl || `https://www.instagram.com/${handle.replace('@', '')}/`,
    image: String(image).trim(),
    featuredItem: featuredItem || '18k Anti-Tarnish Piece',
    quote: quote || 'Loved the brilliance and waterproof shine!',
    date: date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  });

  sse.broadcast('COLLAB_CREATED', newCollab);
  res.status(201).json({ success: true, data: newCollab });
});

// PUT /api/collaborations/:id
collaborationsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateCollaboration(id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Collaboration not found' });
  }

  sse.broadcast('COLLAB_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/collaborations/:id
collaborationsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteCollaboration(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Collaboration not found' });
  }

  sse.broadcast('COLLAB_DELETED', { collabId: id });
  res.json({ success: true, message: 'Collaboration deleted' });
});
