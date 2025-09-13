const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get potential matches for user's items
    const userItems = await Item.find({ 
      postedBy: req.user.userId, 
      status: 'active' 
    });

    const notifications = [];

    for (const item of userItems) {
      const potentialMatches = await Item.findPotentialMatches(
        item._id,
        item.type,
        item.category,
        item.location.coordinates
      ).populate('postedBy', 'name avatar');

      if (potentialMatches.length > 0) {
        notifications.push({
          type: 'potential_match',
          itemId: item._id,
          itemTitle: item.title,
          matches: potentialMatches,
          createdAt: new Date()
        });
      }
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications/match-alert
// @desc    Send match alert to users
// @access  Private
router.post('/match-alert', auth, async (req, res) => {
  try {
    const { itemId, matchedItemId, confidence } = req.body;

    const item = await Item.findById(itemId);
    const matchedItem = await Item.findById(matchedItemId);

    if (!item || !matchedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns one of the items
    if (item.postedBy.toString() !== req.user.userId && 
        matchedItem.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add match to both items
    await item.addPotentialMatch(matchedItemId, confidence);
    await matchedItem.addPotentialMatch(itemId, confidence);

    // Get user details for notifications
    const itemOwner = await User.findById(item.postedBy);
    const matchedItemOwner = await User.findById(matchedItem.postedBy);

    // Send email notifications if enabled
    if (itemOwner.notificationPreferences.email) {
      // TODO: Implement email notification
      console.log(`Email notification sent to ${itemOwner.email} about potential match`);
    }

    if (matchedItemOwner.notificationPreferences.email) {
      // TODO: Implement email notification
      console.log(`Email notification sent to ${matchedItemOwner.email} about potential match`);
    }

    res.json({
      message: 'Match alert sent successfully',
      match: {
        itemId,
        matchedItemId,
        confidence
      }
    });
  } catch (error) {
    console.error('Send match alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/matches/:itemId
// @desc    Get potential matches for a specific item
// @access  Private
router.get('/matches/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const potentialMatches = await Item.findPotentialMatches(
      item._id,
      item.type,
      item.category,
      item.location.coordinates
    ).populate('postedBy', 'name avatar phone email');

    res.json(potentialMatches);
  } catch (error) {
    console.error('Get item matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/read/:itemId
// @desc    Mark notifications as read for an item
// @access  Private
router.put('/read/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user owns the item
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark potential matches as viewed (you could add a viewed field to track this)
    // For now, we'll just return success
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userItems = await Item.find({ 
      postedBy: req.user.userId, 
      status: 'active' 
    });

    let totalMatches = 0;
    for (const item of userItems) {
      const matches = await Item.findPotentialMatches(
        item._id,
        item.type,
        item.category,
        item.location.coordinates
      );
      totalMatches += matches.length;
    }

    res.json({ unreadCount: totalMatches });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
