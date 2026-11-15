import { Router } from 'express';
import { db } from '../db.js';
import { sse } from '../sse.js';

export const notificationsRouter = Router();

// GET /api/notifications
notificationsRouter.get('/', (req, res) => {
  const notifications = db.getNotifications();
  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// POST /api/notifications (Create notification)
notificationsRouter.post('/', (req, res) => {
  const { title, message, type } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  const notif = db.addNotification({
    title,
    message,
    type: type || 'stock',
    archived: false,
    read: false
  });

  sse.broadcast('NOTIFICATION_CREATED', notif);
  res.status(201).json({ success: true, data: notif });
});

// POST /api/notifications/mark-read
notificationsRouter.post('/mark-read', (req, res) => {
  db.markNotificationsRead();
  sse.broadcast('NOTIFICATIONS_READ', { success: true });
  res.json({ success: true, message: 'Notifications marked as read' });
});

// PATCH /api/notifications/archive (Bulk archive / unarchive)
notificationsRouter.patch('/archive', (req, res) => {
  const { ids, archived = true } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }

  const count = db.bulkArchiveNotifications(ids, Boolean(archived));
  sse.broadcast('NOTIFICATIONS_ARCHIVED', { ids, archived: Boolean(archived) });
  res.json({ success: true, count, message: `Archived ${count} notifications` });
});

// PATCH /api/notifications/:id/archive (Single archive toggle)
notificationsRouter.patch('/:id/archive', (req, res) => {
  const { id } = req.params;
  const { archived = true } = req.body;

  const updated = db.archiveNotification(id, Boolean(archived));
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  sse.broadcast('NOTIFICATION_UPDATED', updated);
  res.json({ success: true, data: updated });
});

// DELETE /api/notifications/:id (Single delete)
notificationsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteNotification(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  sse.broadcast('NOTIFICATION_DELETED', { id });
  res.json({ success: true, message: 'Notification deleted permanently' });
});

// POST /api/notifications/bulk-delete
notificationsRouter.post('/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Array of ids required' });
  }

  const count = db.bulkDeleteNotifications(ids);
  sse.broadcast('NOTIFICATIONS_BULK_DELETED', { ids, count });
  res.json({ success: true, count, message: `Deleted ${count} notifications permanently` });
});

// DELETE /api/notifications (Bulk or clear all)
notificationsRouter.delete('/', (req, res) => {
  const ids = req.body?.ids;
  if (Array.isArray(ids) && ids.length > 0) {
    const count = db.bulkDeleteNotifications(ids);
    sse.broadcast('NOTIFICATIONS_BULK_DELETED', { ids, count });
    return res.json({ success: true, count, message: `Deleted ${count} notifications permanently` });
  }

  db.clearNotifications();
  sse.broadcast('NOTIFICATIONS_CLEARED', { success: true });
  res.json({ success: true, message: 'All notifications cleared permanently' });
});
