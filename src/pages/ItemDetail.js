import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  MapPinIcon, 
  ClockIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  HeartIcon,
  FlagIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Fetch item details
  const { data: item, isLoading, error } = useQuery(
    ['item', id],
    async () => {
      const response = await axios.get(`/api/items/${id}`);
      return response.data;
    },
    {
      onError: (error) => {
        if (error.response?.status === 404) {
          toast.error('Item not found');
          navigate('/');
        }
      }
    }
  );

  // Increment view count
  const viewMutation = useMutation(
    () => axios.post(`/api/items/${id}/view`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['item', id]);
      }
    }
  );

  // Like/Unlike item
  const likeMutation = useMutation(
    () => axios.post(`/api/items/${id}/like`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['item', id]);
        toast.success(item?.isLiked ? 'Removed from favorites' : 'Added to favorites');
      },
      onError: () => {
        toast.error('Please login to like items');
      }
    }
  );

  // Contact owner
  const contactMutation = useMutation(
    (message) => axios.post(`/api/items/${id}/contact`, { message }),
    {
      onSuccess: () => {
        toast.success('Message sent successfully!');
        setShowContactModal(false);
        setContactMessage('');
      }
    }
  );

  useEffect(() => {
    if (item && isAuthenticated) {
      viewMutation.mutate();
    }
  }, [item, isAuthenticated]);

  const getTypeColor = (type) => {
    return type === 'lost' 
      ? 'bg-error-100 text-error-800 border-error-200' 
      : 'bg-success-100 text-success-800 border-success-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Documents': '📄',
      'Jewelry': '💍',
      'Clothing': '👕',
      'Pets': '🐾',
      'Books': '📚',
      'Sports Equipment': '⚽',
      'Musical Instruments': '🎸',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the owner');
      return;
    }
    setShowContactModal(true);
  };

  const handleSubmitContact = () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    contactMutation.mutate(contactMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading item details..." />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <p className="text-gray-600 mb-8">The item you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-soft overflow-hidden"
            >
              {item.images && item.images.length > 0 ? (
                <div>
                  {/* Main Image */}
                  <div className="relative h-96 bg-gray-100">
                    <img
                      src={item.images[selectedImage]?.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {item.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {item.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              index === selectedImage ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {item.images.length > 1 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2 overflow-x-auto">
                        {item.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                              index === selectedImage ? 'border-primary-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={`${item.title} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="text-center">
                    <span className="text-6xl mb-4 block">{getCategoryIcon(item.category)}</span>
                    <p className="text-gray-500">No images available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Item Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(item.type)}`}>
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                      {item.category}
                    </span>
                    {item.status === 'resolved' && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-800">
                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>
                  
                  <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Item Stats */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>{item.views || 0} views</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>{item.likes || 0} likes</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                  <span>{item.contactCount || 0} contacts</span>
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Location
              </h2>
              <div className="space-y-2">
                {item.location.address && (
                  <p className="text-gray-700">{item.location.address}</p>
                )}
                <p className="text-gray-700">
                  {item.location.city}
                  {item.location.state && `, ${item.location.state}`}
                  {item.location.country && `, ${item.location.country}`}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Posted By */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posted By</h3>
              <div className="flex items-center space-x-3">
                {item.postedBy?.avatar ? (
                  <img
                    src={item.postedBy.avatar}
                    alt={item.postedBy.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.postedBy?.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                {item.status !== 'resolved' && (
                  <button
                    onClick={handleContact}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Contact Owner
                  </button>
                )}

                <button
                  onClick={() => likeMutation.mutate()}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  {item.isLiked ? (
                    <HeartSolidIcon className="h-4 w-4 mr-2 text-red-500" />
                  ) : (
                    <HeartIcon className="h-4 w-4 mr-2" />
                  )}
                  {item.isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </motion.div>

            {/* Contact Info */}
            {item.contactInfo && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-soft p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {item.contactInfo.phone && (
                    <div className="flex items-center text-gray-700">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span>{item.contactInfo.phone}</span>
                    </div>
                  )}
                  {item.contactInfo.email && (
                    <div className="flex items-center text-gray-700">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      <span>{item.contactInfo.email}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Preferred contact: {item.contactInfo.preferredContact}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitContact}
                disabled={contactMutation.isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {contactMutation.isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
