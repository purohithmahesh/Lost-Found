const express = require('express');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/chat
// @desc    Get user's chats
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId,
      isActive: true
    })
    .populate('participants', 'name avatar')
    .populate('itemId', 'title images type category')
    .populate('lastMessage.sender', 'name avatar')
    .sort({ lastActivity: -1 });

    // Add unread count for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.getUnreadCount(chat._id, req.user.userId);
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.json(chatsWithUnreadCount);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/start
// @desc    Start a new chat for an item
// @access  Private
router.post('/start', auth, async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is not the item owner
    if (item.postedBy.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot start chat with yourself' });
    }

    // Find or create chat
    const chat = await Chat.findOrCreate(
      req.user.userId,
      item.postedBy,
      itemId
    );

    // If this is a new chat and there's an initial message, send it
    if (message && chat.lastMessage.content !== message) {
      const newMessage = new Message({
        chatId: chat._id,
        sender: req.user.userId,
        content: message,
        messageType: 'text'
      });

      await newMessage.save();
    }

    // Populate chat data
    const populatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name avatar')
      .populate('itemId', 'title images type category')
      .populate('lastMessage.sender', 'name avatar');

    res.json({
      message: 'Chat started successfully',
      chat: populatedChat
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/:chatId/messages
// @desc    Get messages for a specific chat
// @access  Private
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Get messages with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await Message.find({ chatId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({ chatId });

    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user.userId },
        readBy: { $not: { $elemMatch: { userId: req.user.userId } } }
      },
      {
        $push: {
          readBy: {
            userId: req.user.userId,
            readAt: new Date()
          }
        }
      }
    );

    // Update chat's unread count
    await chat.markAsRead(req.user.userId);

    res.json({
      messages: messages.reverse(), // Show oldest first
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMessages: total,
        hasNext: skip + messages.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message in a chat
// @access  Private
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', imageUrl, imageCaption, location } = req.body;

    // Check if user is participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create new message
    const messageData = {
      chatId,
      sender: req.user.userId,
      content,
      messageType
    };

    if (messageType === 'image' && imageUrl) {
      messageData.imageUrl = imageUrl;
      messageData.imageCaption = imageCaption;
    }

    if (messageType === 'location' && location) {
      messageData.location = location;
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender info
    await message.populate('sender', 'name avatar');

    // Emit socket event for real-time messaging
    const io = req.app.get('io');
    io.to(chatId).emit('receive-message', {
      message,
      chatId
    });

    res.json({
      message: 'Message sent successfully',
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/:chatId/read
// @desc    Mark chat as read
// @access  Private
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    await chat.markAsRead(req.user.userId);

    res.json({ message: 'Chat marked as read' });
  } catch (error) {
    console.error('Mark chat as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/chat/:chatId
// @desc    Delete/archive a chat
// @access  Private
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this chat' });
    }

    // Archive the chat instead of deleting
    chat.isActive = false;
    await chat.save();

    res.json({ message: 'Chat archived successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count for user
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.userId,
      isActive: true
    });

    let totalUnread = 0;
    for (const chat of chats) {
      const unreadCount = await Message.getUnreadCount(chat._id, req.user.userId);
      totalUnread += unreadCount;
    }

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
