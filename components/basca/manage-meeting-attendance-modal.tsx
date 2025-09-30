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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Search,
  Filter,
  Download,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BascaMeeting, BascaMember } from '@/types/basca';

interface ManageMeetingAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: BascaMeeting | null;
  onSuccess: () => void;
}

interface AttendanceRecord {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  isPresent: boolean;
  isRSVP: boolean;
  rsvpStatus: 'confirmed' | 'declined' | 'pending' | 'no_response';
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

export default function ManageMeetingAttendanceModal({
  isOpen,
  onClose,
  meeting,
  onSuccess
}: ManageMeetingAttendanceModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    if (meeting && isOpen) {
      // Simulate loading attendance records
      const mockRecords: AttendanceRecord[] = [
        {
          memberId: '1',
          memberName: 'Juan Dela Cruz',
          memberEmail: 'juan@example.com',
          memberPhone: '+63 912 345 6789',
          isPresent: true,
          isRSVP: true,
          rsvpStatus: 'confirmed',
          arrivalTime: '09:00',
          departureTime: '11:00',
          notes: 'On time'
        },
        {
          memberId: '2',
          memberName: 'Maria Santos',
          memberEmail: 'maria@example.com',
          memberPhone: '+63 923 456 7890',
          isPresent: false,
          isRSVP: true,
          rsvpStatus: 'declined',
          notes: 'Prior commitment'
        },
        {
          memberId: '3',
          memberName: 'Pedro Reyes',
          memberEmail: 'pedro@example.com',
          memberPhone: '+63 934 567 8901',
          isPresent: true,
          isRSVP: false,
          rsvpStatus: 'no_response',
          arrivalTime: '09:15',
          departureTime: '11:00',
          notes: 'Late arrival'
        }
      ];
      setAttendanceRecords(mockRecords);
    }
  }, [meeting, isOpen]);

  const handleAttendanceChange = (memberId: string, isPresent: boolean) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.memberId === memberId
          ? {
              ...record,
              isPresent,
              arrivalTime: isPresent
                ? new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : undefined
            }
          : record
      )
    );
  };

  const handleRSVPStatusChange = (
    memberId: string,
    status: 'confirmed' | 'declined' | 'pending' | 'no_response'
  ) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.memberId === memberId
          ? { ...record, rsvpStatus: status, isRSVP: status !== 'no_response' }
          : record
      )
    );
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    // TODO: Replace with actual API call to add member to meeting
    const newMember: AttendanceRecord = {
      memberId: Date.now().toString(),
      memberName: 'New Member',
      memberEmail: newMemberEmail,
      memberPhone: '',
      isPresent: false,
      isRSVP: false,
      rsvpStatus: 'no_response'
    };

    setAttendanceRecords(prev => [...prev, newMember]);
    setNewMemberEmail('');
    setShowAddMember(false);

    toast({
      title: 'Success',
      description: 'Member added to meeting.',
      variant: 'default'
    });
  };

  const handleSaveAttendance = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to save attendance
      console.log('Saving attendance:', attendanceRecords);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Success',
        description: 'Attendance saved successfully.',
        variant: 'default'
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to save attendance. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      // TODO: Replace with actual API call to send reminders
      console.log(
        'Sending reminders to:',
        attendanceRecords.filter(r => r.rsvpStatus === 'no_response')
      );

      toast({
        title: 'Success',
        description: 'Reminders sent successfully.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminders. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleExportAttendance = () => {
    // TODO: Implement CSV export
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Email,Phone,Present,RSVP Status,Arrival Time,Departure Time,Notes\n' +
      attendanceRecords
        .map(
          record =>
            `${record.memberName},${record.memberEmail},${record.memberPhone},${
              record.isPresent ? 'Yes' : 'No'
            },${record.rsvpStatus},${record.arrivalTime || ''},${
              record.departureTime || ''
            },${record.notes || ''}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `attendance_${meeting?.title || 'meeting'}_${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Attendance exported successfully.',
      variant: 'default'
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch =
      record.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.memberEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'present') return matchesSearch && record.isPresent;
    if (filterStatus === 'absent') return matchesSearch && !record.isPresent;
    if (filterStatus === 'confirmed')
      return matchesSearch && record.rsvpStatus === 'confirmed';
    if (filterStatus === 'declined')
      return matchesSearch && record.rsvpStatus === 'declined';
    if (filterStatus === 'pending')
      return matchesSearch && record.rsvpStatus === 'pending';
    if (filterStatus === 'no_response')
      return matchesSearch && record.rsvpStatus === 'no_response';

    return matchesSearch;
  });

  const presentCount = attendanceRecords.filter(r => r.isPresent).length;
  const absentCount = attendanceRecords.filter(r => !r.isPresent).length;
  const confirmedCount = attendanceRecords.filter(
    r => r.rsvpStatus === 'confirmed'
  ).length;
  const declinedCount = attendanceRecords.filter(
    r => r.rsvpStatus === 'declined'
  ).length;
  const pendingCount = attendanceRecords.filter(
    r => r.rsvpStatus === 'pending'
  ).length;
  const noResponseCount = attendanceRecords.filter(
    r => r.rsvpStatus === 'no_response'
  ).length;

  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Meeting Attendance - {meeting.title}
          </DialogTitle>
        </DialogHeader>

        {/* Meeting Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Date:</span> {meeting.meetingDate}
            </div>
            <div>
              <span className="font-medium">Time:</span> {meeting.startTime} -{' '}
              {meeting.endTime}
            </div>
            <div>
              <span className="font-medium">Location:</span> {meeting.location}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {presentCount}
            </div>
            <div className="text-sm text-blue-800">Present</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{absentCount}</div>
            <div className="text-sm text-red-800">Absent</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {confirmedCount}
            </div>
            <div className="text-sm text-green-800">Confirmed</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {declinedCount}
            </div>
            <div className="text-sm text-orange-800">Declined</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <div className="text-sm text-yellow-800">Pending</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">
              {noResponseCount}
            </div>
            <div className="text-sm text-gray-800">No Response</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="confirmed">Confirmed RSVP</SelectItem>
              <SelectItem value="declined">Declined RSVP</SelectItem>
              <SelectItem value="pending">Pending RSVP</SelectItem>
              <SelectItem value="no_response">No Response</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Member
          </Button>

          <Button
            variant="outline"
            onClick={handleSendReminders}
            className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send Reminders
          </Button>

          <Button
            variant="outline"
            onClick={handleExportAttendance}
            className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="newMemberEmail">Member Email</Label>
                <Input
                  id="newMemberEmail"
                  type="email"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  placeholder="Enter member email to invite"
                />
              </div>
              <Button onClick={handleAddMember} size="sm">
                Add
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddMember(false)}
                size="sm">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    Present
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    RSVP Status
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map(record => (
                  <tr key={record.memberId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {record.memberName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {record.memberEmail}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.memberPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={record.isPresent}
                        onCheckedChange={checked =>
                          handleAttendanceChange(record.memberId, checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Select
                        value={record.rsvpStatus}
                        onValueChange={(
                          value:
                            | 'confirmed'
                            | 'declined'
                            | 'pending'
                            | 'no_response'
                        ) => handleRSVPStatusChange(record.memberId, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="no_response">
                            No Response
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {record.isPresent && (
                        <div>
                          <div className="text-green-600">
                            Arrival: {record.arrivalTime}
                          </div>
                          {record.departureTime && (
                            <div className="text-gray-600">
                              Departure: {record.departureTime}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        placeholder="Add notes..."
                        value={record.notes || ''}
                        onChange={e => {
                          setAttendanceRecords(prev =>
                            prev.map(r =>
                              r.memberId === record.memberId
                                ? { ...r, notes: e.target.value }
                                : r
                            )
                          );
                        }}
                        className="text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAttendance}
            disabled={isLoading}
            className="bg-[#00B5AD] hover:bg-[#009C94] text-white">
            {isLoading ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
