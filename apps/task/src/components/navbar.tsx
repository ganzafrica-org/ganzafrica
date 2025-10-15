"use client";

import { Bell, Menu, Plus, Search, User, BellOff, Settings, HelpCircle, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";
import { useAuth } from "./auth-provider";

interface NavbarProps {
  tasks: Task[];
  onAddTask?: () => void;
  onToggleSidebar?: () => void;
}

export function Navbar({ tasks, onAddTask, onToggleSidebar }: NavbarProps): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMuteSubmenu, setShowMuteSubmenu] = useState(false);
  const [activeMuteOption, setActiveMuteOption] = useState<string | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    return tasks.filter((t: Task) => t.title.toLowerCase().includes(q)).length;
  }, [query, tasks]);

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
    <div className="flex items-center gap-3 px-4 py-3 bg-white">
      <button className="lg:hidden p-2 rounded-md hover:bg-black/5">
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#076297] via-[#0a84c1] to-[#3db1ff]" />
      <span className="font-semibold">Task Management</span>
      </div>
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
      <div className="flex-1" />
      <div className="relative max-w-md w-full hidden md:block">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-9 pr-3 py-2 bg-white/70 backdrop-blur outline-none focus:ring-2 focus:ring-indigo-400"
          style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
        />
        {query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{matches}</span>
        )}
      </div>
      <button className="relative p-2 rounded-md hover:bg-black/5">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      </button>
      
      {/* Profile Menu */}
      <div className="relative" ref={profileMenuRef}>
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="h-8 w-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white grid place-items-center text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          ME
        </button>

        {/* Dropdown Menu */}
        {showProfileMenu && (
          <div 
            className="absolute right-0 mt-2 w-64 bg-white shadow-xl z-50"
            style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
          >
            {/* Profile Option */}
              <button
                onClick={() => {
                  setActiveMenuItem('profile');
                  setShowProfileMenu(false);
                  router.push('/profile');
                }}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
              style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: activeMenuItem === 'profile' ? '#076297' : 'transparent'
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
                className="w-4 h-4" 
                style={{ color: activeMenuItem === 'profile' ? '#ffffff' : '#4b5563' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: activeMenuItem === 'profile' ? '#ffffff' : '#374151' }}
              >
                Profile
              </span>
            </button>

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
                className="w-4 h-4" 
                style={{ color: activeMenuItem === 'mute' ? '#ffffff' : '#4b5563' }}
              />
              <span 
                className="text-sm font-medium flex-1"
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
              <button
                onClick={() => {
                  setActiveMenuItem('settings');
                  setShowProfileMenu(false);
                  router.push('/settings');
                }}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
              style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: activeMenuItem === 'settings' ? '#076297' : 'transparent'
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
                className="w-4 h-4" 
                style={{ color: activeMenuItem === 'settings' ? '#ffffff' : '#4b5563' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: activeMenuItem === 'settings' ? '#ffffff' : '#374151' }}
              >
                Settings
              </span>
            </button>

            {/* Help */}
              <button
                onClick={() => {
                  setActiveMenuItem('help');
                  setShowProfileMenu(false);
                  router.push('/help');
                }}
              className="w-full px-4 py-3 flex items-center gap-3 transition-colors text-left"
              style={{ 
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: activeMenuItem === 'help' ? '#076297' : 'transparent'
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
                className="w-4 h-4" 
                style={{ color: activeMenuItem === 'help' ? '#ffffff' : '#4b5563' }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: activeMenuItem === 'help' ? '#ffffff' : '#374151' }}
              >
                Help
              </span>
            </button>

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
                    console.log('Mute for:', option.value);
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