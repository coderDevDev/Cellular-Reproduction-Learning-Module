import { supabase } from '@/lib/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'benefit' | 'birthday';
  targetBarangay: string | null;
  isUrgent: boolean;
  expiresAt: string | null;
  smsSent: boolean;
  smsCount: number;
  smsDeliveryStatus: string;
  smsSentAt: string | null;
  priorityLevel: number;
  recipientCount: number;
  scheduledAt: string | null;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  attachmentUrls: string[];
  readCount: number;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'benefit' | 'birthday';
  targetBarangay?: string | null;
  isUrgent?: boolean;
  expiresAt?: string | null;
  priorityLevel?: number;
  scheduledAt?: string | null;
  status?: 'draft' | 'published' | 'scheduled';
  tags?: string[];
  sendSMS?: boolean;
}

export interface UpdateAnnouncementData
  extends Partial<CreateAnnouncementData> {
  id: string;
}

export interface SMSNotification {
  id: string;
  announcementId: string;
  recipientPhone: string;
  recipientName: string | null;
  recipientType: 'senior' | 'family' | 'emergency_contact';
  messageContent: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  providerResponse: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface Barangay {
  id: string;
  name: string;
  code: string;
  municipality: string;
  province: string;
  createdAt: string;
  updatedAt: string;
}

export class AnnouncementsAPI {
  // Get all announcements with filtering
  static async getAnnouncements(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      type?: string;
      status?: string;
      isUrgent?: boolean;
      targetBarangay?: string;
    }
  ): Promise<{
    announcements: Announcement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      let query = supabase
        .from('announcements')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.isUrgent !== undefined) {
        query = query.eq('is_urgent', filters.isUrgent);
      }

      if (filters?.targetBarangay && filters.targetBarangay !== 'all') {
        query = query.eq('target_barangay', filters.targetBarangay);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch announcements: ${error.message}`);
      }

      const transformedAnnouncements: Announcement[] = (data || []).map(
        item => ({
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type,
          targetBarangay: item.target_barangay,
          isUrgent: item.is_urgent || false,
          expiresAt: item.expires_at,
          smsSent: item.sms_sent || false,
          smsCount: item.sms_count || 0,
          smsDeliveryStatus: item.sms_delivery_status || 'pending',
          smsSentAt: item.sms_sent_at,
          priorityLevel: item.priority_level || 1,
          recipientCount: item.recipient_count || 0,
          scheduledAt: item.scheduled_at,
          status: item.status || 'draft',
          attachmentUrls: item.attachment_urls || [],
          readCount: item.read_count || 0,
          tags: item.tags || [],
          createdBy: item.created_by,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        })
      );

      return {
        announcements: transformedAnnouncements,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  // Get single announcement by ID
  static async getAnnouncementById(id: string): Promise<Announcement> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch announcement: ${error.message}`);
      }

      if (!data) {
        throw new Error('Announcement not found');
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        type: data.type,
        targetBarangay: data.target_barangay,
        isUrgent: data.is_urgent || false,
        expiresAt: data.expires_at,
        smsSent: data.sms_sent || false,
        smsCount: data.sms_count || 0,
        smsDeliveryStatus: data.sms_delivery_status || 'pending',
        smsSentAt: data.sms_sent_at,
        priorityLevel: data.priority_level || 1,
        recipientCount: data.recipient_count || 0,
        scheduledAt: data.scheduled_at,
        status: data.status || 'draft',
        attachmentUrls: data.attachment_urls || [],
        readCount: data.read_count || 0,
        tags: data.tags || [],
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw error;
    }
  }

  // Create new announcement
  static async createAnnouncement(
    announcementData: CreateAnnouncementData
  ): Promise<Announcement> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate target barangay has seniors if specified
      if (announcementData.targetBarangay) {
        await this.validateBarangayHasSeniors(announcementData.targetBarangay);
      }

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: announcementData.title,
          content: announcementData.content,
          type: announcementData.type,
          target_barangay: announcementData.targetBarangay,
          is_urgent: announcementData.isUrgent || false,
          expires_at: announcementData.expiresAt,
          priority_level: announcementData.priorityLevel || 1,
          scheduled_at: announcementData.scheduledAt,
          status: announcementData.status || 'published',
          tags: announcementData.tags || [],
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create announcement: ${error.message}`);
      }

      const newAnnouncement = await this.getAnnouncementById(data.id);

      // Send SMS if requested
      if (announcementData.sendSMS) {
        await this.sendSMSNotifications(newAnnouncement);
      }

      return newAnnouncement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  // Update announcement
  static async updateAnnouncement(
    updateData: UpdateAnnouncementData
  ): Promise<Announcement> {
    try {
      const { id, sendSMS, ...updateFields } = updateData;

      // Validate target barangay has seniors if specified
      if (updateFields.targetBarangay) {
        await this.validateBarangayHasSeniors(updateFields.targetBarangay);
      }

      const { error } = await supabase
        .from('announcements')
        .update({
          title: updateFields.title,
          content: updateFields.content,
          type: updateFields.type,
          target_barangay: updateFields.targetBarangay,
          is_urgent: updateFields.isUrgent,
          expires_at: updateFields.expiresAt,
          priority_level: updateFields.priorityLevel,
          scheduled_at: updateFields.scheduledAt,
          status: updateFields.status,
          tags: updateFields.tags
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update announcement: ${error.message}`);
      }

      const updatedAnnouncement = await this.getAnnouncementById(id);

      // Send SMS if requested
      if (sendSMS) {
        await this.sendSMSNotifications(updatedAnnouncement);
      }

      return updatedAnnouncement;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  // Delete announcement
  static async deleteAnnouncement(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete announcement: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Get all barangays
  static async getBarangays(): Promise<Barangay[]> {
    try {
      const { data, error } = await supabase
        .from('barangays')
        .select('*')
        .eq('municipality', 'Pili')
        .eq('province', 'Camarines Sur')
        .order('name');

      if (error) {
        throw new Error(`Failed to fetch barangays: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        municipality: item.municipality,
        province: item.province,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      // Return fallback data if database query fails
      return [
        {
          id: '1',
          name: 'Anayan',
          code: '051702001',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '2',
          name: 'Awod',
          code: '051702002',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '3',
          name: 'Bagong Sirang',
          code: '051702003',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '4',
          name: 'Binagasbasan',
          code: '051702004',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '5',
          name: 'Curry',
          code: '051702005',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '6',
          name: 'Del Rosario',
          code: '051702006',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '7',
          name: 'Himaao',
          code: '051702007',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '8',
          name: 'Kadlan',
          code: '051702008',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '9',
          name: 'Pawili',
          code: '051702009',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '10',
          name: 'Pinit',
          code: '051702010',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '11',
          name: 'Poblacion East',
          code: '051702011',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '12',
          name: 'Poblacion West',
          code: '051702012',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '13',
          name: 'Sagrada',
          code: '051702013',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '14',
          name: 'San Agustin',
          code: '051702014',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '15',
          name: 'San Isidro',
          code: '051702015',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '16',
          name: 'San Jose',
          code: '051702016',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '17',
          name: 'San Juan',
          code: '051702017',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '18',
          name: 'San Vicente',
          code: '051702018',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '19',
          name: 'Santa Cruz Norte',
          code: '051702019',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '20',
          name: 'Santa Cruz Sur',
          code: '051702020',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '21',
          name: 'Santo Domingo',
          code: '051702021',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: '22',
          name: 'Tagbong',
          code: '051702022',
          municipality: 'Pili',
          province: 'Camarines Sur',
          createdAt: '',
          updatedAt: ''
        }
      ];
    }
  }

  // Validate that a barangay has senior citizens
  static async validateBarangayHasSeniors(barangayName: string): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('senior_citizens')
        .select('*', { count: 'exact', head: true })
        .eq('barangay', barangayName)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to validate barangay: ${error.message}`);
      }

      if ((count || 0) === 0) {
        throw new Error(
          `No active senior citizens found in ${barangayName}. Please choose a different barangay or add senior citizens first.`
        );
      }
    } catch (error) {
      console.error('Error validating barangay:', error);
      throw error;
    }
  }

  // Send SMS notifications
  static async sendSMSNotifications(announcement: Announcement): Promise<void> {
    try {
      // Get recipients based on target barangay
      let recipientsQuery = supabase
        .from('senior_citizens')
        .select(
          `
          id,
          first_name,
          last_name,
          contact_phone,
          emergency_contact_phone,
          emergency_contact_name,
          barangay
        `
        )
        .eq('status', 'active');

      if (announcement.targetBarangay) {
        recipientsQuery = recipientsQuery.eq(
          'barangay',
          announcement.targetBarangay
        );
      }

      const { data: recipients, error: recipientsError } =
        await recipientsQuery;

      if (recipientsError) {
        throw new Error(
          `Failed to fetch recipients: ${recipientsError.message}`
        );
      }

      if (!recipients || recipients.length === 0) {
        throw new Error('No recipients found for SMS notifications');
      }

      // Create SMS message
      const messageContent = this.createSMSMessage(announcement);

      // Prepare SMS notifications data
      const smsNotifications = [];

      for (const recipient of recipients) {
        // Add SMS for senior citizen
        if (recipient.contact_phone) {
          smsNotifications.push({
            announcement_id: announcement.id,
            recipient_phone: recipient.contact_phone,
            recipient_name: `${recipient.first_name} ${recipient.last_name}`,
            recipient_type: 'senior',
            message_content: messageContent
          });
        }

        // Add SMS for emergency contact
        if (
          recipient.emergency_contact_phone &&
          recipient.emergency_contact_name
        ) {
          smsNotifications.push({
            announcement_id: announcement.id,
            recipient_phone: recipient.emergency_contact_phone,
            recipient_name: recipient.emergency_contact_name,
            recipient_type: 'emergency_contact',
            message_content: `[FAMILY ALERT] ${messageContent}`
          });
        }
      }

      // Insert SMS notifications
      const { error: insertError } = await supabase
        .from('sms_notifications')
        .insert(smsNotifications);

      if (insertError) {
        throw new Error(
          `Failed to create SMS notifications: ${insertError.message}`
        );
      }

      // Update announcement with SMS info
      await supabase
        .from('announcements')
        .update({
          sms_sent: true,
          sms_count: smsNotifications.length,
          sms_sent_at: new Date().toISOString(),
          recipient_count: recipients.length,
          sms_delivery_status: 'sent'
        })
        .eq('id', announcement.id);

      // Here you would integrate with actual SMS provider (Twilio, AWS SNS, etc.)
      console.log(
        `SMS notifications created for announcement: ${announcement.id}`
      );
      console.log(`Total SMS messages: ${smsNotifications.length}`);
    } catch (error) {
      console.error('Error sending SMS notifications:', error);

      // Update announcement with error status
      await supabase
        .from('announcements')
        .update({
          sms_delivery_status: 'failed'
        })
        .eq('id', announcement.id);

      throw error;
    }
  }

  // Create SMS message content
  private static createSMSMessage(announcement: Announcement): string {
    const urgentPrefix = announcement.isUrgent ? '[URGENT] ' : '';
    const typePrefix = announcement.type === 'emergency' ? '[EMERGENCY] ' : '';
    const barangayPrefix = announcement.targetBarangay
      ? `[${announcement.targetBarangay}] `
      : '[OSCA] ';

    let message = `${urgentPrefix}${typePrefix}${barangayPrefix}${announcement.title}`;

    // Add content if message is not too long
    if (message.length + announcement.content.length + 10 <= 160) {
      message += `\n\n${announcement.content}`;
    } else {
      // Truncate content to fit SMS limit
      const availableLength = 160 - message.length - 10;
      if (availableLength > 20) {
        message += `\n\n${announcement.content.substring(
          0,
          availableLength - 3
        )}...`;
      }
    }

    message += `\n\n- OSCA Pili`;

    return message;
  }

  // Get SMS notifications for an announcement
  static async getSMSNotifications(
    announcementId: string
  ): Promise<SMSNotification[]> {
    try {
      const { data, error } = await supabase
        .from('sms_notifications')
        .select('*')
        .eq('announcement_id', announcementId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch SMS notifications: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        announcementId: item.announcement_id,
        recipientPhone: item.recipient_phone,
        recipientName: item.recipient_name,
        recipientType: item.recipient_type,
        messageContent: item.message_content,
        deliveryStatus: item.delivery_status,
        providerResponse: item.provider_response,
        sentAt: item.sent_at,
        deliveredAt: item.delivered_at,
        cost: item.cost,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching SMS notifications:', error);
      throw error;
    }
  }

  // Get announcement statistics
  static async getAnnouncementStats(): Promise<{
    total: number;
    published: number;
    urgent: number;
    smsSent: number;
    thisMonth: number;
  }> {
    try {
      const [
        totalResult,
        publishedResult,
        urgentResult,
        smsSentResult,
        thisMonthResult
      ] = await Promise.all([
        supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published'),
        supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('is_urgent', true),
        supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .eq('sms_sent', true),
        supabase
          .from('announcements')
          .select('*', { count: 'exact', head: true })
          .gte(
            'created_at',
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          )
      ]);

      return {
        total: totalResult.count || 0,
        published: publishedResult.count || 0,
        urgent: urgentResult.count || 0,
        smsSent: smsSentResult.count || 0,
        thisMonth: thisMonthResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      return {
        total: 0,
        published: 0,
        urgent: 0,
        smsSent: 0,
        thisMonth: 0
      };
    }
  }
}
