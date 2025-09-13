const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  bio: {
    type: String,
    maxlength: 500
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Gamification features
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  level: {
    type: Number,
    default: 1
  },
  // Statistics
  itemsPosted: {
    type: Number,
    default: 0
  },
  itemsReturned: {
    type: Number,
    default: 0
  },
  helpfulRating: {
    type: Number,
    default: 0
  },
  // Preferences
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    matches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add points and check for level ups
userSchema.methods.addPoints = function(points) {
  this.points += points;
  
  // Level up logic
  const newLevel = Math.floor(this.points / 100) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Add level up badge
    this.badges.push({
      name: `Level ${newLevel}`,
      description: `Reached level ${newLevel}!`
    });
  }
  
  return this.save();
};

// Method to add badge
userSchema.methods.addBadge = function(badgeName, description) {
  const existingBadge = this.badges.find(badge => badge.name === badgeName);
  if (!existingBadge) {
    this.badges.push({
      name: badgeName,
      description: description
    });
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema);
