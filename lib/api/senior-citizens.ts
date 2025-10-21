import { supabase, supabaseAdmin } from '@/lib/supabase';
import { validateEnvironment } from '@/lib/config';
import type { SeniorCitizen, Beneficiary } from '@/types/property';
import type { Database } from '@/types/database';

// Validate environment on module load
validateEnvironment();

export interface CreateSeniorCitizenData {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';

  // Address Information
  barangay: string;
  barangayCode: string;
  address: string;
  addressData?: {
    region?: { region_code: string; region_name: string };
    province?: { province_code: string; province_name: string };
    city?: { city_code: string; city_name: string };
    barangay?: { brgy_code: string; brgy_name: string };
  };

  // Contact Information
  contactPerson?: string;
  contactPhone?: string;
  contactRelationship?: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;

  // Medical Information
  medicalConditions: string[];
  medications: string[];
  notes?: string;

  // Living Conditions
  housingCondition:
    | 'owned'
    | 'rented'
    | 'with_family'
    | 'institution'
    | 'other';
  physicalHealthCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  monthlyIncome: number;
  monthlyPension: number;
  livingCondition:
    | 'independent'
    | 'with_family'
    | 'with_caregiver'
    | 'institution'
    | 'other';

  // Photos
  profilePicture?: string;
  seniorIdPhoto?: string;

  // Beneficiaries
  beneficiaries: Array<{
    name: string;
    relationship: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    address?: string;
    contactPhone?: string;
    occupation?: string;
    monthlyIncome?: number;
    isDependent: boolean;
  }>;

  // Login credentials (generated automatically)
  email?: string;
  password?: string;
}

export interface UpdateSeniorCitizenData
  extends Partial<CreateSeniorCitizenData> {
  id: string;
}

export class SeniorCitizensAPI {
  static async createSeniorCitizen(
    data: CreateSeniorCitizenData,
    createdByUserId?: string
  ) {
    console.log({ data });
    try {
      console.log('Creating senior citizen:', data);

      // Get current user if no createdByUserId provided
      if (!createdByUserId) {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }
        createdByUserId = user.id;
      }

      // Use email and password from the data
      const email = data.email;
      const password = data.password;

      // Step 1: Create user account in Supabase Auth
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'senior'
          }
        });

      if (authError || !authData.user) {
        console.error('Error creating user account:', authError);
        throw new Error(`Failed to create user account: ${authError?.message}`);
      }

      const newUserId = authData.user.id;
      console.log('User account created successfully:', newUserId);

      // Step 2: Create user record in users table
      const userData = {
        id: newUserId,
        email: email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'senior',
        barangay: data.barangay,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert(userData);

      if (userError) {
        console.error('Error creating user record:', userError);
        // Clean up: delete the auth user if user record creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        throw new Error(`Failed to create user record: ${userError.message}`);
      }

      console.log('User record created successfully');

      // Step 3: Create senior citizen record
      const seniorCitizenData = {
        user_id: newUserId,
        first_name: data.firstName,
        last_name: data.lastName,
        barangay: data.barangay,
        barangay_code: data.barangayCode,
        region_code: data.addressData?.region?.region_code,
        province_code: data.addressData?.province?.province_code,
        city_code: data.addressData?.city?.city_code,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        contact_person: data.contactPerson,
        contact_phone: data.contactPhone,
        contact_relationship: data.contactRelationship,
        emergency_contact_name: data.emergencyContactName,
        emergency_contact_phone: data.emergencyContactPhone,
        emergency_contact_relationship: data.emergencyContactRelationship,
        medical_conditions: data.medicalConditions,
        medications: data.medications,
        notes: data.notes,
        senior_id_photo: data.seniorIdPhoto,
        profile_picture: data.profilePicture,
        status: 'active',
        registration_date: new Date().toISOString(),
        documents: [],
        created_by: createdByUserId
      };

      const { data: seniorCitizen, error: seniorError } = await supabaseAdmin
        .from('senior_citizens')
        .insert(seniorCitizenData)
        .select()
        .single();

      if (seniorError) {
        console.error('Error creating senior citizen:', seniorError);
        // Clean up: delete both user record and auth user
        await supabaseAdmin.from('users').delete().eq('id', newUserId);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        throw new Error(
          `Failed to create senior citizen: ${seniorError.message}`
        );
      }

      console.log('Senior citizen created successfully:', seniorCitizen.id);

      // Step 4: Create beneficiaries if any
      if (data.beneficiaries && data.beneficiaries.length > 0) {
        const beneficiariesData = data.beneficiaries.map(beneficiary => ({
          senior_citizen_id: seniorCitizen.id,
          name: beneficiary.name,
          relationship: beneficiary.relationship,
          date_of_birth: beneficiary.dateOfBirth,
          gender: beneficiary.gender,
          address: beneficiary.address,
          contact_phone: beneficiary.contactPhone,
          occupation: beneficiary.occupation,
          monthly_income: beneficiary.monthlyIncome || 0,
          is_dependent: beneficiary.isDependent
        }));

        const { error: beneficiariesError } = await supabaseAdmin
          .from('beneficiaries')
          .insert(beneficiariesData);

        if (beneficiariesError) {
          console.error('Error creating beneficiaries:', beneficiariesError);
          // Don't throw error here, senior citizen was created successfully
          console.warn(
            'Senior citizen created but beneficiaries failed to save'
          );
        } else {
          console.log('Beneficiaries created successfully');
        }
      }

      return {
        success: true,
        message: 'Senior citizen created successfully',
        data: {
          ...seniorCitizen,
          loginCredentials: {
            email: email,
            password: password
          }
        }
      };
    } catch (error) {
      console.error('Error in createSeniorCitizen:', error);
      throw error;
    }
  }

  static async updateSeniorCitizen(
    data: UpdateSeniorCitizenData,
    userId?: string
  ) {
    try {
      console.log('Updating senior citizen:', data.id);

      // Get current user if no userId provided
      if (!userId) {
        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }
        userId = user.id;
      }

      const updateData: Database['public']['Tables']['senior_citizens']['Update'] =
        {
          updated_at: new Date().toISOString(),
          updated_by: userId
        };

      // Add fields that are provided
      if (data.firstName) updateData.first_name = data.firstName;
      if (data.lastName) updateData.last_name = data.lastName;
      if (data.barangay) updateData.barangay = data.barangay;
      if (data.barangayCode) updateData.barangay_code = data.barangayCode;
      if (data.addressData?.region?.region_code)
        updateData.region_code = data.addressData.region.region_code;
      if (data.addressData?.province?.province_code)
        updateData.province_code = data.addressData.province.province_code;
      if (data.addressData?.city?.city_code)
        updateData.city_code = data.addressData.city.city_code;
      if (data.dateOfBirth) updateData.date_of_birth = data.dateOfBirth;
      if (data.gender) updateData.gender = data.gender;
      if (data.address) updateData.address = data.address;
      if (data.contactPerson !== undefined)
        updateData.contact_person = data.contactPerson;
      if (data.contactPhone !== undefined)
        updateData.contact_phone = data.contactPhone;
      if (data.contactRelationship !== undefined)
        updateData.contact_relationship = data.contactRelationship;
      if (data.emergencyContactName)
        updateData.emergency_contact_name = data.emergencyContactName;
      if (data.emergencyContactPhone)
        updateData.emergency_contact_phone = data.emergencyContactPhone;
      if (data.emergencyContactRelationship)
        updateData.emergency_contact_relationship =
          data.emergencyContactRelationship;
      if (data.medicalConditions)
        updateData.medical_conditions = data.medicalConditions;
      if (data.medications) updateData.medications = data.medications;
      if (data.housingCondition)
        updateData.housing_condition = data.housingCondition;
      if (data.physicalHealthCondition)
        updateData.physical_health_condition = data.physicalHealthCondition;
      if (data.monthlyIncome !== undefined)
        updateData.monthly_income = data.monthlyIncome;
      if (data.monthlyPension !== undefined)
        updateData.monthly_pension = data.monthlyPension;
      if (data.livingCondition)
        updateData.living_condition = data.livingCondition;
      if (data.seniorIdPhoto !== undefined)
        updateData.senior_id_photo = data.seniorIdPhoto;
      if (data.profilePicture !== undefined)
        updateData.profile_picture = data.profilePicture;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: seniorCitizen, error: seniorError } = await supabaseAdmin
        .from('senior_citizens')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (seniorError) {
        console.error('Error updating senior citizen:', seniorError);
        throw new Error(
          `Failed to update senior citizen: ${seniorError.message}`
        );
      }

      // Update beneficiaries if provided
      if (data.beneficiaries) {
        // Delete existing beneficiaries
        await supabaseAdmin
          .from('beneficiaries')
          .delete()
          .eq('senior_citizen_id', data.id);

        // Create new beneficiaries
        if (data.beneficiaries.length > 0) {
          const beneficiariesData: Database['public']['Tables']['beneficiaries']['Insert'][] =
            data.beneficiaries.map(beneficiary => ({
              senior_citizen_id: data.id,
              name: beneficiary.name,
              relationship: beneficiary.relationship,
              date_of_birth: beneficiary.dateOfBirth,
              gender: beneficiary.gender,
              address: beneficiary.address,
              contact_phone: beneficiary.contactPhone,
              occupation: beneficiary.occupation,
              monthly_income: beneficiary.monthlyIncome || 0,
              is_dependent: beneficiary.isDependent
            }));

          const { error: beneficiariesError } = await supabaseAdmin
            .from('beneficiaries')
            .insert(beneficiariesData);

          if (beneficiariesError) {
            console.error('Error updating beneficiaries:', beneficiariesError);
            // Don't throw error here, senior citizen was updated successfully
          }
        }
      }

      // Update user profile if name fields are provided
      if (data.firstName || data.lastName) {
        const userUpdateData: any = {
          updated_at: new Date().toISOString()
        };

        if (data.firstName) userUpdateData.first_name = data.firstName;
        if (data.lastName) userUpdateData.last_name = data.lastName;

        await supabaseAdmin
          .from('users')
          .update(userUpdateData)
          .eq('id', seniorCitizen.user_id);
      }

      return {
        success: true,
        message: 'Senior citizen updated successfully',
        data: seniorCitizen
      };
    } catch (error) {
      console.error('Error in updateSeniorCitizen:', error);
      throw error;
    }
  }

  static async getSeniorCitizen(id: string) {
    try {
      const { data: seniorCitizen, error: seniorError } = await supabase
        .from('senior_citizens')
        .select(
          `
          *,
          beneficiaries (*)
        `
        )
        .eq('id', id)
        .single();

      if (seniorError) {
        throw new Error(`Failed to get senior citizen: ${seniorError.message}`);
      }

      return {
        success: true,
        data: seniorCitizen
      };
    } catch (error) {
      console.error('Error in getSeniorCitizen:', error);
      throw error;
    }
  }

  static async getAllSeniorCitizens(barangay?: string) {
    try {
      let query = supabase
        .from('senior_citizens')
        .select(
          `
          *,
          beneficiaries (*),
          users!senior_citizens_user_id_fkey (
            first_name,
            last_name,
            email,
            phone
          )
        `
        )
        .order('created_at', { ascending: false });

      if (barangay) {
        query = query.eq('barangay', barangay);
      }

      const { data: seniorCitizens, error: seniorError } = await query;

      if (seniorError) {
        throw new Error(
          `Failed to get senior citizens: ${seniorError.message}`
        );
      }

      return {
        success: true,
        data: seniorCitizens
      };
    } catch (error) {
      console.error('Error in getAllSeniorCitizens:', error);
      throw error;
    }
  }

  static async deleteSeniorCitizen(id: string) {
    try {
      // Delete beneficiaries first (cascade should handle this, but let's be explicit)
      await supabaseAdmin
        .from('beneficiaries')
        .delete()
        .eq('senior_citizen_id', id);

      // Delete senior citizen
      const { error: seniorError } = await supabaseAdmin
        .from('senior_citizens')
        .delete()
        .eq('id', id);

      if (seniorError) {
        throw new Error(
          `Failed to delete senior citizen: ${seniorError.message}`
        );
      }

      return {
        success: true,
        message: 'Senior citizen deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteSeniorCitizen:', error);
      throw error;
    }
  }
}
