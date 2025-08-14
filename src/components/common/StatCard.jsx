import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  accentColor = 'bg-green-500', 
  subtext, 
  percentageChange,
  changeType = 'positive' // 'positive', 'negative', 'neutral'
}) {
  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return null;
    }
  };

  const ChangeIcon = getChangeIcon(changeType);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <div className={`p-3 rounded-full ${accentColor}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          
          {subtext && (
            <p className="text-sm text-gray-500 mb-2">{subtext}</p>
          )}
          
          {percentageChange && (
            <div className={`flex items-center text-sm font-medium ${getChangeColor(changeType)}`}>
              {ChangeIcon && <ChangeIcon className="w-4 h-4 mr-1" />}
              <span>{percentageChange}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
