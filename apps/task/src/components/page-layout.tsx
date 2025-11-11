'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { useSidebar } from '@/components/sidebar-provider';
import { Task, TeamMember } from '@/lib/types';

interface PageLayoutProps {
  children: React.ReactNode;
  members: TeamMember[];
  tasks: Task[];
  title?: string;
  headerAction?: React.ReactNode;
  className?: string;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function PageLayout({ 
  children, 
  members, 
  tasks, 
  title, 
  headerAction,
  className = '',
  onSearchChange,
  searchQuery
}: PageLayoutProps) {
  const { collapsed: sidebarCollapsed, mobileOpen, toggleMobile, closeMobile } = useSidebar();

  // Close mobile sidebar when clicking on backdrop
  useEffect(() => {
    if (mobileOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.sidebar-container') && !target.closest('.sidebar-toggle')) {
          closeMobile();
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileOpen, closeMobile]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white flex-shrink-0 border-b border-gray-200">
        <Navbar tasks={tasks} onToggleSidebar={toggleMobile} onSearchChange={onSearchChange} searchQuery={searchQuery} />
      </div>
      
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      <div className="flex min-h-screen max-w-[1600px] mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block bg-white border-r border-gray-200 transition-all duration-300 sidebar-container" style={{ width: sidebarCollapsed ? '50px' : '200px' }}>
          <Sidebar members={members} tasks={tasks} collapsed={sidebarCollapsed ?? false} />
        </aside>

        {/* Mobile Sidebar */}
        <aside 
          className={`fixed top-0 left-0 h-full z-50 lg:hidden sidebar-container transition-transform duration-300 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ width: '280px', backgroundColor: '#076297' }}
        >
          <Sidebar members={members} tasks={tasks} collapsed={false} />
        </aside>

        {/* Main Content */}
        <div className={`flex flex-col min-w-0 flex-1 ${className}`}>
          <div className="p-3 sm:p-4 pb-6 sm:pb-8">
            {/* Header with title and action button */}
            {(title || headerAction) && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                {title && (
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {title}
                  </h2>
                )}
                {headerAction && (
                  <div className="w-full sm:w-auto">
                    {headerAction}
                  </div>
                )}
              </div>
            )}
            
            {/* Page content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
