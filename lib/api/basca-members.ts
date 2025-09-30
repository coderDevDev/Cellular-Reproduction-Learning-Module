import { supabase } from '@/lib/supabase';
import type {
  BascaMember,
  CreateBascaMemberData,
  UpdateBascaMemberData
} from '@/types/basca';

export class BascaMembersAPI {
  static async createBascaMember(
    data: CreateBascaMemberData,
    userId?: string
  ): Promise<BascaMember> {
    try {
      // First create the user account
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: data.email,
        password: 'temporaryPassword123!', // This should be changed by the user
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            role: 'basca',
            barangay: data.barangay,
            barangay_code: data.barangayCode,
            department: data.department,
            position: data.position,
            employee_id: data.employeeId
          }
        }
      });

      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      if (!userData.user) {
        throw new Error('Failed to create user account');
      }

      // Create the basca member record
      const { data: bascaData, error: bascaError } = await supabase
        .from('users')
        .insert({
          id: userData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          role: 'basca',
          barangay: data.barangay,
          barangay_code: data.barangayCode,
          department: data.department,
          position: data.position,
          employee_id: data.employeeId,
          avatar_url: data.profilePicture,
          is_verified: false
        })
        .select()
        .single();

      if (bascaError) {
        // If basca member creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(userData.user.id);
        throw new Error(`Failed to create basca member: ${bascaError.message}`);
      }

      // Create additional basca member details if needed
      console.log('Creating basca member with data:', {
        user_id: userData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        barangay: data.barangay,
        barangay_code: data.barangayCode,
        address: data.address,
        region_code: data.addressData?.region?.region_code,
        province_code: data.addressData?.province?.province_code,
        city_code: data.addressData?.city?.city_code,
        position: data.position,
        department: data.department,
        employee_id: data.employeeId,
        join_date: data.joinDate,
        profile_picture: data.profilePicture,
        id_photo: data.idPhoto,
        notes: data.notes,
        is_active: true,
        created_by: userId
      });

      const { data: additionalData, error: additionalError } = await supabase
        .from('basca_members')
        .insert({
          user_id: userData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          barangay: data.barangay,
          barangay_code: data.barangayCode,
          address: data.address,
          region_code: data.addressData?.region?.region_code,
          province_code: data.addressData?.province?.province_code,
          city_code: data.addressData?.city?.city_code,
          position: data.position,
          department: data.department,
          employee_id: data.employeeId,
          join_date: data.joinDate,
          profile_picture: data.profilePicture,
          id_photo: data.idPhoto,
          notes: data.notes,
          is_active: true,
          created_by: userId
        })
        .select()
        .single();

      if (additionalError) {
        console.warn(
          'Failed to create additional basca member details:',
          additionalError
        );
        console.error('Full error details:', additionalError);
      } else {
        console.log(
          'Successfully created basca member details:',
          additionalData
        );
      }

      // Return the created basca member
      return {
        id: userData.user.id,
        userId: userData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        barangay: data.barangay,
        barangayCode: data.barangayCode,
        address: data.address,
        addressData: data.addressData,
        position: data.position,
        department: data.department,
        employeeId: data.employeeId,
        isActive: true,
        joinDate: data.joinDate,
        profilePicture: data.profilePicture,
        idPhoto: data.idPhoto,
        notes: data.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userId
      };
    } catch (error) {
      console.error('Error creating basca member:', error);
      throw error;
    }
  }

  static async updateBascaMember(
    data: UpdateBascaMemberData,
    userId?: string
  ): Promise<BascaMember> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
        updated_by: userId
      };

      // Update user table fields
      if (data.firstName) updateData.first_name = data.firstName;
      if (data.lastName) updateData.last_name = data.lastName;
      if (data.phone) updateData.phone = data.phone;
      if (data.barangay) updateData.barangay = data.barangay;
      if (data.barangayCode) updateData.barangay_code = data.barangayCode;
      if (data.department) updateData.department = data.department;
      if (data.position) updateData.position = data.position;
      if (data.employeeId) updateData.employee_id = data.employeeId;
      if (data.profilePicture) updateData.avatar_url = data.profilePicture;

      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (userError) {
        throw new Error(`Failed to update user: ${userError.message}`);
      }

      // Update basca_members table if it exists
      try {
        const bascaUpdateData: any = {
          updated_at: new Date().toISOString(),
          updated_by: userId
        };

        if (data.firstName) bascaUpdateData.first_name = data.firstName;
        if (data.lastName) bascaUpdateData.last_name = data.lastName;
        if (data.email) bascaUpdateData.email = data.email;
        if (data.phone) bascaUpdateData.phone = data.phone;
        if (data.barangay) bascaUpdateData.barangay = data.barangay;
        if (data.barangayCode)
          bascaUpdateData.barangay_code = data.barangayCode;
        if (data.address) bascaUpdateData.address = data.address;
        if (data.addressData?.region?.region_code)
          bascaUpdateData.region_code = data.addressData.region.region_code;
        if (data.addressData?.province?.province_code)
          bascaUpdateData.province_code =
            data.addressData.province.province_code;
        if (data.addressData?.city?.city_code)
          bascaUpdateData.city_code = data.addressData.city.city_code;
        if (data.position) bascaUpdateData.position = data.position;
        if (data.department) bascaUpdateData.department = data.department;
        if (data.employeeId) bascaUpdateData.employee_id = data.employeeId;
        if (data.joinDate) bascaUpdateData.join_date = data.joinDate;
        if (data.profilePicture)
          bascaUpdateData.profile_picture = data.profilePicture;
        if (data.idPhoto) bascaUpdateData.id_photo = data.idPhoto;
        if (data.notes) bascaUpdateData.notes = data.notes;
        if (data.isActive !== undefined)
          bascaUpdateData.is_active = data.isActive;

        await supabase
          .from('basca_members')
          .update(bascaUpdateData)
          .eq('user_id', data.id);
      } catch (error) {
        console.warn('Failed to update basca_members table:', error);
      }

      // Return the updated basca member
      return {
        id: updatedUser.id,
        userId: updatedUser.id,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        barangay: updatedUser.barangay,
        barangayCode: updatedUser.barangay_code,
        address: data.address || '',
        addressData: data.addressData,
        position: updatedUser.position,
        department: updatedUser.department,
        employeeId: updatedUser.employee_id,
        isActive: data.isActive !== undefined ? data.isActive : true,
        joinDate: data.joinDate || new Date().toISOString(),
        profilePicture: updatedUser.avatar_url,
        idPhoto: data.idPhoto || '',
        notes: data.notes,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        created_by: updatedUser.created_by
      };
    } catch (error) {
      console.error('Error updating basca member:', error);
      throw error;
    }
  }

  static async deleteBascaMember(id: string): Promise<void> {
    try {
      // Delete from basca_members table if it exists
      try {
        await supabase.from('basca_members').delete().eq('user_id', id);
      } catch (error) {
        console.warn('Failed to delete from basca_members table:', error);
      }

      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) {
        throw new Error(`Failed to delete user: ${userError.message}`);
      }

      // Note: We don't delete the auth user here for security reasons
      // The auth user should be deactivated instead
    } catch (error) {
      console.error('Error deleting basca member:', error);
      throw error;
    }
  }

  static async getBascaMember(id: string): Promise<BascaMember | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'basca')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw new Error(`Failed to fetch basca member: ${error.message}`);
      }

      // Try to get additional data from basca_members table
      let additionalData = null;
      try {
        const { data: bascaData } = await supabase
          .from('basca_members')
          .select('*')
          .eq('user_id', id)
          .single();
        additionalData = bascaData;
      } catch (error) {
        console.warn('No additional basca member data found:', error);
      }

      return {
        id: data.id,
        userId: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        barangay: data.barangay,
        barangayCode: data.barangay_code,
        address: additionalData?.address || '',
        addressData: additionalData
          ? {
              region: additionalData.region_code
                ? { region_code: additionalData.region_code, region_name: '' }
                : undefined,
              province: additionalData.province_code
                ? {
                    province_code: additionalData.province_code,
                    province_name: ''
                  }
                : undefined,
              city: additionalData.city_code
                ? { city_code: additionalData.city_code, city_name: '' }
                : undefined,
              barangay: additionalData.barangay_code
                ? {
                    brgy_code: additionalData.barangay_code,
                    brgy_name: additionalData.barangay || ''
                  }
                : undefined
            }
          : undefined,
        position: data.position,
        department: data.department,
        employeeId: data.employee_id,
        isActive: data.is_verified !== false,
        joinDate: additionalData?.join_date || data.created_at,
        profilePicture: data.avatar_url,
        idPhoto: additionalData?.id_photo || '',
        notes: additionalData?.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: data.created_by
      };
    } catch (error) {
      console.error('Error fetching basca member:', error);
      throw error;
    }
  }

  static async getAllBascaMembers(barangay?: string): Promise<BascaMember[]> {
    try {
      let query = supabase.from('users').select('*').eq('role', 'basca');

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false
      });

      if (error) {
        throw new Error(`Failed to fetch basca members: ${error.message}`);
      }

      // Get additional data from basca_members table
      const userIds = data.map(user => user.id);
      let additionalData: any[] = [];

      if (userIds.length > 0) {
        try {
          const { data: bascaData } = await supabase
            .from('basca_members')
            .select('*')
            .in('user_id', userIds);
          additionalData = bascaData || [];
        } catch (error) {
          console.warn('Failed to fetch additional basca member data:', error);
        }
      }

      return data.map(user => {
        const additional = additionalData.find(ad => ad.user_id === user.id);
        return {
          id: user.id,
          userId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
          barangay: user.barangay,
          barangayCode: user.barangay_code,
          address: additional?.address || '',
          addressData: additional
            ? {
                region: additional.region_code
                  ? { region_code: additional.region_code, region_name: '' }
                  : undefined,
                province: additional.province_code
                  ? {
                      province_code: additional.province_code,
                      province_name: ''
                    }
                  : undefined,
                city: additional.city_code
                  ? { city_code: additional.city_code, city_name: '' }
                  : undefined,
                barangay: additional.barangay_code
                  ? {
                      brgy_code: additional.barangay_code,
                      brgy_name: additional.barangay || ''
                    }
                  : undefined
              }
            : undefined,
          position: user.position,
          department: user.department,
          employeeId: user.employee_id,
          isActive: user.is_active,
          joinDate: additional?.join_date || user.created_at,
          profilePicture: user.avatar_url,
          idPhoto: additional?.id_photo || '',
          notes: additional?.notes,
          created_at: user.created_at,
          updated_at: user.updated_at,
          created_by: user.created_by
        };
      });
    } catch (error) {
      console.error('Error fetching basca members:', error);
      throw error;
    }
  }

  static async deactivateBascaMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to deactivate basca member: ${error.message}`);
      }

      // Also update basca_members table if it exists
      try {
        await supabase
          .from('basca_members')
          .update({ is_active: false })
          .eq('user_id', id);
      } catch (error) {
        console.warn('Failed to update basca_members table:', error);
      }
    } catch (error) {
      console.error('Error deactivating basca member:', error);
      throw error;
    }
  }

  static async activateBascaMember(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to activate basca member: ${error.message}`);
      }

      // Also update basca_members table if it exists
      try {
        await supabase
          .from('basca_members')
          .update({ is_active: true })
          .eq('user_id', id);
      } catch (error) {
        console.warn('Failed to update basca_members table:', error);
      }
    } catch (error) {
      console.error('Error activating basca member:', error);
      throw error;
    }
  }

  static async toggleBascaMemberStatus(id: string): Promise<BascaMember> {
    try {
      // Get current member status
      const member = await this.getBascaMember(id);
      if (!member) {
        throw new Error('Basca member not found');
      }

      const newStatus = !member.isActive;

      // Update user table
      const { error: userError } = await supabase
        .from('users')
        .update({ is_verified: newStatus })
        .eq('id', id);

      if (userError) {
        throw new Error(`Failed to update user status: ${userError.message}`);
      }

      // Update basca_members table if it exists
      try {
        await supabase
          .from('basca_members')
          .update({ is_active: newStatus })
          .eq('user_id', id);
      } catch (error) {
        console.warn('Failed to update basca_members table:', error);
      }

      // Return updated member
      return (await this.getBascaMember(id)) as BascaMember;
    } catch (error) {
      console.error('Error toggling basca member status:', error);
      throw error;
    }
  }

  static async getBascaMembersByPosition(
    position: string
  ): Promise<BascaMember[]> {
    try {
      // First get basca members by position
      const { data: bascaData, error: bascaError } = await supabase
        .from('basca_members')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (bascaError) {
        throw new Error(
          `Failed to fetch basca members by position: ${bascaError.message}`
        );
      }

      if (!bascaData || bascaData.length === 0) {
        return [];
      }

      // Get user data for all basca members
      const userIds = bascaData.map(item => item.user_id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

      if (userError) {
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      const members: BascaMember[] = bascaData.map(item => {
        const user = userData?.find(u => u.id === item.user_id);
        return {
          id: item.id,
          userId: item.user_id,
          firstName: user?.first_name || '',
          lastName: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          barangay: user?.barangay || '',
          barangayCode: user?.barangay_code || '',
          address: item.address,
          addressData: {
            region:
              item.region_code && item.region_name
                ? {
                    region_code: item.region_code,
                    region_name: item.region_name
                  }
                : undefined,
            province:
              item.province_code && item.province_name
                ? {
                    province_code: item.province_code,
                    province_name: item.province_name
                  }
                : undefined,
            city:
              item.city_code && item.city_name
                ? { city_code: item.city_code, city_name: item.city_name }
                : undefined,
            barangay:
              item.barangay_code && item.barangay
                ? { brgy_code: item.barangay_code, brgy_name: item.barangay }
                : undefined
          },
          position: item.position,
          department: item.department,
          employeeId: item.employee_id,
          isActive: item.is_active,
          joinDate: item.join_date,
          profilePicture: item.profile_picture,
          idPhoto: item.id_photo,
          notes: item.notes,
          emergencyContactName: item.emergency_contact_name,
          emergencyContactPhone: item.emergency_contact_phone,
          emergencyContactRelationship: item.emergency_contact_relationship,
          trainingCertifications: item.training_certifications || [],
          lastTrainingDate: item.last_training_date,
          nextTrainingDate: item.next_training_date,
          attendanceRate: item.attendance_rate,
          totalMeetingsAttended: item.total_meetings_attended,
          totalMeetingsConducted: item.total_meetings_conducted,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: item.created_by,
          updated_by: item.updated_by
        };
      });

      return members;
    } catch (error) {
      console.error('Error fetching basca members by position:', error);
      throw error;
    }
  }

  static async getCurrentUserBascaMember(
    userId: string
  ): Promise<BascaMember | null> {
    try {
      // First get the user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('role', 'basca')
        .single();

      if (userError) {
        if (userError.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw new Error(`Failed to fetch user data: ${userError.message}`);
      }

      if (!userData) {
        return null;
      }

      console.log('DExxxxdsdsdsds');
      // Then get the basca member data from basca_members table
      const { data: bascaData, error: bascaError } = await supabase
        .from('basca_members')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (bascaError) {
        if (bascaError.code === 'PGRST116') {
          // No basca member record found, but user exists
          return null;
        }
        throw new Error(
          `Failed to fetch basca member data: ${bascaError.message}`
        );
      }

      if (!bascaData) {
        return null;
      }

      const member: BascaMember = {
        id: bascaData.id,
        userId: bascaData.user_id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        barangay: userData.barangay,
        barangayCode: userData.barangay_code,
        address: bascaData.address,
        addressData: {
          region: bascaData.region_code
            ? {
                region_code: bascaData.region_code,
                region_name: bascaData.region_name
              }
            : undefined,
          province: bascaData.province_code
            ? {
                province_code: bascaData.province_code,
                province_name: bascaData.province_name
              }
            : undefined,
          city: bascaData.city_code
            ? {
                city_code: bascaData.city_code,
                city_name: bascaData.city_name
              }
            : undefined,
          barangay: bascaData.barangay_code
            ? {
                brgy_code: bascaData.barangay_code,
                brgy_name: bascaData.barangay
              }
            : undefined
        },
        position: bascaData.position,
        department: bascaData.department,
        employeeId: bascaData.employee_id,
        isActive: bascaData.is_active,
        joinDate: bascaData.join_date,
        profilePicture: bascaData.profile_picture,
        idPhoto: bascaData.id_photo,
        notes: bascaData.notes,
        emergencyContactName: bascaData.emergency_contact_name,
        emergencyContactPhone: bascaData.emergency_contact_phone,
        emergencyContactRelationship: bascaData.emergency_contact_relationship,
        trainingCertifications: bascaData.training_certifications || [],
        lastTrainingDate: bascaData.last_training_date,
        nextTrainingDate: bascaData.next_training_date,
        attendanceRate: bascaData.attendance_rate,
        totalMeetingsAttended: bascaData.total_meetings_attended,
        totalMeetingsConducted: bascaData.total_meetings_conducted,
        created_at: bascaData.created_at,
        updated_at: bascaData.updated_at,
        created_by: bascaData.created_by,
        updated_by: bascaData.updated_by
      };
      console.log({ member });
      return member;
    } catch (error) {
      console.error('Error fetching current user basca member:', error);
      throw error;
    }
  }
}
