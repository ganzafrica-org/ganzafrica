"use client";

import { Bell, Plus, Search, User, BellOff, Settings, HelpCircle, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Task } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useProfile } from "@/contexts/profile-context";

interface NavbarProps {
  tasks: Task[];
  onAddTask?: () => void;
  onToggleSidebar?: () => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export function Navbar({ tasks, onAddTask, onToggleSidebar, onSearchChange, searchQuery = "" }: NavbarProps): React.JSX.Element {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { currentUserProfile, getUserInitials, getUserDisplayImage } = useProfile();
  const [query, setQuery] = useState(searchQuery);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);
  const [activeMuteOption, setActiveMuteOption] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Update local query when searchQuery prop changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Calculate matches for display
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    return tasks.filter((t: Task) => {
      const titleMatch = t.title.toLowerCase().includes(q);
      const descriptionMatch = t.description?.toLowerCase().includes(q);
      const deliverablesMatch = t.deliverables?.toLowerCase().includes(q);
      return titleMatch || descriptionMatch || deliverablesMatch;
    }).length;
  }, [query, tasks]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Notify parent component of search change
    if (onSearchChange) {
      onSearchChange(newQuery);
    }
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowMuteSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-white" style={{ overflowX: 'visible', overflowY: 'visible' }}>
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-[#076297] via-[#0a84c1] to-[#3db1ff]" />
        <span className="font-semibold text-sm sm:text-base">Task Management</span>
      </div>
      
      <div className="flex-1" />
      
      {/* Search - hidden on mobile, shown on tablet and up */}
      <div className="relative max-w-md w-full hidden sm:block">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Search 
            className="h-5 w-5" 
            style={{ color: '#4b5563' }}
            strokeWidth={2}
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-400 text-sm transition-all relative"
          style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
        />
        {query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
            {matches} {matches === 1 ? 'match' : 'matches'}
          </span>
        )}
      </div>
      
      <button className="relative p-2 rounded-md hover:bg-black/5">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      </button>
      
      {/* Profile Menu */}
      <div className="relative" ref={profileMenuRef} style={{ overflow: 'visible', zIndex: 10000 }}>
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="h-8 w-8 rounded-full text-white grid place-items-center text-xs font-semibold hover:opacity-90 transition-opacity overflow-hidden"
          style={{ backgroundColor: '#076297' }}
        >
          {currentUserProfile ? (
            currentUserProfile.avatar_url ? (
              <img 
                src={currentUserProfile.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white" style="background-color: #076297">${getUserInitials(currentUserProfile.id)}</div>`;
                  }
                }}
              />
            ) : (
              getUserInitials(currentUserProfile.id)
            )
          ) : (
            user?.initials || 'ME'
          )}
        </button>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div 
            className="absolute bg-white shadow-xl"
            style={{ 
              borderRadius: '7px', 
              border: '1px solid #e5e7eb',
              right: '100%',
              marginRight: '8px',
              marginTop: '8px',
              zIndex: 10000,
              position: 'absolute',
              top: '0',
              width: '280px',
              minWidth: '280px'
            }}
          >
            {/* Profile Option */}
              <Link
                href="/profile"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left block"
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: activeMenuItem === 'profile' ? '#076297' : 'transparent',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeMenuItem !== 'profile') {
                    e.currentTarget.style.backgroundColor = '#e6f2f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMenuItem !== 'profile') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <User 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: activeMenuItem === 'profile' ? '#ffffff' : '#4b5563' }}
                />
                <span 
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: activeMenuItem === 'profile' ? '#ffffff' : '#374151' }}
                >
                  Profile
                </span>
              </Link>

            {/* Mute Notifications */}
            <button
              onClick={() => setShowMuteSubmenu(!showMuteSubmenu)}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
              style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: activeMenuItem === 'mute' ? '#076297' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeMenuItem !== 'mute') {
                  e.currentTarget.style.backgroundColor = '#e6f2f8';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenuItem !== 'mute') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <BellOff 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: activeMenuItem === 'mute' ? '#ffffff' : '#4b5563' }}
              />
              <span 
                className="text-sm font-medium flex-1 whitespace-nowrap"
                style={{ color: activeMenuItem === 'mute' ? '#ffffff' : '#374151' }}
              >
                Mute Notifications
              </span>
              {showMuteSubmenu ? (
                <ChevronDown 
                  className="w-4 h-4" 
                  style={{ color: activeMenuItem === 'mute' ? '#ffffff' : '#9ca3af' }}
                />
              ) : (
                <ChevronRight 
                  className="w-4 h-4" 
                  style={{ color: activeMenuItem === 'mute' ? '#ffffff' : '#9ca3af' }}
                />
              )}
            </button>

            {/* Settings */}
              <Link
                href="/settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left block"
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: activeMenuItem === 'settings' ? '#076297' : 'transparent',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeMenuItem !== 'settings') {
                    e.currentTarget.style.backgroundColor = '#e6f2f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMenuItem !== 'settings') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Settings 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: activeMenuItem === 'settings' ? '#ffffff' : '#4b5563' }}
                />
                <span 
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: activeMenuItem === 'settings' ? '#ffffff' : '#374151' }}
                >
                  Settings
                </span>
              </Link>

            {/* Help */}
              <Link
                href="/help"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left block"
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: activeMenuItem === 'help' ? '#076297' : 'transparent',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeMenuItem !== 'help') {
                    e.currentTarget.style.backgroundColor = '#e6f2f8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMenuItem !== 'help') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <HelpCircle 
                  className="w-4 h-4 flex-shrink-0" 
                  style={{ color: activeMenuItem === 'help' ? '#ffffff' : '#4b5563' }}
                />
                <span 
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: activeMenuItem === 'help' ? '#ffffff' : '#374151' }}
                >
                  Help
                </span>
              </Link>

            {/* Sign Out */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Mute Notifications Card */}
      {showMuteSubmenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent z-40"
            onClick={() => setShowMuteSubmenu(false)}
          />
          
          {/* Small Card positioned to the left of profile dropdown */}
          <div 
            className="absolute right-64 top-20 w-48 bg-white shadow-xl z-50"
            style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
          >
            {/* Options */}
            <div className="py-1">
              {[
                { label: 'For 1 hour', value: '1h' },
                { label: 'Until tomorrow', value: 'tomorrow' },
                { label: 'Until next week', value: 'week' },
                { label: 'Custom date and time', value: 'custom' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setActiveMuteOption(option.value);
                    setShowMuteSubmenu(false);
                    setShowProfileMenu(false);
                    // Handle mute notification
                  }}
                  className="w-full px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor: activeMuteOption === option.value ? '#076297' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMuteOption !== option.value) {
                      e.currentTarget.style.backgroundColor = '#e6f2f8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeMuteOption !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span 
                    className="text-sm"
                    style={{
                      color: activeMuteOption === option.value ? '#ffffff' : '#374151'
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}