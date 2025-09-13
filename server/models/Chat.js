const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Chat metadata
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure participants array has unique values
chatSchema.index({ participants: 1, itemId: 1 }, { unique: true });

// Method to mark messages as read for a specific user
chatSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  this.lastActivity = new Date();
  return this.save();
};

// Method to increment unread count for a specific user
chatSchema.methods.incrementUnread = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  this.lastActivity = new Date();
  return this.save();
};

// Static method to find or create chat between users for an item
chatSchema.statics.findOrCreate = async function(userId1, userId2, itemId) {
  const participants = [userId1, userId2].sort();
  
  let chat = await this.findOne({
    participants: { $all: participants },
    itemId: itemId
  });
  
  if (!chat) {
    chat = new this({
      participants: participants,
      itemId: itemId
    });
    await chat.save();
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
