import React from 'react';
import { RestaurantLogo } from './RestaurantLogo';

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#6B0000] mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RestaurantLogo className="w-6 h-6" fillColor="#C92E33" />
          </div>
        </div>
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        <p className="text-gray-400 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}
