'use client';

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
import { Class } from '@/types/class';

interface DeleteClassDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  classData: Class | null;
  isDeleting: boolean;
}

export default function DeleteClassDialog({
  isOpen,
  onClose,
  onConfirm,
  classData,
  isDeleting
}: DeleteClassDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error deleting class:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">
            Delete Class
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{classData?.name}"? This action
            cannot be undone.
            <br />
            <br />
            <strong>Warning:</strong> This will also remove:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All student enrollments</li>
              <li>All assigned lessons, quizzes, and activities</li>
              <li>All progress data and submissions</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white">
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete Class'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}






