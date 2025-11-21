"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/lib/auth/auth-provider';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isLoading, isAuthenticated } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#045F3C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
      window.location.href = `${portalUrl}/login?user=alumni`;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-900">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'pl-20' : 'pl-64'
      }`}>
        <Navbar onMenuClick={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
        <main className="min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
