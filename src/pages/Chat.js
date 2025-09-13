import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Chat = () => {
  const { user } = useAuth();
  const { chats, setChats, setActiveChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's chats
  const { data: userChats, isLoading } = useQuery(
    ['userChats', user?._id],
    async () => {
      const response = await axios.get('/api/chat');
      return response.data;
    },
    {
      enabled: !!user?._id,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setChats(data.chats || []);
      }
    }
  );

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    
    const otherUser = chat.participants.find(p => p._id !== user._id);
    const itemTitle = chat.item?.title || '';
    
    return (
      otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getOtherUser = (chat) => {
    return chat.participants.find(p => p._id !== user._id);
  };

  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) {
      return { content: 'No messages yet', timestamp: chat.updatedAt };
    }
    return chat.messages[chat.messages.length - 1];
  };

  const getUnreadCount = (chat) => {
    if (!chat.messages) return 0;
    return chat.messages.filter(msg => 
      msg.sender._id !== user._id && !msg.readBy?.includes(user._id)
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
          <p className="text-gray-600 mb-6">
            Connect with other users about lost and found items
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </motion.div>

        {/* Chat List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading conversations..." />
          </div>
        ) : filteredChats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredChats.map((chat, index) => {
              const otherUser = getOtherUser(chat);
              const lastMessage = getLastMessage(chat);
              const unreadCount = getUnreadCount(chat);

              return (
                <motion.div
                  key={chat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveChat(chat)}
                  className="bg-white rounded-lg shadow-soft p-6 cursor-pointer hover:shadow-medium transition-all duration-200 border border-gray-100"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      {otherUser?.avatar ? (
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserCircleIcon className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                      
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>
                            {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Item Title */}
                      {chat.item && (
                        <div className="flex items-center text-sm text-primary-600 mb-1">
                          <span className="truncate">Re: {chat.item.title}</span>
                        </div>
                      )}

                      {/* Last Message */}
                      <p className={`text-sm truncate ${
                        unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        {lastMessage.content}
                      </p>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex flex-col items-end space-y-1">
                      {unreadCount > 0 && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                      
                      {chat.item && (
                        <div className="flex items-center text-xs text-gray-500">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          <span>{chat.item.views || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a conversation by contacting someone about their lost or found item'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
              >
                Browse Items
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Chat;