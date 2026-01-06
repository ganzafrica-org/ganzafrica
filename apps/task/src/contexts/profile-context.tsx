"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { profileApi } from '@/lib/api-client';
import { logger } from '@/lib/logger';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  role_id: number;
  role_name: string;
  avatar_url?: string;
  phone_number?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  bio?: string;
  address?: string;
}

interface ProfileContextType {
  currentUserProfile: UserProfile | null;
  userProfiles: Map<number, UserProfile>;
  isLoading: boolean;
  updateCurrentUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (userId: number, profile: UserProfile) => void;
  getUserProfile: (userId: number) => UserProfile | null;
  loadUserProfile: (userId: number) => Promise<UserProfile | null>;
  refreshCurrentUserProfile: () => Promise<void>;
  refreshUserProfile: (userId: number) => Promise<void>;
  getUserInitials: (userId: number) => string;
  getUserDisplayImage: (userId: number) => string | null;
}

const ProfileContext = createContext<ProfileContextType>({
  currentUserProfile: null,
  userProfiles: new Map(),
  isLoading: true,
  updateCurrentUserProfile: () => {},
  updateUserProfile: () => {},
  getUserProfile: () => null,
  loadUserProfile: async () => null,
  refreshCurrentUserProfile: async () => {},
  refreshUserProfile: async () => {},
  getUserInitials: () => 'U',
  getUserDisplayImage: () => null,
});

export function ProfileProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [userProfiles, setUserProfiles] = useState<Map<number, UserProfile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load current user profile on mount
  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await profileApi.getCurrentProfile();
        const profile = response.profile;
        setCurrentUserProfile(profile);
        setUserProfiles(prev => new Map(prev).set(profile.id, profile));
      } catch (error: unknown) {
        logger.error('Failed to load current user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUserProfile();
  }, []);

  // Update current user profile
  const updateCurrentUserProfile = (profile: UserProfile) => {
    setCurrentUserProfile(profile);
    setUserProfiles(prev => new Map(prev).set(profile.id, profile));
  };

  // Update any user profile
  const updateUserProfile = (userId: number, profile: UserProfile) => {
    setUserProfiles(prev => new Map(prev).set(userId, profile));
    // If it's the current user, also update current user profile
    if (currentUserProfile && currentUserProfile.id === userId) {
      setCurrentUserProfile(profile);
    }
  };

  // Get user profile by ID
  const getUserProfile = (userId: number): UserProfile | null => {
    return userProfiles.get(userId) || null;
  };

  // Load user profile on demand
  const loadUserProfile = async (userId: number): Promise<UserProfile | null> => {
    try {
      // Check if we already have this profile
      const existingProfile = userProfiles.get(userId);
      if (existingProfile) {
        return existingProfile;
      }

      // Load profile from API
      const response = await profileApi.getUserProfile(userId);
      const profile = response.user || response; // Handle different response formats
      
      // Store the profile
      setUserProfiles(prev => new Map(prev).set(userId, profile));
      return profile;
    } catch (error: unknown) {
      logger.error('Failed to load user profile:', error);
      
      // Create a fallback profile if API fails
      const fallbackProfile: UserProfile = {
        id: userId,
        email: `user${userId}@example.com`,
        name: `User ${userId}`,
        role_id: 1,
        role_name: 'User',
        avatar_url: undefined,
        phone_number: undefined,
        email_verified: false,
        phone_verified: false,
        is_active: true,
        last_login: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bio: undefined,
        address: undefined,
      };

      // Store the fallback profile
      setUserProfiles(prev => new Map(prev).set(userId, fallbackProfile));
      return fallbackProfile;
    }
  };

  // Refresh current user profile
  const refreshCurrentUserProfile = async () => {
    try {
      const response = await profileApi.getCurrentProfile();
      const profile = response.profile;
      updateCurrentUserProfile(profile);
    } catch (error: unknown) {
      logger.error('Failed to refresh current user profile:', error);
    }
  };

  // Refresh any user profile
  const refreshUserProfile = async (userId: number) => {
    try {
      // For now, we'll use the current user profile API
      // In a real app, you might have a separate API to get any user's profile
      if (currentUserProfile && currentUserProfile.id === userId) {
        await refreshCurrentUserProfile();
      }
    } catch (error: unknown) {
      logger.error('Failed to refresh user profile:', error);
    }
  };

  // Get user initials
  const getUserInitials = (userId: number): string => {
    const profile = getUserProfile(userId);
    if (!profile) return 'U';
    
    return profile.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get user display image (avatar or null)
  const getUserDisplayImage = (userId: number): string | null => {
    const profile = getUserProfile(userId);
    if (!profile) return null;
    
    return profile.avatar_url || null;
  };

  return (
    <ProfileContext.Provider
      value={{
        currentUserProfile,
        userProfiles,
        isLoading,
        updateCurrentUserProfile,
        updateUserProfile,
        getUserProfile,
        loadUserProfile,
        refreshCurrentUserProfile,
        refreshUserProfile,
        getUserInitials,
        getUserDisplayImage,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
