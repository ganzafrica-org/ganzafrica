"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutGrid,
  FolderGit2,
  Briefcase,
  Users2,
  FileText,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <div className={`fixed left-0 top-0 h-full bg-[#045F3C] text-white transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center space-x-2">
            {!isCollapsed ? (
              <Image
                src="/images/logoLight.png"
                alt="GanzAfrica"
                width={150}
                height={40}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src="/images/logoLight.png"
                alt="GanzAfrica"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            )}
          </div>
        </div>

        {/* Menu Sections */}
        <div className="flex-1 px-4">
          {/* Main Menu */}
          <div className="mb-8">
            {!isCollapsed && <h2 className="font-bold-paragraph px-4 mb-4 text-white/80">Main Menu</h2>}
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/dashboard' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Dashboard</span>}
              </Link>
              
              {/* Projects link with exact pathname check */}
              <Link
                href="/projects"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/projects' || pathname.startsWith('/projects/') ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <FolderGit2 className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Projects</span>}
              </Link>
              
              <Link
                href="/opportunities"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/opportunities' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Opportunities</span>}
              </Link>
              
              {/* Users link with exact pathname check */}
              <Link
                href="/users"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/users' || pathname.startsWith('/users/') ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Users2 className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Manage users</span>}
              </Link>
              
              <Link
                href="/news"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/news' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <FileText className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">News & Updates</span>}
              </Link>
            </nav>
          </div>

          {/* Help & Support */}
          <div className="mb-8">
            {!isCollapsed && <h2 className="font-bold-paragraph px-4 mb-4 text-white/80">Help & Support</h2>}
            <nav className="space-y-1">
              <Link
                href="/settings"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/settings' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Settings className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Settings</span>}
              </Link>
              <Link
                href="/help"
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 rounded-lg ${
                  pathname === '/help' ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                {!isCollapsed && <span className="font-bold-paragraph">Help</span>}
              </Link>
            </nav>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full`}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-bold-paragraph">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;