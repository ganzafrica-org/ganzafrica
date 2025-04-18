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
  ChevronRight,
  UserPlus

} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);


    const toggleOpportunities = () => {
      if (!isCollapsed) {
        setOpportunitiesOpen(!opportunitiesOpen);
      }
    };
  
    const toggleTeams = () => {
      if (!isCollapsed) {
        setTeamsOpen(!teamsOpen);
      }
    };

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

                <div className="relative">
                <button
                  onClick={toggleOpportunities}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-2.5 rounded-lg transition-colors ${
                    pathname === '/opportunities' || pathname === '/applications' || pathname.startsWith('/opportunities/') || pathname.startsWith('/applications/') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-medium">Opportunities</span>}
                  </div>
                  {!isCollapsed && (
                    opportunitiesOpen ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Dropdown menu */}
                {!isCollapsed && opportunitiesOpen && (
                  <div className="pl-11 mt-1 space-y-1">
                    <Link
                      href="/opportunities"
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/opportunities' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">All Opportunities</span>
                    </Link>
                    <Link
                      href="/applications"
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/applications' || pathname.startsWith('/applications/') ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">Applications</span>
                    </Link>
                  </div>
                )}
                
                {/* Compact menu for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 z-10 w-48 mt-1 bg-[#045F3C] rounded-lg shadow-lg transform -translate-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                    <Link
                      href="/opportunities"
                      className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-t-lg"
                    >
                      All Opportunities
                    </Link>
                    <Link
                      href="/applications"
                      className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-b-lg"
                    >
                      Applications
                    </Link>
                  </div>
                )}
              </div>

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

               {/* Teams with dropdown */}
              <div className="relative">
                <button
                  onClick={toggleTeams}
                  className={`flex items-center w-full ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'} py-2.5 rounded-lg transition-colors ${
                    pathname === '/teams' || pathname.startsWith('/teams/') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3 font-medium">Teams</span>}
                  </div>
                  {!isCollapsed && (
                    teamsOpen ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Teams dropdown menu */}
                {!isCollapsed && teamsOpen && (
                  <div className="pl-11 mt-1 space-y-1">
                    <Link
                      href="/teams"
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/teams/manage' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">Manage Teams</span>
                    </Link>
                    <Link
                      href="/teams/team-types"
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/teams/types/add' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="font-medium">Add Team Type</span>
                    </Link>
                  </div>
                )}
                
                {/* Compact menu for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 z-10 w-48 mt-1 bg-[#045F3C] rounded-lg shadow-lg transform -translate-x-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
                    <Link
                      href="/teams"
                      className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-t-lg"
                    >
                      Manage Teams
                    </Link>
                    <Link
                      href="/teams/add-tea"
                      className="block px-4 py-2 text-white/80 hover:bg-white/5 hover:text-white rounded-b-lg"
                    >
                      Manage Team Type
                    </Link>
                  </div>
                )}
              </div>

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