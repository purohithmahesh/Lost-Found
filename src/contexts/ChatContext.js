import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (socket && user) {
      // Listen for new messages
      socket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for message updates
      socket.on('messageUpdated', (updatedMessage) => {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      });

      return () => {
        socket.off('newMessage');
        socket.off('messageUpdated');
      };
    }
  }, [socket, user]);

  const sendMessage = async (chatId, content, type = 'text') => {
    if (!socket || !user) return;

    const message = {
      chatId,
      content,
      type,
      sender: user._id,
      timestamp: new Date().toISOString()
    };

    // Optimistically add message to UI
    setMessages(prev => [...prev, message]);

    // Emit to server
    socket.emit('sendMessage', message);
  };

  const markAsRead = async (chatId, messageId) => {
    if (!socket) return;

    socket.emit('markAsRead', { chatId, messageId });
  };

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    setActiveChat,
    setChats,
    setMessages,
    sendMessage,
    markAsRead
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
