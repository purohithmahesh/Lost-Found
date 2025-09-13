const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'location', 'system'],
    default: 'text'
  },
  // For image messages
  imageUrl: String,
  imageCaption: String,
  // For location messages
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  // Message status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message metadata
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  // For system messages (e.g., "Item has been found")
  systemAction: {
    type: String,
    enum: ['item_found', 'item_returned', 'chat_started', 'other']
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Method to mark message as read by a specific user
messageSchema.methods.markAsRead = function(userId) {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
  
  const existingRead = this.readBy.find(
    read => read.userId.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      userId: userId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Method to check if message is read by a specific user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(
    read => read.userId.toString() === userId.toString()
  );
};

// Static method to get unread message count for a user in a chat
messageSchema.statics.getUnreadCount = function(chatId, userId) {
  return this.countDocuments({
    chatId: chatId,
    sender: { $ne: userId },
    readBy: { $not: { $elemMatch: { userId: userId } } }
  });
};

// Pre-save middleware to update chat's last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Chat = require('./Chat');
      await Chat.findByIdAndUpdate(this.chatId, {
        lastMessage: {
          content: this.content,
          sender: this.sender,
          timestamp: this.createdAt
        },
        lastActivity: this.createdAt
      });
      
      // Increment unread count for other participants
      const chat = await Chat.findById(this.chatId);
      if (chat) {
        chat.participants.forEach(participantId => {
          if (participantId.toString() !== this.sender.toString()) {
            chat.incrementUnread(participantId);
          }
        });
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Message', messageSchema);
