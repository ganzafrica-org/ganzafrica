"use client";

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
          <Navbar onMenuClick={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    );
  }
  