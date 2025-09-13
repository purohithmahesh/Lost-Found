const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  }
});

// @route   POST /api/items
// @desc    Create a new lost/found item
// @access  Private
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      location,
      date,
      tags,
      reward,
      contactInfo
    } = req.body;

    // Parse JSON fields
    const parsedLocation = JSON.parse(location);
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedReward = reward ? JSON.parse(reward) : null;
    const parsedContactInfo = contactInfo ? JSON.parse(contactInfo) : null;

    // Upload images to Cloudinary
    const imagePromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: 'lost-found-items',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        }
      );
      return {
        url: result.secure_url,
        publicId: result.public_id,
        caption: ''
      };
    });

    const uploadedImages = await Promise.all(imagePromises);

    // Create new item
    const item = new Item({
      title,
      description,
      type,
      category,
      images: uploadedImages,
      location: parsedLocation,
      date: new Date(date),
      tags: parsedTags,
      reward: parsedReward,
      contactInfo: parsedContactInfo,
      postedBy: req.user.userId
    });

    await item.save();

    // Update user's itemsPosted count
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { itemsPosted: 1 }
    });

    // Add points for posting
    const user = await User.findById(req.user.userId);
    await user.addPoints(10);

    // Find potential matches
    const potentialMatches = await Item.findPotentialMatches(
      item._id,
      item.type,
      item.category,
      item.location.coordinates
    );

    // Add potential matches to the item
    for (const match of potentialMatches) {
      await item.addPotentialMatch(match._id, 0.7); // Default confidence
    }

    res.status(201).json({
      message: 'Item posted successfully',
      item,
      potentialMatches: potentialMatches.length
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items
// @desc    Get all items with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      search,
      location,
      radius = 10000,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { status: 'active' };
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Filter by type
    if (type && ['lost', 'found'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location-based search
    if (location) {
      const coords = JSON.parse(location);
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coords.lng, coords.lat]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find(query)
      .populate('postedBy', 'name avatar')
      .sort(sort)
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
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name avatar phone email')
      .populate('potentialMatches.itemId', 'title description images type category');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment view count
    item.views += 1;
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      title,
      description,
      category,
      location,
      tags,
      reward,
      contactInfo
    } = req.body;

    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (location) item.location = JSON.parse(location);
    if (tags) item.tags = JSON.parse(tags);
    if (reward) item.reward = JSON.parse(reward);
    if (contactInfo) item.contactInfo = JSON.parse(contactInfo);

    await item.save();

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/items/:id/resolve
// @desc    Mark item as resolved
// @access  Private
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await item.markAsResolved(req.user.userId);

    // Update user's itemsReturned count and add points
    const user = await User.findById(req.user.userId);
    await user.addPoints(50); // Bonus points for resolving

    res.json({
      message: 'Item marked as resolved',
      item
    });
  } catch (error) {
    console.error('Resolve item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const image of item.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/nearby/:userId
// @desc    Get nearby items for a user
// @access  Private
router.get('/nearby/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.location.coordinates) {
      return res.status(400).json({ message: 'User location not available' });
    }

    const nearbyItems = await Item.findNearby(
      user.location.coordinates,
      10000 // 10km radius
    ).populate('postedBy', 'name avatar');

    res.json(nearbyItems);
  } catch (error) {
    console.error('Get nearby items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/items/matches/:itemId
// @desc    Get potential matches for an item
// @access  Public
router.get('/matches/:itemId', async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const matches = await Item.findPotentialMatches(
      item._id,
      item.type,
      item.category,
      item.location.coordinates
    ).populate('postedBy', 'name avatar');

    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
