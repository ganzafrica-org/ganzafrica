'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps): React.JSX.Element {
  return (
    <div className={`flex flex-wrap gap-1 sm:gap-2 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all relative touch-manipulation ${
            activeTab === tab.id
              ? ''
              : 'text-gray-500 hover:text-gray-700'
          }`}
          style={{
            color: activeTab === tab.id ? '#076297' : undefined,
          }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-[3px]"
              style={{ 
                backgroundColor: '#076297',
                borderRadius: '3px 3px 0 0'
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
