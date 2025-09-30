'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Globe,
  Palette,
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  Edit,
  Eye,
  EyeOff,
  Camera,
  Settings as SettingsIcon
} from 'lucide-react';

interface TeacherSettings {
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    bio: string;
    avatar_url: string;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    timezone: string;
  };
  security: {
    two_factor_enabled: boolean;
    last_password_change: string;
    login_history: {
      date: string;
      device: string;
      location: string;
    }[];
  };
}

export default function TeacherSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState<TeacherSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockSettings: TeacherSettings = {
      profile: {
        first_name: user?.firstName || 'John',
        last_name: user?.lastName || 'Doe',
        email: user?.email || 'john.doe@teacher.edu',
        phone: '+1 (555) 123-4567',
        bio: 'Experienced mathematics teacher with 8 years of experience in high school education. Passionate about making complex concepts accessible to all students.',
        avatar_url: user?.avatarUrl || ''
      },
      preferences: {
        language: 'English',
        theme: 'auto',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        timezone: 'America/New_York'
      },
      security: {
        two_factor_enabled: false,
        last_password_change: '2024-01-15',
        login_history: [
          {
            date: '2024-01-20 14:30',
            device: 'Chrome on Windows',
            location: 'New York, NY'
          },
          {
            date: '2024-01-19 09:15',
            device: 'Safari on iPhone',
            location: 'New York, NY'
          },
          {
            date: '2024-01-18 16:45',
            device: 'Chrome on Mac',
            location: 'New York, NY'
          }
        ]
      }
    };

    setTimeout(() => {
      setSettings(mockSettings);
      setIsLoading(false);
    }, 1000);
  }, [user]);

  const handleSaveProfile = () => {
    // Handle profile update logic here
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    // Handle password change logic here
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleNotificationToggle = (
    type: keyof typeof settings.preferences.notifications
  ) => {
    if (settings) {
      setSettings({
        ...settings,
        preferences: {
          ...settings.preferences,
          notifications: {
            ...settings.preferences.notifications,
            [type]: !settings.preferences.notifications[type]
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No settings data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and security
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-300">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#00af8f]" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {settings.profile.avatar_url ? (
                  <img
                    src={settings.profile.avatar_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  settings.profile.first_name.charAt(0) +
                  settings.profile.last_name.charAt(0)
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 p-0">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {settings.profile.first_name} {settings.profile.last_name}
              </h3>
              <p className="text-gray-600 mb-2">{settings.profile.email}</p>
              <p className="text-sm text-gray-500">{settings.profile.bio}</p>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={settings.profile.first_name}
                onChange={e =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, first_name: e.target.value }
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={settings.profile.last_name}
                onChange={e =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, last_name: e.target.value }
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.profile.email}
                onChange={e =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, email: e.target.value }
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={settings.profile.phone}
                onChange={e =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, phone: e.target.value }
                  })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={settings.profile.bio}
                onChange={e =>
                  setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value }
                  })
                }
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-[#00af8f] hover:bg-[#00af90]">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Palette className="w-5 h-5 mr-2 text-[#00af8f]" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={settings.preferences.language}
                onChange={e =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      language: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={settings.preferences.theme}
                onChange={e =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      theme: e.target.value as 'light' | 'dark' | 'auto'
                    }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={settings.preferences.timezone}
                onChange={e =>
                  setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      timezone: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00af8f] focus:border-transparent">
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Notification Preferences
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <span>Email Notifications</span>
                </div>
                <Button
                  variant={
                    settings.preferences.notifications.email
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleNotificationToggle('email')}>
                  {settings.preferences.notifications.email ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span>Push Notifications</span>
                </div>
                <Button
                  variant={
                    settings.preferences.notifications.push
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleNotificationToggle('push')}>
                  {settings.preferences.notifications.push ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <span>SMS Notifications</span>
                </div>
                <Button
                  variant={
                    settings.preferences.notifications.sms
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => handleNotificationToggle('sms')}>
                  {settings.preferences.notifications.sms ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#00af8f]" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button
              variant={
                settings.security.two_factor_enabled ? 'default' : 'outline'
              }>
              {settings.security.two_factor_enabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <Button
              onClick={handlePasswordChange}
              className="bg-[#00af8f] hover:bg-[#00af90]">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>

          {/* Login History */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Recent Login Activity</h4>
            <div className="space-y-3">
              {settings.security.login_history.map((login, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {login.device}
                      </p>
                      <p className="text-sm text-gray-500">{login.location}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{login.date}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-700 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-700 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





