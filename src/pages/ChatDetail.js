import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  UserCircleIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ChatDetail = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, setMessages, sendMessage, markAsRead } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch chat details
  const { data: chat, isLoading: chatLoading } = useQuery(
    ['chat', chatId],
    async () => {
      const response = await axios.get(`/api/chat/${chatId}`);
      return response.data;
    },
    {
      enabled: !!chatId,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setMessages(data.messages || []);
      }
    }
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat && user) {
      const unreadMessages = messages.filter(msg => 
        msg.sender._id !== user._id && !msg.readBy?.includes(user._id)
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(chatId, msg._id);
      });
    }
  }, [chat, messages, user, chatId, markAsRead]);

  const getOtherUser = () => {
    if (!chat) return null;
    return chat.participants.find(p => p._id !== user._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage(chatId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-error-100 text-error-800 border-error-200' 
      : 'bg-success-100 text-success-800 border-success-200';
  };

  if (chatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading conversation..." />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversation Not Found</h1>
          <p className="text-gray-600 mb-8">This conversation doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chat')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>

            {/* Other User Info */}
            <div className="flex items-center space-x-3 flex-1">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-primary-600" />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">{otherUser?.name}</h2>
                <p className="text-sm text-gray-500">
                  {otherUser?.isOnline ? 'Online' : 'Last seen recently'}
                </p>
              </div>
            </div>

            {/* Item Info */}
            {chat.item && (
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(chat.item.type)}`}>
                    {chat.item.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <span className="text-xs text-gray-500">{chat.item.category}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {chat.item.title}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-soft h-96 lg:h-[500px] flex flex-col"
            >
              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map((message, index) => {
                    const isOwn = message.sender._id === user._id;
                    const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          {!isOwn && showAvatar && (
                            <div className="flex-shrink-0 mr-2">
                              {message.sender.avatar ? (
                                <img
                                  src={message.sender.avatar}
                                  alt={message.sender.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                                  <UserCircleIcon className="h-4 w-4 text-primary-600" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!isOwn && !showAvatar && (
                            <div className="w-6 mr-2"></div>
                          )}

                          {/* Message Bubble */}
                          <div className={`px-4 py-2 rounded-lg ${
                            isOwn 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwn ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💬</div>
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <PaperAirplaneIcon className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Item Details Sidebar */}
          {chat.item && (
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-soft p-6 sticky top-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
                
                {/* Item Image */}
                {chat.item.images && chat.item.images.length > 0 ? (
                  <img
                    src={chat.item.images[0].url}
                    alt={chat.item.title}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                )}

                {/* Item Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{chat.item.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{chat.item.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(chat.item.type)}`}>
                      {chat.item.type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span className="text-xs text-gray-500">{chat.item.category}</span>
                  </div>

                  {chat.item.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>
                        {chat.item.location.city}
                        {chat.item.location.state && `, ${chat.item.location.state}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span>{chat.item.views || 0} views</span>
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="h-4 w-4 mr-1" />
                      <span>{chat.item.likes || 0} likes</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/item/${chat.item._id}`)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;