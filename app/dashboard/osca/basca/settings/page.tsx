'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Bell,
  Shield,
  Users,
  Calendar,
  Activity,
  GraduationCap,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BASCASettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Barangay Health Workers Association',
    contactEmail: 'basca@example.com',
    contactPhone: '+63 912 345 6789',
    address: '123 Health Center St., Barangay Health Center',
    timezone: 'Asia/Manila',
    language: 'en',
    currency: 'PHP'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    meetingReminders: true,
    activityUpdates: true,
    trainingReminders: true,
    memberUpdates: false,
    reportGeneration: true
  });

  // Meeting Settings
  const [meetingSettings, setMeetingSettings] = useState({
    defaultDuration: '60',
    reminderTime: '15',
    autoAttendance: true,
    requireRSVP: false,
    maxParticipants: '50',
    allowVirtual: true,
    recordingEnabled: false
  });

  // Activity Settings
  const [activitySettings, setActivitySettings] = useState({
    requireApproval: true,
    autoScheduling: false,
    participantLimit: '100',
    reminderNotifications: true,
    followUpRequired: true,
    photoDocumentation: true,
    reportTemplate: 'standard'
  });

  // Training Settings
  const [trainingSettings, setTrainingSettings] = useState({
    certificationRequired: true,
    skillTracking: true,
    refresherCourses: true,
    assessmentRequired: true,
    maxClassSize: '30',
    allowOnline: true,
    continuingEducation: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordPolicy: 'strong',
    dataEncryption: true,
    auditLogging: true,
    backupFrequency: 'daily',
    dataRetention: '7'
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Settings Saved',
        description: 'Your BASCA settings have been updated successfully.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    toast({
      title: 'Settings Reset',
      description: 'Settings have been reset to default values.',
      variant: 'default'
    });
  };

  const updateGeneralSetting = (key: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateMeetingSetting = (key: string, value: string | boolean) => {
    setMeetingSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateActivitySetting = (key: string, value: string | boolean) => {
    setActivitySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTrainingSetting = (key: string, value: string | boolean) => {
    setTrainingSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSecuritySetting = (key: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] via-[#F0EDE8] to-[#E6B800]/20 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#333333] mb-2">
            BASCA Settings
          </h1>
          <p className="text-lg lg:text-xl text-[#666666]">
            Configure your BASCA system preferences and settings
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-[#00B5AD] hover:bg-[#009C94] text-white flex items-center gap-2">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={generalSettings.organizationName}
                  onChange={e =>
                    updateGeneralSetting('organizationName', e.target.value)
                  }
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={e =>
                    updateGeneralSetting('contactEmail', e.target.value)
                  }
                  placeholder="Enter contact email"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={generalSettings.contactPhone}
                  onChange={e =>
                    updateGeneralSetting('contactPhone', e.target.value)
                  }
                  placeholder="Enter contact phone"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={generalSettings.address}
                  onChange={e =>
                    updateGeneralSetting('address', e.target.value)
                  }
                  placeholder="Enter address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={value =>
                      updateGeneralSetting('timezone', value)
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Manila">
                        Asia/Manila (GMT+8)
                      </SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (GMT-5)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={value =>
                      updateGeneralSetting('language', value)
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="tl">Tagalog</SelectItem>
                      <SelectItem value="ceb">Cebuano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotif">Email Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={checked =>
                    updateNotificationSetting('emailNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotif">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="smsNotif"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={checked =>
                    updateNotificationSetting('smsNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotif">Push Notifications</Label>
                  <p className="text-sm text-gray-600">
                    Receive push notifications in app
                  </p>
                </div>
                <Switch
                  id="pushNotif"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={checked =>
                    updateNotificationSetting('pushNotifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meetingReminders">Meeting Reminders</Label>
                  <p className="text-sm text-gray-600">
                    Get reminded about upcoming meetings
                  </p>
                </div>
                <Switch
                  id="meetingReminders"
                  checked={notificationSettings.meetingReminders}
                  onCheckedChange={checked =>
                    updateNotificationSetting('meetingReminders', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activityUpdates">Activity Updates</Label>
                  <p className="text-sm text-gray-600">
                    Get notified about activity changes
                  </p>
                </div>
                <Switch
                  id="activityUpdates"
                  checked={notificationSettings.activityUpdates}
                  onCheckedChange={checked =>
                    updateNotificationSetting('activityUpdates', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Meeting Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Meeting Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDuration">
                    Default Duration (minutes)
                  </Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={meetingSettings.defaultDuration}
                    onChange={e =>
                      updateMeetingSetting('defaultDuration', e.target.value)
                    }
                    min="15"
                    max="480"
                  />
                </div>

                <div>
                  <Label htmlFor="reminderTime">
                    Reminder Time (minutes before)
                  </Label>
                  <Input
                    id="reminderTime"
                    type="number"
                    value={meetingSettings.reminderTime}
                    onChange={e =>
                      updateMeetingSetting('reminderTime', e.target.value)
                    }
                    min="5"
                    max="1440"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAttendance">Auto Attendance</Label>
                  <p className="text-sm text-gray-600">
                    Automatically mark attendance
                  </p>
                </div>
                <Switch
                  id="autoAttendance"
                  checked={meetingSettings.autoAttendance}
                  onCheckedChange={checked =>
                    updateMeetingSetting('autoAttendance', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireRSVP">Require RSVP</Label>
                  <p className="text-sm text-gray-600">
                    Require members to RSVP
                  </p>
                </div>
                <Switch
                  id="requireRSVP"
                  checked={meetingSettings.requireRSVP}
                  onCheckedChange={checked =>
                    updateMeetingSetting('requireRSVP', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={meetingSettings.maxParticipants}
                  onChange={e =>
                    updateMeetingSetting('maxParticipants', e.target.value)
                  }
                  min="1"
                  max="1000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <p className="text-sm text-gray-600">
                    Activities require admin approval
                  </p>
                </div>
                <Switch
                  id="requireApproval"
                  checked={activitySettings.requireApproval}
                  onCheckedChange={checked =>
                    updateActivitySetting('requireApproval', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoScheduling">Auto Scheduling</Label>
                  <p className="text-sm text-gray-600">
                    Automatically schedule activities
                  </p>
                </div>
                <Switch
                  id="autoScheduling"
                  checked={activitySettings.autoScheduling}
                  onCheckedChange={checked =>
                    updateActivitySetting('autoScheduling', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="participantLimit">Participant Limit</Label>
                <Input
                  id="participantLimit"
                  type="number"
                  value={activitySettings.participantLimit}
                  onChange={e =>
                    updateActivitySetting('participantLimit', e.target.value)
                  }
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <Label htmlFor="reportTemplate">Report Template</Label>
                <Select
                  value={activitySettings.reportTemplate}
                  onValueChange={value =>
                    updateActivitySetting('reportTemplate', value)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Template</SelectItem>
                    <SelectItem value="detailed">Detailed Template</SelectItem>
                    <SelectItem value="summary">Summary Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Training Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Training Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="certificationRequired">
                    Certification Required
                  </Label>
                  <p className="text-sm text-gray-600">
                    Require certification for training
                  </p>
                </div>
                <Switch
                  id="certificationRequired"
                  checked={trainingSettings.certificationRequired}
                  onCheckedChange={checked =>
                    updateTrainingSetting('certificationRequired', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skillTracking">Skill Tracking</Label>
                  <p className="text-sm text-gray-600">
                    Track member skills and progress
                  </p>
                </div>
                <Switch
                  id="skillTracking"
                  checked={trainingSettings.skillTracking}
                  onCheckedChange={checked =>
                    updateTrainingSetting('skillTracking', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="maxClassSize">Maximum Class Size</Label>
                <Input
                  id="maxClassSize"
                  type="number"
                  value={trainingSettings.maxClassSize}
                  onChange={e =>
                    updateTrainingSetting('maxClassSize', e.target.value)
                  }
                  min="1"
                  max="100"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowOnline">Allow Online Training</Label>
                  <p className="text-sm text-gray-600">
                    Enable virtual training sessions
                  </p>
                </div>
                <Switch
                  id="allowOnline"
                  checked={trainingSettings.allowOnline}
                  onCheckedChange={checked =>
                    updateTrainingSetting('allowOnline', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-gray-600">Require 2FA for login</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={checked =>
                    updateSecuritySetting('twoFactorAuth', checked)
                  }
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={e =>
                    updateSecuritySetting('sessionTimeout', e.target.value)
                  }
                  min="5"
                  max="1440"
                />
              </div>

              <div>
                <Label htmlFor="passwordPolicy">Password Policy</Label>
                <Select
                  value={securitySettings.passwordPolicy}
                  onValueChange={value =>
                    updateSecuritySetting('passwordPolicy', value)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                    <SelectItem value="strong">
                      Strong (12+ characters, symbols)
                    </SelectItem>
                    <SelectItem value="very-strong">
                      Very Strong (16+ characters, symbols, numbers)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dataEncryption">Data Encryption</Label>
                  <p className="text-sm text-gray-600">
                    Encrypt sensitive data
                  </p>
                </div>
                <Switch
                  id="dataEncryption"
                  checked={securitySettings.dataEncryption}
                  onCheckedChange={checked =>
                    updateSecuritySetting('dataEncryption', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auditLogging">Audit Logging</Label>
                  <p className="text-sm text-gray-600">
                    Log all system activities
                  </p>
                </div>
                <Switch
                  id="auditLogging"
                  checked={securitySettings.auditLogging}
                  onCheckedChange={checked =>
                    updateSecuritySetting('auditLogging', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-white/90 backdrop-blur-sm border border-[#E0DDD8] shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-gray-600">Connected and healthy</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">API Services</p>
                  <p className="text-sm text-gray-600">
                    All services operational
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-gray-600">85% capacity used</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
