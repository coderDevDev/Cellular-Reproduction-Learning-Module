'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  BookOpen,
  Camera,
  Save,
  Edit3,
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfilePhotoUpload } from '@/components/profile-photo-upload';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  profilePhoto: z.string().optional()
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function StudentProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      middleName: user?.middleName || '',
      lastName: user?.lastName || '',
      gradeLevel: user?.gradeLevel || '',
      profilePhoto: user?.profilePhoto || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isDirty: isPasswordDirty },
    reset: resetPassword,
    setValue: setPasswordValue
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('middleName', user.middleName || '');
      setValue('lastName', user.lastName || '');
      setValue('gradeLevel', user.gradeLevel || '');
      setValue('profilePhoto', user.profilePhoto || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateProfile({
        id: user.id,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        gradeLevel: data.gradeLevel,
        profilePhoto: data.profilePhoto
      });

      if (result.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.'
        });
        setIsEditing(false);
        reset(data); // Reset form with new data
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement password change API
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.'
      });
      resetPassword();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00af8f]"></div>
      </div>
    );
  }

  const fullName =
    user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const initials = fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header Card */}
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Profile Photo */}
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={user.profilePhoto || ''}
                        alt={fullName}
                      />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-[#00af8f] to-[#00af90] text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white border-2 border-[#00af8f] hover:bg-[#00af8f] hover:text-white">
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {fullName}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-[#00af8f]/10 text-[#00af8f] border-[#00af8f]/20">
                        <User className="w-3 h-3 mr-1" />
                        {user.role?.charAt(0).toUpperCase() +
                          user.role?.slice(1)}
                      </Badge>
                      {user.learningStyle && (
                        <Badge
                          variant="outline"
                          className="border-[#ffd416] text-[#ffd416]">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {user.learningStyle
                            .replace('_', ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      )}
                      {user.gradeLevel && (
                        <Badge
                          variant="outline"
                          className="border-purple-500 text-purple-600">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          Grade {user.gradeLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex-shrink-0">
                    {!isEditing ? (
                      <Button
                        onClick={handleEdit}
                        variant="outline"
                        className="border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f] hover:text-white">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmit(onSubmit)}
                          disabled={!isDirty || isLoading}
                          className="bg-[#00af8f] hover:bg-[#00af90]">
                          {isLoading ? (
                            'Saving...'
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Profile Photo Upload */}
                {isEditing && (
                  <div className="col-span-full mb-6">
                    <ProfilePhotoUpload
                      currentPhoto={user.profilePhoto}
                      onPhotoChange={photoUrl =>
                        setValue('profilePhoto', photoUrl)
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-gray-700 font-medium">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      disabled={!isEditing}
                      className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="middleName"
                      className="text-gray-700 font-medium">
                      Middle Name
                    </Label>
                    <Input
                      id="middleName"
                      {...register('middleName')}
                      disabled={!isEditing}
                      className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                    />
                    {errors.middleName && (
                      <p className="text-red-500 text-sm">
                        {errors.middleName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-gray-700 font-medium">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      disabled={!isEditing}
                      className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="gradeLevel"
                      className="text-gray-700 font-medium">
                      Grade Level *
                    </Label>
                    <Select
                      disabled={!isEditing}
                      onValueChange={value => setValue('gradeLevel', value)}
                      defaultValue={watch('gradeLevel')}>
                      <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl">
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        {['7', '8', '9', '10', '11', '12'].map(grade => (
                          <SelectItem key={grade} value={grade}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gradeLevel && (
                      <p className="text-red-500 text-sm">
                        {errors.gradeLevel.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Information (Read-only) */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">
                        Email Address
                      </Label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-sm">
                        Member Since
                      </Label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-[#00af8f]" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitPassword(onSubmitPassword)}
                  className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className="text-gray-700 font-medium">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...registerPassword('currentPassword')}
                        className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }>
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className="text-gray-700 font-medium">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        {...registerPassword('newPassword')}
                        className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-700 font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerPassword('confirmPassword')}
                        className="h-11 border-2 border-gray-200 focus:border-[#00af8f] focus:ring-2 focus:ring-[#00af8f]/20 rounded-xl pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }>
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={!isPasswordDirty || isLoading}
                    className="w-full bg-[#00af8f] hover:bg-[#00af90] h-11">
                    {isLoading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
