'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BascaMembersAPI } from '@/lib/api/basca-members';
import type { BascaMember } from '@/types/basca';

interface DeleteBascaMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: BascaMember;
  onSuccess: () => void;
}

export function DeleteBascaMemberDialog({
  isOpen,
  onClose,
  member,
  onSuccess
}: DeleteBascaMemberDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await BascaMembersAPI.deleteBascaMember(member.id);

      toast({
        title: 'Success',
        description: 'Basca member deleted successfully',
        variant: 'default'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting basca member:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete basca member. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Basca Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-semibold">
              {member.firstName} {member.lastName}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
