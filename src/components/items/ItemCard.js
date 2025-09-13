import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const ItemCard = ({ item }) => {
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

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <span className="text-4xl">{getCategoryIcon(item.category)}</span>
          </div>
        )}
        
        {/* Type Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
          {item.type === 'lost' ? 'Lost' : 'Found'}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm">
          {item.category}
        </div>

        {/* Status Badge */}
        {item.status === 'resolved' && (
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-success-500 text-white">
            Resolved
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          <Link to={`/item/${item._id}`}>
            {item.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{item.location.city}, {item.location.state || item.location.country}</span>
        </div>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <ClockIcon className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{formatDistanceToNow(new Date(item.date), { addSuffix: true })}</span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-1" />
            <span>{item.views || 0} views</span>
          </div>
          
          {item.potentialMatches && item.potentialMatches.length > 0 && (
            <div className="flex items-center text-primary-600">
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span>{item.potentialMatches.length} matches</span>
            </div>
          )}
        </div>

        {/* Posted By */}
        {item.postedBy && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center">
              {item.postedBy.avatar ? (
                <img
                  src={item.postedBy.avatar}
                  alt={item.postedBy.name}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-primary-600">
                    {item.postedBy.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                Posted by {item.postedBy.name}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Link
            to={`/item/${item._id}`}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            View Details
          </Link>
          
          {item.status !== 'resolved' && (
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
              Contact
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;
