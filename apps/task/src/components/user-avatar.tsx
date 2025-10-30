"use client";

import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/profile-context';

interface UserAvatarProps {
  userId: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
  nameClassName?: string;
  fallbackColor?: string; // used for initials background when no avatar
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
};

export function UserAvatar({ 
  userId, 
  size = 'md', 
  className = '', 
  showName = false,
  nameClassName = '',
  fallbackColor,
}: UserAvatarProps) {
  const { getUserProfile, getUserInitials, getUserDisplayImage, loadUserProfile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  
  const profile = getUserProfile(userId);
  const initials = getUserInitials(userId);
  const avatarUrl = getUserDisplayImage(userId);
  
  const sizeClass = sizeClasses[size];
  
  // Load profile on demand if not available
  useEffect(() => {
    if (!profile && !isLoading) {
      setIsLoading(true);
      loadUserProfile(userId).finally(() => setIsLoading(false));
    }
  }, [userId, profile, isLoading, loadUserProfile]);
  
  // If no profile is loaded yet, show a fallback with user ID
  if (!profile) {
    const fallbackInitials = `U${userId.toString().slice(-1)}`;
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className={`${sizeClass} rounded-full flex items-center justify-center text-white font-semibold`}
          style={{ backgroundColor: fallbackColor || '#076297' }}
        >
          {fallbackInitials}
        </div>
        {showName && <span className={nameClassName}>User {userId}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center font-semibold`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={`${profile.name}'s profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const color = fallbackColor || '#076297';
                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white" style="background-color: ${color}">${initials}</div>`;
              }
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white"
            style={{ backgroundColor: fallbackColor || '#076297' }}
          >
            {initials}
          </div>
        )}
      </div>
      {showName && (
        <span className={nameClassName}>
          {profile.name}
        </span>
      )}
    </div>
  );
}
