import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  PlusIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ItemCard from '../components/items/ItemCard';
import CategoryFilter from '../components/items/CategoryFilter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TestAuth from '../components/TestAuth';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch recent items
  const { data: recentItems, isLoading } = useQuery(
    ['recentItems', selectedCategory, selectedType],
    async () => {
      const params = new URLSearchParams({
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      
      const response = await axios.get(`/api/items?${params}`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch global stats
  const { data: stats } = useQuery(
    'globalStats',
    async () => {
      const response = await axios.get('/api/users/stats/global');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams({ search: searchQuery.trim() });
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      navigate(`/search?${params}`);
    }
  };

  const handlePostItem = () => {
    navigate('/post');
  };

  const categories = [
    'Electronics', 'Documents', 'Jewelry', 'Clothing', 
    'Pets', 'Books', 'Sports Equipment', 'Musical Instruments', 'Other'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Lost & Found Community
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Help others find their lost items and get help finding yours. 
              Together we can make our community stronger.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for lost or found items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full transition-colors"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handlePostItem}
                className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Post Lost Item
              </button>
              <button
                onClick={() => navigate('/map')}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                View Map
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Community Impact
              </h2>
              <p className="text-lg text-gray-600">
                See how our community is helping each other
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stats.totalUsers?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Community Members</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-success-600 mb-2">
                  {stats.totalItems?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Items Posted</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-warning-600 mb-2">
                  {stats.successRate || '0'}%
                </div>
                <div className="text-gray-600">Success Rate</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-secondary-600 mb-2">
                  {stats.totalResolved?.toLocaleString() || '0'}
                </div>
                <div className="text-gray-600">Items Returned</div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Test Authentication Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TestAuth />
        </div>
      </section>

      {/* Recent Items Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recent Lost & Found Items
            </h2>
            <p className="text-lg text-gray-600">
              Latest items posted by our community
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('lost')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'lost' 
                    ? 'bg-error-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => setSelectedType('found')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'found' 
                    ? 'bg-success-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Found
              </button>
            </div>
          </div>

          {/* Items Grid */}
          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {recentItems?.items?.map((item) => (
                <motion.div key={item._id} variants={itemVariants}>
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          {recentItems?.items?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <button
                onClick={() => navigate('/search')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
              >
                View All Items
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Help Your Community?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of people helping each other find lost items and reunite them with their owners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/leaderboard')}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-700 transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
