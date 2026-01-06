"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@workspace/ui';
import { Card } from '@workspace/ui';
import { Twitter, Linkedin, ChevronDown, ChevronUp, X, Check, Loader2, User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { Input } from '@workspace/ui';
import { toast } from 'sonner';
import { profileApi } from '@/lib/api-client';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  notifications?: NotificationPreferences;
  language?: string;
  timezone?: string;
}

interface UserData {
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
  social_links?: SocialLinks;
  preferences?: UserPreferences;
}

interface UserProfileProps {
  user?: UserData;
}

interface InfoItemProps {
  label: string;
  value: string;
  isEditing: boolean;
  onEdit: (value: string) => void;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, isEditing, onEdit }) => {
  const [editValue, setEditValue] = useState(value);

  return (
    <div className="mb-6">
      <h4 className="text-sm text-gray-500 mb-1">{label}</h4>
      {isEditing ? (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onEdit(editValue)}
          className="text-sm"
        />
      ) : (
        <p className="text-sm font-medium text-gray-900">{value}</p>
      )}
    </div>
  );
};

export function UserProfile({ user: initialUser }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(initialUser || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [loading, setLoading] = useState(!initialUser);
  const [saving, setSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (initialUser) return; // Don't load if user is already provided
      
      try {
        setLoading(true);
        const response = await profileApi.getCurrentProfile();
        setUser(response.profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [initialUser]);

  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setShowScrollButton(container.scrollHeight > container.clientHeight);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, []);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isAtTop = container.scrollTop === 0;
      setIsScrolledDown(!isAtTop);
    }
  };

  const scrollToPosition = () => {
    const container = scrollContainerRef.current;
    if (container) {
      if (isScrolledDown) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  const handleEdit = (field: string, value: string) => {
    setUser(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handleSocialEdit = (platform: keyof SocialLinks, value: string) => {
    setUser(prev => prev ? ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }) : null);
  };

  const handlePreferencesEdit = (field: string, value: any) => {
    setUser(prev => prev ? ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }) : null);
  };

  const toggleEdit = async () => {
    if (isEditing) {
      // Save to backend
      if (!user) return;
      
      try {
        setSaving(true);
        const updateData = {
          name: user.name,
          phone_number: user.phone_number,
          avatar_url: user.avatar_url,
          bio: user.bio,
          address: user.address,
          social_links: user.social_links,
          preferences: user.preferences,
        };
        
        const response = await profileApi.updateProfile(updateData);
        setUser(response.profile);
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Failed to update profile:', error);
        toast.error('Failed to update profile');
      } finally {
        setSaving(false);
      }
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-500">Manage your profile information</p>
        </div>
        <Button 
          onClick={toggleEdit}
          disabled={saving}
          className="bg-green-700 hover:bg-green-800 transition-colors"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card - Static Left Column */}
        <Card className="p-6 shadow-sm animate-fade-in relative h-fit" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-100 mb-4 overflow-hidden flex items-center justify-center relative group" style={{ minWidth: '128px', minHeight: '128px' }}>
              {user.avatar_url ? (
                <img 
                  alt="Profile" 
                  src={user.avatar_url} 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              ) : (
                <div className="bg-purple-700 text-white w-full h-full flex items-center justify-center text-3xl font-semibold absolute inset-0">
                  {user.name
                    .split(' ')
                    .map(part => part[0])
                    .join('')
                    .toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm">
                    Change Photo
                  </Button>
                </div>
              )}
            </div>
            {isEditing ? (
              <Input
                value={user.name}
                onChange={(e) => handleEdit('name', e.target.value)}
                className="text-xl font-bold text-center mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{user.name}</h2>
            )}
            <div className="flex items-center mt-1">
              <span className={`h-2 w-2 rounded-full mr-2 ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-500">
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <InfoItem 
            label="Email" 
            value={user.email} 
            isEditing={false}
            onEdit={() => {}}
          />
          <InfoItem 
            label="Phone Number" 
            value={user.phone_number || 'Not provided'} 
            isEditing={isEditing}
            onEdit={(value) => handleEdit('phone_number', value)}
          />
          <InfoItem 
            label="Email Verified" 
            value={user.email_verified ? 'Yes' : 'No'} 
            isEditing={false}
            onEdit={() => {}}
          />
          <InfoItem 
            label="Phone Verified" 
            value={user.phone_verified ? 'Yes' : 'No'} 
            isEditing={false}
            onEdit={() => {}}
          />
          
          {/* Social Media Links */}
          <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-100">
            {user.social_links?.twitter && (
              <div className="flex items-center gap-2">
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                {isEditing ? (
                  <Input
                    value={user.social_links.twitter}
                    onChange={(e) => handleSocialEdit('twitter', e.target.value)}
                    className="text-sm w-40"
                  />
                ) : (
                  <a 
                    href={user.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:underline"
                  >
                    Twitter
                  </a>
                )}
              </div>
            )}
            {user.social_links?.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                {isEditing ? (
                  <Input
                    value={user.social_links.linkedin}
                    onChange={(e) => handleSocialEdit('linkedin', e.target.value)}
                    className="text-sm w-40"
                  />
                ) : (
                  <a 
                    href={user.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column - Scrollable with Hidden Scrollbar */}
        <div className="col-span-2 relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
          >
            {/* Biography Card */}
            <Card className="p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold mb-4">Biography</h3>
              {isEditing ? (
                <textarea
                  value={user.bio || ''}
                  onChange={(e) => handleEdit('bio', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm text-gray-600 min-h-[100px]"
                  aria-label="Biography"
                  title="Biography"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm text-gray-600">{user.bio || 'No biography provided'}</p>
              )}
            </Card>

            {/* Account Information */}
            <Card className="p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold mb-6">Account Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoItem 
                  label="Role" 
                  value={user.role_name} 
                  isEditing={false}
                  onEdit={() => {}}
                />
                <InfoItem 
                  label="Account Status" 
                  value={user.is_active ? 'Active' : 'Inactive'} 
                  isEditing={false}
                  onEdit={() => {}}
                />
                <InfoItem 
                  label="Member Since" 
                  value={new Date(user.created_at).toLocaleDateString()} 
                  isEditing={false}
                  onEdit={() => {}}
                />
                <InfoItem 
                  label="Last Updated" 
                  value={new Date(user.updated_at).toLocaleDateString()} 
                  isEditing={false}
                  onEdit={() => {}}
                />
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-bold mb-6">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <InfoItem 
                  label="Address" 
                  value={user.address || 'Not provided'} 
                  isEditing={isEditing}
                  onEdit={(value) => handleEdit('address', value)}
                />
                <InfoItem 
                  label="Phone Number" 
                  value={user.phone_number || 'Not provided'} 
                  isEditing={isEditing}
                  onEdit={(value) => handleEdit('phone_number', value)}
                />
              </div>
            </Card>

          </div>

          {/* Scroll Button */}
          {showScrollButton && (
            <button
              onClick={scrollToPosition}
              className="fixed bottom-8 right-8 p-3 bg-green-700 text-white rounded-full shadow-lg hover:bg-green-800 transition-colors animate-bounce"
              title={isScrolledDown ? "Scroll to top" : "Scroll to bottom"}
            >
              {isScrolledDown ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <UserProfile />
      </div>
    </>
  );
}
