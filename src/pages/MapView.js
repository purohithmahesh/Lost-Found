import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { 
  MapPinIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import ItemCard from '../components/items/ItemCard';
import CategoryFilter from '../components/items/CategoryFilter';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom markers
const lostIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="#ef4444"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const foundIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="#22c55e"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapView = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

  const categories = [
    'Electronics', 'Documents', 'Jewelry', 'Clothing', 
    'Pets', 'Books', 'Sports Equipment', 'Musical Instruments', 'Other'
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch items for map
  const { data: mapItems, isLoading } = useQuery(
    ['mapItems', selectedCategory, selectedType],
    async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedType) params.append('type', selectedType);
      params.append('limit', '100'); // Get more items for map view

      const response = await axios.get(`/api/items?${params}`);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const getMarkerIcon = (type) => {
    return type === 'lost' ? lostIcon : foundIcon;
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Map View</h1>
          <p className="text-gray-600 mb-6">
            Explore lost and found items in your area
          </p>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 ${viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <MapPinIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-error-500 rounded-full mr-2"></div>
                <span>Lost Items</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-2"></div>
                <span>Found Items</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}
          >
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value=""
                        checked={selectedType === ''}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="lost"
                        checked={selectedType === 'lost'}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Lost</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="found"
                        checked={selectedType === 'found'}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Found</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map/List Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading map..." />
              </div>
            ) : viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-soft overflow-hidden"
              >
                <div className="h-96 lg:h-[600px]">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User Location Marker */}
                    {userLocation && (
                      <Marker position={userLocation}>
                        <Popup>
                          <div className="text-center">
                            <div className="font-semibold">Your Location</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {/* Item Markers */}
                    {mapItems?.items?.map((item) => {
                      if (!item.location?.coordinates?.lat || !item.location?.coordinates?.lng) {
                        return null;
                      }
                      
                      return (
                        <Marker
                          key={item._id}
                          position={[item.location.coordinates.lat, item.location.coordinates.lng]}
                          icon={getMarkerIcon(item.type)}
                        >
                          <Popup>
                            <div className="max-w-xs">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(item.type)}`}>
                                  {item.type === 'lost' ? 'Lost' : 'Found'}
                                </span>
                                <span className="text-xs text-gray-500">{item.category}</span>
                              </div>
                              
                              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.title}
                              </h3>
                              
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                              
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                <span>
                                  {item.location.city}
                                  {item.location.state && `, ${item.location.state}`}
                                </span>
                              </div>
                              
                              <a
                                href={`/item/${item._id}`}
                                className="inline-block bg-primary-600 text-white text-xs px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                              >
                                View Details
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {mapItems?.items?.length > 0 ? (
                  mapItems.items.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or check back later for new items.
                    </p>
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

export default MapView;