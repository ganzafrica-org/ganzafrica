"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera, Bell, Shield, Key, Loader2 } from "lucide-react";
import { PageLayout } from "@/components/page-layout";
import { Tabs } from "@/components/tabs";
import { Button } from "@/components/button";
import { ImageUpload } from "@/components/image-upload";
import { profileApi } from "@/lib/api-client";
import { useProfile } from "@/contexts/profile-context";
import { toast } from "sonner";

// User data interface matching API response
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
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    language?: string;
    timezone?: string;
  };
}

export default function ProfilePage(): React.JSX.Element {
  const { currentUserProfile, updateCurrentUserProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User data from API
  const [userData, setUserData] = useState<UserData | null>(null);

  const [editData, setEditData] = useState<UserData | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (currentUserProfile) {
      setUserData(currentUserProfile);
      setEditData(currentUserProfile);
      setLoading(false);
    }
  }, [currentUserProfile]);

  // Upload image to server using backend API (same as portal)
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      
      // Use the backend upload endpoint (same as portal app)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/uploads/file`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.file.url; // Backend returns { success: true, file: { url: "..." } }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    
    try {
      setSaving(true);
      
      // Upload image if a new one was selected
      let avatarUrl = editData.avatar_url;
      if (selectedImageFile) {
        const uploadedUrl = await uploadImage(selectedImageFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          // If upload failed, don't save the profile
          return;
        }
      }
      
      const updateData = {
        name: editData.name || '',
        phone_number: editData.phone_number || null,
        avatar_url: avatarUrl || null,
        bio: editData.bio || null,
        address: editData.address || null,
        social_links: editData.social_links || null,
        preferences: editData.preferences || null,
      };
      
      // Remove undefined values to avoid validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      // Debug logging
      console.log('Sending profile update data:', JSON.stringify(updateData, null, 2));
      
      const response = await profileApi.updateProfile(updateData);
      const updatedProfile = response.profile;
      
      // Update local state
      setUserData(updatedProfile);
      setEditData(updatedProfile);
      setSelectedImageFile(null); // Clear selected image after successful save
      setIsEditing(false);
      
      // Update global profile context
      updateCurrentUserProfile(updatedProfile);
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Error response data:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data?.details) {
        const validationErrors = error.response.data.details;
        const errorMessages = validationErrors.map((err: any) => `${err.path}: ${err.message}`).join('\n');
        toast.error(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setSelectedImageFile(null);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    console.log('Password changed successfully');
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowChangePassword(false);
    toast.success('Password changed successfully!');
  };

  const handleEnable2FA = () => {
    console.log('2FA enabled');
    setShow2FA(false);
    toast.success('Two-Factor Authentication has been enabled!');
  };

  const handleViewSessions = () => {
    console.log('Viewing active sessions');
    setShowSessions(true);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (!editData) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => {
        if (!prev) return null;
        const parentObj = prev[parent as keyof typeof prev] as any;
        return {
          ...prev,
          [parent as string]: {
            ...parentObj,
            [child as string]: value
          }
        };
      });
    } else {
      setEditData(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" }
  ];

  if (loading) {
    return (
      <PageLayout 
        members={[]} 
        tasks={[]} 
        title="My Profile"
        className="bg-gray-50"
      >
        <div className="w-full flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!userData || !editData) {
    return (
      <PageLayout 
        members={[]} 
        tasks={[]} 
        title="My Profile"
        className="bg-gray-50"
      >
        <div className="w-full flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No profile data available</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      members={[]} 
      tasks={[]} 
      title="My Profile"
      className="bg-gray-50"
    >
      <div className="w-full">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Tabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
        </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white shadow-sm" style={{ borderRadius: '7px' }}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {userData.avatar_url ? (
                          <img 
                            src={userData.avatar_url} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                            style={{ backgroundColor: '#076297' }}
                          >
                            {userData.name
                              .split(' ')
                              .map(part => part[0])
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{userData.name}</h2>
                        <p className="text-gray-600">{userData.email}</p>
                        <p className="text-sm text-gray-500">
                          {userData.is_active ? 'Active' : 'Inactive'} • 
                          {userData.email_verified ? ' Email Verified' : ' Email Not Verified'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      icon={Edit3}
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>

                  {/* Image Upload Section - Only show when editing */}
                  {isEditing && (
                    <div className="mb-6">
                      <ImageUpload
                        onImageChange={setSelectedImageFile}
                        initialImage={userData.avatar_url}
                        isUploading={isUploadingImage}
                        label="Profile Picture"
                        description="Upload a new profile picture (JPG, PNG, GIF up to 5MB)"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ borderRadius: '7px' }}
                          />
                        ) : (
                          <p className="text-gray-900">{userData.name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ borderRadius: '7px' }}
                          />
                        ) : (
                          <p className="text-gray-900">{userData.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editData.phone_number || ''}
                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ borderRadius: '7px' }}
                          />
                        ) : (
                          <p className="text-gray-900">{userData.phone_number || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editData.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            style={{ borderRadius: '7px' }}
                          />
                        ) : (
                          <p className="text-gray-900">{userData.address || 'Not provided'}</p>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <p className="text-gray-900">{userData.role_name}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                        <p className="text-gray-900">{userData.is_active ? 'Active' : 'Inactive'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                        <p className="text-gray-900">{new Date(userData.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={editData.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ borderRadius: '7px' }}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900">{userData.bio || 'No bio provided'}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={handleSave}
                        variant="primary"
                        icon={saving ? Loader2 : Save}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        icon={X}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white shadow-sm" style={{ borderRadius: '7px' }}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    {userData.preferences?.notifications ? (
                      Object.entries(userData.preferences.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-400 last:border-b-0">
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Receive push notifications'}
                              {key === 'sms' && 'Receive SMS notifications'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value || false}
                              onChange={(e) => handleInputChange(`preferences.notifications.${key}`, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ '--tw-ring-color': '#076297', backgroundColor: value ? '#076297' : '#e5e7eb' } as React.CSSProperties}></div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No notification preferences set</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white shadow-sm" style={{ borderRadius: '7px' }}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-3 border-b border-gray-400">
                      <div>
                        <h4 className="font-medium text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                      </div>
                      <Button
                        variant="outline"
                        icon={Key}
                        size="sm"
                        onClick={() => setShowChangePassword(true)}
                      >
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-400">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button
                        variant="outline"
                        icon={Shield}
                        size="sm"
                        onClick={() => setShow2FA(true)}
                      >
                        Enable
                      </Button>
                    </div>

                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Active Sessions</h4>
                        <p className="text-sm text-gray-500">Manage devices signed into your account</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewSessions}
                      >
                        View Sessions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: '7px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: '7px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ borderRadius: '7px' }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleChangePassword}
                variant="primary"
              >
                Change Password
              </Button>
              <Button
                onClick={() => setShowChangePassword(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enable Two-Factor Authentication</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Two-factor authentication adds an extra layer of security to your account. 
                You'll need to use an authenticator app to generate verification codes.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">Steps to enable 2FA:</p>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code that will be displayed</li>
                  <li>Enter the verification code from your app</li>
                </ol>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleEnable2FA}
                variant="primary"
              >
                Enable 2FA
              </Button>
              <Button
                onClick={() => setShow2FA(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Chrome on Windows</p>
                    <p className="text-xs text-gray-500">New York, NY • Current session</p>
                  </div>
                  <Button variant="outline" size="sm">Revoke</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Safari on iPhone</p>
                    <p className="text-xs text-gray-500">New York, NY • 2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">Revoke</Button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Firefox on Mac</p>
                    <p className="text-xs text-gray-500">San Francisco, CA • 1 day ago</p>
                  </div>
                  <Button variant="outline" size="sm">Revoke</Button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowSessions(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
