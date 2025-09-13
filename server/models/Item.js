const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
    default: 'lost'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Documents',
      'Jewelry',
      'Clothing',
      'Pets',
      'Books',
      'Sports Equipment',
      'Musical Instruments',
      'Other'
    ]
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    country: String,
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Contact information
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both'
    }
  },
  // Reward information
  reward: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    description: String
  },
  // Tags for better search
  tags: [String],
  // Views and interactions
  views: {
    type: Number,
    default: 0
  },
  // QR code for the item
  qrCode: String,
  // Matches with other items
  potentialMatches: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    confidence: Number,
    matchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // User who posted the item
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Expiration date (items expire after 30 days by default)
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
itemSchema.index({ "location.coordinates": "2dsphere" });
itemSchema.index({ title: "text", description: "text", tags: "text" });
itemSchema.index({ status: 1, type: 1, category: 1 });
itemSchema.index({ expiresAt: 1 });

// Method to check if item is expired
itemSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to mark as resolved
itemSchema.methods.markAsResolved = function(resolvedByUserId) {
  this.status = 'resolved';
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedByUserId;
  return this.save();
};

// Method to add potential match
itemSchema.methods.addPotentialMatch = function(itemId, confidence) {
  const existingMatch = this.potentialMatches.find(
    match => match.itemId.toString() === itemId.toString()
  );
  
  if (!existingMatch) {
    this.potentialMatches.push({
      itemId,
      confidence
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find nearby items
itemSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

// Static method to find potential matches
itemSchema.statics.findPotentialMatches = function(itemId, type, category, coordinates) {
  const oppositeType = type === 'lost' ? 'found' : 'lost';
  
  return this.find({
    _id: { $ne: itemId },
    type: oppositeType,
    category: category,
    status: 'active',
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat]
        },
        $maxDistance: 50000 // 50km radius
      }
    }
  }).limit(10);
};

module.exports = mongoose.model('Item', itemSchema);
