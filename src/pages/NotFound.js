import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white rounded-lg shadow-large p-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl mb-6"
          >
            🔍
          </motion.div>
          
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. 
            Let's help you find what you're looking for.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go back home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try one of these:</p>
              <div className="flex justify-center space-x-4 mt-2">
                <Link to="/search" className="text-primary-600 hover:text-primary-700">
                  Search Items
                </Link>
                <Link to="/map" className="text-primary-600 hover:text-primary-700">
                  Map View
                </Link>
                <Link to="/leaderboard" className="text-primary-600 hover:text-primary-700">
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
