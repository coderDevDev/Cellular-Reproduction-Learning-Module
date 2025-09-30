'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, AlertTriangle, User, Shield } from 'lucide-react';
import type { SeniorCitizen } from '@/types/property';
import { toast } from 'sonner';

interface DeleteSeniorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  senior: SeniorCitizen;
  onSuccess: () => void;
}

export function DeleteSeniorDialog({
  isOpen,
  onClose,
  senior,
  onSuccess
}: DeleteSeniorDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Use real name data from senior object
  const seniorName = {
    firstName: senior.firstName || 'Unknown',
    lastName: senior.lastName || 'User'
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      console.log('Deleting senior citizen:', senior.id);

      // Import and call the delete API
      const { SeniorCitizensAPI } = await import('@/lib/api/senior-citizens');
      const result = await SeniorCitizensAPI.deleteSeniorCitizen(senior.id);

      if (result.success) {
        toast.success('Senior citizen deleted successfully!', {
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            border: '1px solid #059669'
          },
          duration: 4000
        });
        onSuccess();
      } else {
        throw new Error('Failed to delete senior citizen');
      }
    } catch (error) {
      console.error('Error deleting senior citizen:', error);
      toast.error('Failed to delete senior citizen', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          border: '1px solid #DC2626'
        },
        duration: 4000
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-[#333333]">
            <Trash2 className="w-6 h-6 text-red-500" />
            Delete Senior Citizen
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#666666]">
            This action cannot be undone. This will permanently delete the
            senior citizen record and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Senior Information */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={senior.seniorIdPhoto} alt="Senior" />
              <AvatarFallback className="bg-[#00af8f]/10 text-[#00af8f]">
                {seniorName.firstName.charAt(0)}
                {seniorName.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-[#333333]">
                {seniorName.firstName} {seniorName.lastName}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#00af8f]" />
                <span className="text-[#666666]">OSCA ID:</span>
                <span className="font-mono font-medium text-[#00af8f]">
                  {senior.oscaId}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#666666]" />
              <span className="text-[#666666]">Barangay:</span>
              <span className="text-[#333333]">{senior.barangay}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">
                Status: {senior.status}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-yellow-800 mb-1">Warning</h4>
              <p className="text-yellow-700">
                Deleting this record will remove all associated data including:
              </p>
              <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
                <li>Personal information</li>
                <li>Medical records</li>
                <li>Contact details</li>
                <li>Document history</li>
                <li>Appointment records</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="border-[#666666] text-[#666666] hover:bg-[#666666]/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
