"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  LayoutGrid,
  FolderGit2,
  Briefcase,
  Users2,
  FileText,
  MessageSquareQuote,
  HelpCircle,
  Tag,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  useEffect(() => {
    // Auto-open dropdowns based on active route
    if (pathname === '/projects' || pathname.startsWith('/projects/') ||
        pathname === '/categories' || pathname.startsWith('/categories/')) {
      setProjectsOpen(true);
    }
    if (pathname === '/users' || pathname.startsWith('/users/') ||
        pathname === '/roles' || pathname.startsWith('/roles/')) {
      setUsersOpen(true);
    }
  }, [pathname]);

  return (
      <div className={`fixed left-0 top-0 h-full bg-[#045F3C] text-white/90 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-white/10">
            <div className="flex items-center">
              {!isCollapsed ? (
                  <Image
                      src="/images/logoLight.png"
                      alt="GanzAfrica"
                      width={130}
                      height={35}
                      className="object-contain"
                      priority
                  />
              ) : (
                  <Image
                      src="/images/logoLight.png"
                      alt="GanzAfrica"
                      width={32}
                      height={32}
                      className="object-contain"
                      priority
                  />
              )}
            </div>
          </div>

          {/* Menu Sections */}
          <div className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Main Menu */}
            <div>
              {!isCollapsed && <h2 className="px-4 mb-3 text-sm font-medium text-white/60 uppercase tracking-wider">Main Menu</h2>}
              <nav className="space-y-1">
                <Link
                    href="/dashboard"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">Dashboard</span>}
                </Link>

                {/* Projects Dropdown */}
                <div>
                  <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                          (pathname === '/projects' || pathname.startsWith('/projects/') ||
                              pathname === '/categories' || pathname.startsWith('/categories/'))
                              ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                      onClick={() => !isCollapsed && setProjectsOpen(!projectsOpen)}
                  >
                    <div className="flex items-center">
                      <FolderGit2 className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 font-medium">Projects</span>}
                    </div>
                    {!isCollapsed && (
                        projectsOpen
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                    )}
                  </div>

                  {/* Projects dropdown items */}
                  {!isCollapsed && projectsOpen && (
                      <>
                        <Link
                            href="/projects"
                            className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                                pathname === '/projects' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <FolderGit2 className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Manage Projects</span>
                        </Link>
                        <Link
                            href="/categories"
                            className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                                pathname === '/categories' || pathname.startsWith('/categories/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <Tag className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Project Categories</span>
                        </Link>
                      </>
                  )}
                </div>

                <Link
                    href="/opportunities"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/opportunities' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Briefcase className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">Opportunities</span>}
                </Link>

                {/* Users Dropdown */}
                <div>
                  <div
                      className={`flex items-center justify-between cursor-pointer ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                          (pathname === '/users' || pathname.startsWith('/users/') ||
                              pathname === '/roles' || pathname.startsWith('/roles/'))
                              ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                      onClick={() => !isCollapsed && setUsersOpen(!usersOpen)}
                  >
                    <div className="flex items-center">
                      <Users2 className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="ml-3 font-medium">Users</span>}
                    </div>
                    {!isCollapsed && (
                        usersOpen
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                    )}
                  </div>

                  {/* Users dropdown items */}
                  {!isCollapsed && usersOpen && (
                      <>
                        <Link
                            href="/users"
                            className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                                pathname === '/users' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <Users2 className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Manage Users</span>
                        </Link>
                        <Link
                            href="/roles"
                            className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-colors ${
                                pathname === '/roles' || pathname.startsWith('/roles/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                          <Shield className="w-4 h-4 flex-shrink-0" />
                          <span className="ml-3 font-medium text-sm">Roles</span>
                        </Link>
                      </>
                  )}
                </div>

                <Link
                    href="/teams"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/teams' || pathname.startsWith('/teams/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Users2 className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">Teams</span>}
                </Link>

                <Link
                    href="/news"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/news' || pathname.startsWith('/news/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">News & Updates</span>}
                </Link>

                <Link
                    href="/testimonials"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/testimonials' || pathname.startsWith('/testimonials/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <MessageSquareQuote className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">Testimonials</span>}
                </Link>

                <Link
                    href="/faqs"
                    className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-2.5 rounded-lg transition-colors ${
                        pathname === '/faqs' || pathname.startsWith('/faqs/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <HelpCircle className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="ml-3 font-medium">FAQs</span>}
                </Link>
              </nav>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button
                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} w-full px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors`}
                aria-label="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
  );
};

export default Sidebar;