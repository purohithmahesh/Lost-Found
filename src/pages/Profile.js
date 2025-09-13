import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon,
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrophyIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ItemCard from '../components/items/ItemCard';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || ''
    }
  });

  // Fetch user's items
  const { data: userItems, isLoading: itemsLoading } = useQuery(
    ['userItems', user?._id],
    async () => {
      const response = await axios.get(`/api/users/${user._id}/items`);
      return response.data;
    },
    {
      enabled: !!user?._id,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch user stats
  const { data: userStats } = useQuery(
    ['userStats', user?._id],
    async () => {
      const response = await axios.get(`/api/users/${user._id}/stats`);
      return response.data;
    },
    {
      enabled: !!user?._id,
      refetchOnWindowFocus: false,
    }
  );

  const onSubmitProfile = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'items', name: 'My Items', icon: ChatBubbleLeftRightIcon },
    { id: 'stats', name: 'Statistics', icon: TrophyIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft p-6 mb-8"
        >
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserCircleIcon className="h-16 w-16 text-primary-600" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              {user?.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
              {user?.location && (
                <div className="flex items-center text-gray-500 mt-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmitProfile)}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-soft p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: 'Name is required' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          {...register('email', { required: 'Email is required' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          {...register('location')}
                          placeholder="City, Country"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <p className="text-gray-900">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                    </div>

                    {user?.bio && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <p className="text-gray-900">{user.bio}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user?.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <p className="text-gray-900">{user.phone}</p>
                        </div>
                      )}
                      {user?.location && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                          <p className="text-gray-900">{user.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'items' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-soft p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Items</h2>
                
                {itemsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : userItems?.items?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userItems.items.map((item) => (
                      <ItemCard key={item._id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You haven't posted any items yet.</p>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">
                      Post Your First Item
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-soft p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics</h2>
                
                {userStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-primary-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary-600 mb-2">
                        {userStats.totalItems || 0}
                      </div>
                      <div className="text-sm text-gray-600">Items Posted</div>
                    </div>
                    
                    <div className="text-center p-4 bg-success-50 rounded-lg">
                      <div className="text-2xl font-bold text-success-600 mb-2">
                        {userStats.resolvedItems || 0}
                      </div>
                      <div className="text-sm text-gray-600">Items Resolved</div>
                    </div>
                    
                    <div className="text-center p-4 bg-warning-50 rounded-lg">
                      <div className="text-2xl font-bold text-warning-600 mb-2">
                        {userStats.totalViews || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </div>
                    
                    <div className="text-center p-4 bg-secondary-50 rounded-lg">
                      <div className="text-2xl font-bold text-secondary-600 mb-2">
                        {userStats.totalLikes || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Likes</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
