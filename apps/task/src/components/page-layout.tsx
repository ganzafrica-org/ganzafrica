'use client';

import React from 'react';
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
}

export function PageLayout({ 
  children, 
  members, 
  tasks, 
  title, 
  headerAction,
  className = ''
}: PageLayoutProps) {
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white flex-shrink-0">
        <Navbar tasks={tasks} onToggleSidebar={toggleCollapsed} />
      </div>
      <div className={`grid min-h-screen max-w-[1600px] mx-auto transition-all duration-300 ${sidebarCollapsed ? 'grid-cols-[50px_1fr]' : 'grid-cols-[200px_1fr]'}`}>
        <aside className="bg-white overflow-visible">
          <Sidebar members={members} tasks={tasks} collapsed={sidebarCollapsed ?? false} />
        </aside>
        <div className={`flex flex-col min-w-0 min-h-screen ${className}`}>
          <div className="p-4 pb-8">
            {/* Header with title and action button */}
            {(title || headerAction) && (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
                {title && (
                  <h2 className="text-2xl font-bold text-gray-800">
                    {title}
                  </h2>
                )}
                {headerAction && (
                  <div>
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
