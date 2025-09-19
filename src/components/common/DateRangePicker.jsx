import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Download, Filter } from 'lucide-react';
import analyticsAPI from '../../services/analyticsAPI';

const DateRangePicker = ({ 
  onDateRangeChange, 
  onGroupByChange, 
  initialStartDate, 
  initialEndDate,
  initialGroupBy = 'day',
  showGroupBy = true 
}) => {
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [groupBy, setGroupBy] = useState(initialGroupBy);
  const [showPresets, setShowPresets] = useState(false);
  const [customRange, setCustomRange] = useState(false);

  const dateRanges = analyticsAPI.getDateRanges();

  useEffect(() => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateRangeChange]);

  useEffect(() => {
    if (showGroupBy && onGroupByChange) {
      onGroupByChange(groupBy);
    }
  }, [groupBy, onGroupByChange, showGroupBy]);

  const handlePresetSelect = (preset) => {
    setStartDate(preset.start);
    setEndDate(preset.end);
    setShowPresets(false);
    setCustomRange(false);
  };

  const handleCustomRange = () => {
    setCustomRange(true);
    setShowPresets(false);
  };

  const getCurrentRangeLabel = () => {
    if (!startDate || !endDate) return 'Select Date Range';
    
    const preset = Object.values(dateRanges).find(
      range => range.start === startDate && range.end === endDate
    );
    
    if (preset) {
      return preset.label;
    }
    
    return `${startDate} to ${endDate}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      {/* Date Range Selector */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{getCurrentRangeLabel()}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>

        {showPresets && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="space-y-1">
                {Object.entries(dateRanges).map(([key, range]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(range)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
                <hr className="my-2" />
                <button
                  onClick={handleCustomRange}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors font-medium text-blue-600"
                >
                  Custom Range
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Date Inputs */}
      {customRange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Group By Selector */}
      {showGroupBy && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Group by Day</option>
            <option value="week">Group by Week</option>
            <option value="month">Group by Month</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;