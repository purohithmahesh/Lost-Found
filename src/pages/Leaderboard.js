import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  TrophyIcon,
  StarIcon,
  UserGroupIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'month', 'week'
  const [category, setCategory] = useState('all'); // 'all', 'helpers', 'posters', 'resolvers'

  const categories = [
    { id: 'all', name: 'Overall', icon: TrophyIcon },
    { id: 'helpers', name: 'Top Helpers', icon: HeartIcon },
    { id: 'posters', name: 'Most Active', icon: UserGroupIcon },
    { id: 'resolvers', name: 'Problem Solvers', icon: CheckCircleIcon }
  ];

  const timeframes = [
    { id: 'all', name: 'All Time' },
    { id: 'month', name: 'This Month' },
    { id: 'week', name: 'This Week' }
  ];

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading } = useQuery(
    ['leaderboard', timeframe, category],
    async () => {
      const params = new URLSearchParams();
      if (timeframe !== 'all') params.append('timeframe', timeframe);
      if (category !== 'all') params.append('category', category);
      
      const response = await axios.get(`/api/users/leaderboard?${params}`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophySolidIcon className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <TrophySolidIcon className="h-6 w-6 text-gray-400" />;
      case 3:
        return <TrophySolidIcon className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gray-100';
    }
  };

  const getScoreLabel = (category, user) => {
    switch (category) {
      case 'helpers':
        return `${user.helpCount || 0} helps`;
      case 'posters':
        return `${user.itemsPosted || 0} items`;
      case 'resolvers':
        return `${user.itemsResolved || 0} resolved`;
      default:
        return `${user.totalScore || 0} points`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <TrophyIcon className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Celebrate the community members who are making a difference by helping others find their lost items
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-soft p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                      category === cat.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <cat.icon className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeframe Filter */}
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-3">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {timeframes.map((tf) => (
                  <option key={tf.id} value={tf.id}>{tf.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading leaderboard..." />
          </div>
        ) : leaderboardData?.users?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Top 3 Podium */}
            {leaderboardData.users.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[2, 1, 3].map((rank) => {
                  const user = leaderboardData.users[rank - 1];
                  if (!user) return null;
                  
                  return (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: rank * 0.1 }}
                      className={`relative bg-white rounded-lg shadow-soft p-6 ${
                        rank === 1 ? 'md:order-2 md:scale-110' : rank === 2 ? 'md:order-1' : 'md:order-3'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getRankColor(rank)}`}>
                          {getRankIcon(rank)}
                        </div>
                      </div>

                      <div className="text-center pt-4">
                        {/* Avatar */}
                        <div className="mx-auto mb-4">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-16 h-16 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                              <span className="text-2xl font-bold text-primary-600">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{getScoreLabel(category, user)}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{user.itemsPosted || 0}</div>
                            <div className="text-gray-500">Posted</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{user.itemsResolved || 0}</div>
                            <div className="text-gray-500">Resolved</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{user.helpCount || 0}</div>
                            <div className="text-gray-500">Helped</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Rest of the Leaderboard */}
            <div className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Community Rankings</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {leaderboardData.users.slice(3).map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 4) * 0.05 }}
                    className="flex items-center p-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-lg font-bold text-gray-600">#{index + 4}</span>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0 mx-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-600">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <p className="text-sm text-gray-600">{getScoreLabel(category, user)}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span>{user.itemsPosted || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span>{user.itemsResolved || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        <span>{user.helpCount || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600">
              There's not enough data to generate a leaderboard yet. Check back later!
            </p>
          </motion.div>
        )}

        {/* Community Stats */}
        {leaderboardData?.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-lg shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {leaderboardData.stats.totalUsers || 0}
              </div>
              <div className="text-gray-600">Community Members</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-success-600 mb-2">
                {leaderboardData.stats.totalItems || 0}
              </div>
              <div className="text-gray-600">Items Posted</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-warning-600 mb-2">
                {leaderboardData.stats.totalResolved || 0}
              </div>
              <div className="text-gray-600">Items Resolved</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-soft p-6 text-center">
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {leaderboardData.stats.successRate || 0}%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;