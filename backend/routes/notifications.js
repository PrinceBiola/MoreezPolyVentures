import express from 'express';
import Notification from '../models/Notification.js';
import protect from '../middleware/auth.js';
import { notificationService } from '../services/notificationService.js';

const router = express.Router();

/**
 * @desc    Manually trigger the weekly driver manifest email
 * @route   POST /api/notifications/trigger-weekly
 * @access  Private/Admin
 */
router.post('/trigger-weekly', protect, async (req, res) => {
  try {
    // Only admins should be able to trigger global notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized - Admin access required' });
    }

    console.log(`Manual trigger for weekly manifest initiated by ${req.user.name}`);
    await notificationService.sendWeeklyDriverReminders();
    
    res.json({ message: 'Weekly manifest emails dispatched successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.isRead = true;
    const updated = await notification.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.post('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
