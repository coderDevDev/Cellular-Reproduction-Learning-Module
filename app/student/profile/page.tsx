'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  User,
  Mail,
  Calendar,
  GraduationCap,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Edit3,
  Target,
  Trophy,
  Eye,
  Headphones,
  PenTool,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const GRADE_LEVELS = [
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'College Level'
];

const LEARNING_STYLES = [
  {
    value: 'visual',
    label: 'Visual',
    description: 'Learn through images, diagrams, and visual aids',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'auditory',
    label: 'Auditory',
    description: 'Learn through listening and sound',
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'reading_writing',
    label: 'Reading/Writing',
    description: 'Learn through reading and writing',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    value: 'kinesthetic',
    label: 'Kinesthetic',
    description: 'Learn through hands-on activities and movement',
    color: 'bg-orange-100 text-orange-800'
  }
];

export default function StudentProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    email: '',
    gradeLevel: '',
    learningStyle: '',
    profilePhoto: ''
  });

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        fullName: user.fullName || '',
        email: user.email || '',
        gradeLevel: user.gradeLevel || '',
        learningStyle: user.learningStyle || '',
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate full name when first or last name changes
    if (field === 'firstName' || field === 'lastName') {
      setProfileData(current => {
        const firstName = field === 'firstName' ? value : current.firstName;
        const lastName = field === 'lastName' ? value : current.lastName;
        return {
          ...current,
          fullName: `${firstName} ${lastName}`.trim()
        };
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        firstName: profileData.firstName || undefined,
        middleName: profileData.middleName || undefined,
        lastName: profileData.lastName || undefined,
        fullName: profileData.fullName || undefined,
        gradeLevel: profileData.gradeLevel || undefined,
        learningStyle: profileData.learningStyle as
          | 'visual'
          | 'auditory'
          | 'reading_writing'
          | 'kinesthetic'
          | undefined,
        profilePhoto: profileData.profilePhoto || undefined
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    try {
      // Convert to base64 for now (in production, upload to cloud storage)
      const reader = new FileReader();
      reader.onload = e => {
        const base64 = e.target?.result as string;
        setProfileData(prev => ({
          ...prev,
          profilePhoto: base64
        }));
        setIsLoading(false);
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentLearningStyle = LEARNING_STYLES.find(
    style => style.value === profileData.learningStyle
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-[#00af8f] to-gray-900 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your personal information and learning preferences
          </p>
        </div>

        {/* Learning Style Profile */}
        {user && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-[#00af8f]/5 to-[#00af90]/5 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {(user as any)?.preferredModules && (user as any).preferredModules.length > 1 ? (
                    <div className="flex -space-x-2">
                      {(user as any).preferredModules.slice(0, 4).map((module: string, idx: number) => {
                        const moduleToKeyMap: Record<string, 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic'> = {
                          'Visual': 'visual',
                          'Aural': 'auditory',
                          'Read/Write': 'reading_writing',
                          'Kinesthetic': 'kinesthetic'
                        };
                        
                        const learningStyleIcons = {
                          visual: Eye,
                          auditory: Headphones,
                          reading_writing: PenTool,
                          kinesthetic: Zap
                        };
                        
                        const learningStyleColors = {
                          visual: 'from-blue-500 to-blue-600',
                          auditory: 'from-green-500 to-green-600',
                          reading_writing: 'from-purple-500 to-purple-600',
                          kinesthetic: 'from-orange-500 to-orange-600'
                        };
                        
                        const styleKey = moduleToKeyMap[module] || 'visual';
                        const Icon = learningStyleIcons[styleKey] || Eye;
                        const colorClass = learningStyleColors[styleKey] || 'from-blue-500 to-blue-600';
                        
                        return (
                          <div
                            key={idx}
                            className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center shadow-lg">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {(user as any)?.learningType || 'Unimodal'}
                      <span className="text-gray-600"> Learner</span>
                    </h3>
                    <p className="text-gray-600">
                      {(user as any)?.preferredModules && (user as any).preferredModules.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(user as any).preferredModules.map((module: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs px-2 py-0.5 bg-gradient-to-r from-[#00af8f]/10 to-teal-400/10 text-[#00af8f] border border-[#00af8f]/20">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span>Your unique learning profile</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#00af8f]">
                    <Trophy className="w-8 h-8 mx-auto mb-1" />
                  </div>
                  <div className="text-xs text-gray-500">Learning Profile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-teal-50/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                {/* Profile Photo */}
                <div className="relative mb-6">
                  <Avatar className="w-32 h-32 mx-auto ring-4 ring-teal-100 shadow-2xl">
                    <AvatarImage src={profileData.profilePhoto} />
                    <AvatarFallback className="bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white text-3xl font-bold">
                      {profileData.firstName?.charAt(0) ||
                        profileData.email?.charAt(0) ||
                        'S'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Photo Upload Button */}
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-[#00af8f] to-[#00af90] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>

                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profileData.fullName || profileData.firstName || 'Student'}
                </h2>
                <p className="text-gray-600 mb-4">{profileData.email}</p>

                {/* Role Badge */}
                <Badge className="bg-gradient-to-r from-[#00af8f] to-[#00af90] text-white px-4 py-2 text-sm mb-4">
                  <User className="w-4 h-4 mr-1" />
                  Student
                </Badge>

                {/* Learning Style Badge */}
                {profileData.learningStyle && currentLearningStyle && (
                  <Badge
                    className={`${currentLearningStyle.color} px-4 py-2 text-sm mb-4`}>
                    <Target className="w-4 h-4 mr-1" />
                    {currentLearningStyle.label} Learner
                  </Badge>
                )}

                {/* Grade Level */}
                {profileData.gradeLevel && (
                  <Badge variant="outline" className="text-sm mb-4">
                    <GraduationCap className="w-4 h-4 mr-1" />
                    {profileData.gradeLevel}
                  </Badge>
                )}

                {/* Account Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Member since{' '}
                    {new Date(user.createdAt || '').toLocaleDateString()}
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Account Verified
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-teal-50/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                  <Edit3 className="w-5 h-5 mr-2 text-[#00af8f]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={e =>
                        handleInputChange('firstName', e.target.value)
                      }
                      placeholder="Enter first name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="middleName"
                      className="text-sm font-medium text-gray-700">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      value={profileData.middleName}
                      onChange={e =>
                        handleInputChange('middleName', e.target.value)
                      }
                      placeholder="Enter middle name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={e =>
                        handleInputChange('lastName', e.target.value)
                      }
                      placeholder="Enter last name"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Full Name (Auto-generated) */}
                <div>
                  <Label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={e =>
                      handleInputChange('fullName', e.target.value)
                    }
                    placeholder="Full name (auto-generated)"
                    className="mt-1 bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is automatically generated from your first and last
                    name
                  </p>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    className="mt-1 bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <Separator />

                {/* Learning Information */}
                <div>
                

                
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
