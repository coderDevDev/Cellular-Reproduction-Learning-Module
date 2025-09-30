'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, X, Users, GraduationCap } from 'lucide-react';
import { ClassStudent } from '@/types/class';
import { toast } from '@/hooks/use-toast';

interface StudentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  currentStudents: ClassStudent[];
  availableStudents: any[];
  onAddStudents: (studentIds: string[]) => Promise<void>;
  onRemoveStudents: (studentIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function StudentManagementModal({
  isOpen,
  onClose,
  classId,
  currentStudents,
  availableStudents,
  onAddStudents,
  onRemoveStudents,
  isLoading = false
}: StudentManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState<
    string[]
  >([]);
  const [selectedCurrentStudents, setSelectedCurrentStudents] = useState<
    string[]
  >([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('StudentManagementModal - classId:', classId);
      console.log('StudentManagementModal - currentStudents:', currentStudents);
      console.log(
        'StudentManagementModal - availableStudents:',
        availableStudents
      );
    }
  }, [isOpen, classId, currentStudents, availableStudents]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedAvailableStudents([]);
      setSelectedCurrentStudents([]);
    }
  }, [isOpen]);

  const filteredAvailableStudents = availableStudents.filter(
    student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudents = async () => {
    if (selectedAvailableStudents.length === 0) return;

    try {
      setIsAdding(true);
      await onAddStudents(selectedAvailableStudents);
      setSelectedAvailableStudents([]);
      toast({
        title: 'Students Added',
        description: `${selectedAvailableStudents.length} student(s) have been added to the class.`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add students. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudents = async () => {
    if (selectedCurrentStudents.length === 0) return;

    try {
      setIsRemoving(true);
      await onRemoveStudents(selectedCurrentStudents);
      setSelectedCurrentStudents([]);
      toast({
        title: 'Students Removed',
        description: `${selectedCurrentStudents.length} student(s) have been removed from the class.`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove students. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClose = () => {
    if (!isAdding && !isRemoving) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Students
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Current Students Section */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Current Students ({currentStudents.length})
              </h3>
              {selectedCurrentStudents.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveStudents}
                  disabled={isRemoving}>
                  {isRemoving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Removing...</span>
                    </div>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Remove Selected ({selectedCurrentStudents.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {currentStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No students enrolled in this class yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentStudents.map(student => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedCurrentStudents.includes(student.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedCurrentStudents.includes(student.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              setSelectedCurrentStudents([
                                ...selectedCurrentStudents,
                                student.id
                              ]);
                            } else {
                              setSelectedCurrentStudents(
                                selectedCurrentStudents.filter(
                                  id => id !== student.id
                                )
                              );
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {student.learning_style && (
                          <Badge variant="secondary" className="text-xs">
                            {student.learning_style}
                          </Badge>
                        )}
                        {student.grade_level && (
                          <Badge variant="outline" className="text-xs">
                            {student.grade_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Students Section */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Available Students ({availableStudents.length})
              </h3>
              {selectedAvailableStudents.length > 0 && (
                <Button
                  onClick={handleAddStudents}
                  disabled={isAdding}
                  className="bg-gradient-to-r from-[#00af8f] to-[#00af90] hover:from-[#00af90] hover:to-[#00af8f] text-white border-0">
                  {isAdding ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Selected ({selectedAvailableStudents.length})
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {filteredAvailableStudents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <GraduationCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>
                      {searchTerm
                        ? 'No students found matching your search.'
                        : 'No available students to add.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAvailableStudents.map(student => (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          selectedAvailableStudents.includes(student.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedAvailableStudents.includes(
                              student.id
                            )}
                            onCheckedChange={checked => {
                              if (checked) {
                                setSelectedAvailableStudents([
                                  ...selectedAvailableStudents,
                                  student.id
                                ]);
                              } else {
                                setSelectedAvailableStudents(
                                  selectedAvailableStudents.filter(
                                    id => id !== student.id
                                  )
                                );
                              }
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.full_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {student.learning_style && (
                            <Badge variant="secondary" className="text-xs">
                              {student.learning_style}
                            </Badge>
                          )}
                          {student.grade_level && (
                            <Badge variant="outline" className="text-xs">
                              {student.grade_level}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAdding || isRemoving}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
