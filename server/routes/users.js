const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard of top helpers
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { period = 'month', limit = 20 } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
    } else if (period === 'year') {
      dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } };
    }

    const leaderboard = await User.find(dateFilter)
      .select('name avatar points level badges itemsReturned helpfulRating')
      .sort({ points: -1, itemsReturned: -1 })
      .limit(parseInt(limit));

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email')
      .populate('badges');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's items
    const items = await Item.find({ postedBy: req.params.id, status: 'active' })
      .select('title description images type category status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      recentItems: items
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/items
// @desc    Get user's items
// @access  Public
router.get('/:id/items', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    
    const query = { postedBy: req.params.id };
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const items = await Item.find(query)
      .select('title description images type category status createdAt views')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/rate
// @desc    Rate a user's helpfulness
// @access  Private
router.put('/:id/rate', auth, async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Prevent self-rating
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update helpful rating (simple average)
    const currentTotal = user.helpfulRating * (user.ratingCount || 0);
    const newTotal = currentTotal + rating;
    const newCount = (user.ratingCount || 0) + 1;
    user.helpfulRating = newTotal / newCount;
    user.ratingCount = newCount;

    await user.save();

    res.json({
      message: 'Rating submitted successfully',
      newRating: user.helpfulRating
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users by name
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      name: { $regex: q, $options: 'i' }
    })
    .select('name avatar level points badges')
    .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/global
// @desc    Get global statistics
// @access  Public
router.get('/stats/global', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalItems = await Item.countDocuments({ status: 'active' });
    const totalResolved = await Item.countDocuments({ status: 'resolved' });
    const totalLost = await Item.countDocuments({ type: 'lost', status: 'active' });
    const totalFound = await Item.countDocuments({ type: 'found', status: 'active' });

    // Top categories
    const categoryStats = await Item.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalItems,
      totalResolved,
      totalLost,
      totalFound,
      categoryStats,
      successRate: totalItems > 0 ? ((totalResolved / totalItems) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get global stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
