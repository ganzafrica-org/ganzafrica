"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, User, Settings, LogOut, Info } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

const Navbar = ({ onMenuClick, isSidebarCollapsed }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        
        <div className="flex items-center">
          <h1 className="font-h5">Dashboard</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
        
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center space-x-2 cursor-pointer p-1 pl-2 hover:bg-gray-100 rounded-lg"
            onClick={toggleDropdown}
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src="/images/angel.png"
                alt="Angel Gaju"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <span className="font-medium-paragraph text-gray-800">Angel Gaju</span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="/images/angel.png"
                      alt="Angel Gaju"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium-paragraph text-gray-800">Angel Gaju</p>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <a href="#" className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                  <User className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                  Profile
                </a>
                <a href="#" className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                  Settings
                </a>
              </div>
              
              <div className="py-1 border-t border-gray-100">
                <a href="#" className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                  <Info className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                  Help Center
                </a>
              </div>
              
              <div className="py-1 border-t border-gray-100">
                <a href="#" className="flex items-center px-4 py-2 font-regular-paragraph text-gray-700 hover:bg-primary-green hover:text-white group mx-2 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4 mr-3 text-gray-500 group-hover:text-white" />
                  Logout
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;