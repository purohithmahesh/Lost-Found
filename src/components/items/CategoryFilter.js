import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    onCategoryChange(category === selectedCategory ? '' : category);
    setIsOpen(false);
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      >
        <span>
          {selectedCategory ? (
            <span className="flex items-center space-x-2">
              <span>{getCategoryIcon(selectedCategory)}</span>
              <span>{selectedCategory}</span>
            </span>
          ) : (
            'All Categories'
          )}
        </span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* All Categories Option */}
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                !selectedCategory
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>All Categories</span>
              </span>
            </button>

            <hr className="my-2" />

            {/* Category Options */}
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryFilter;
