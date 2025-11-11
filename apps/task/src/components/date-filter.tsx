"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { CalendarDays, Filter, X } from "lucide-react";

interface DateFilterProps {
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: Dispatch<SetStateAction<{ start: string; end: string }>>;
  className?: string;
}

export function DateFilter({
  dateFilter,
  setDateFilter,
  customDateRange,
  setCustomDateRange,
  className = ""
}: DateFilterProps) {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Close date filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDateFilter && !target.closest('.date-filter-container')) {
        setShowDateFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateFilter]);

  const handleFilterChange = (filter: string) => {
    setDateFilter(filter);
    setCustomDateRange({ start: '', end: '' }); // Clear custom range
    setShowDateFilter(false);
  };

  const handleCustomDateApply = () => {
    if (customDateRange.start && customDateRange.end) {
      // Validate that start date is not after end date
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      
      if (startDate <= endDate) {
        setDateFilter('custom');
        setShowCustomDateModal(false); // Close the modal
      } else {
        alert('Start date cannot be after end date');
      }
    }
  };

  return (
    <div className={`relative date-filter-container ${className}`}>
      <button
        onClick={() => setShowDateFilter(!showDateFilter)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation w-full sm:w-auto"
      >
        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="truncate">
          {dateFilter === 'all' && 'All Time'}
          {dateFilter === 'week' && 'This Week'}
          {dateFilter === 'month' && 'This Month'}
          {dateFilter === 'custom' && (
            customDateRange.start && customDateRange.end 
              ? `${new Date(customDateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customDateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : 'Custom Range'
          )}
        </span>
        <Filter className="w-3 h-3 flex-shrink-0" />
      </button>
      
      {/* Date Filter Dropdown */}
      {showDateFilter && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
                dateFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handleFilterChange('week')}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
                dateFilter === 'week' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => handleFilterChange('month')}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
                dateFilter === 'month' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => {
                setShowCustomDateModal(true);
                setShowDateFilter(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation ${
                dateFilter === 'custom' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-sm" style={{ borderRadius: '7px' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#1f2937' }}>Custom Date Range</h3>
              <button
                onClick={() => setShowCustomDateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange((prev: { start: string; end: string }) => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange((prev: { start: string; end: string }) => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  onClick={() => {
                    setDateFilter('all');
                    setCustomDateRange({ start: '', end: '' });
                    setShowCustomDateModal(false);
                  }}
                  className="px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm touch-manipulation order-3 sm:order-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCustomDateModal(false)}
                  className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm touch-manipulation order-2 sm:order-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomDateApply}
                  disabled={!customDateRange.start || !customDateRange.end}
                  className="px-4 py-2.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation order-1 sm:order-3 sm:flex-1"
                  style={{ 
                    backgroundColor: (!customDateRange.start || !customDateRange.end) ? '#9ca3af' : '#076297',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#065a87';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#076297';
                    }
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
