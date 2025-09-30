# OSCA Announcements System Setup Guide

## Overview

The OSCA Announcements System provides comprehensive announcement management with real-time SMS notifications for senior citizens in Pili, Camarines Sur. This system includes CRUD operations, form validation, SMS integration, and database enhancements.

## Features Implemented

### ✅ Complete CRUD Operations

- **Create**: Add new announcements with validation
- **Read**: List and filter announcements with pagination
- **Update**: Edit existing announcements (API ready)
- **Delete**: Remove announcements with confirmation

### ✅ Real Pili, Camarines Sur Barangays

- 22 official barangays integrated
- Validation ensures seniors exist in selected barangay
- System-wide or barangay-specific targeting

### ✅ Comprehensive Form Validation

- Title: 3-100 characters, no special characters
- Content: 10-500 characters
- Type: general, emergency, benefit, birthday
- Barangay: Must be valid Pili barangay
- Expiry: Must be future date
- Real-time validation feedback

### ✅ SMS Integration System

- Automatic SMS notifications to senior citizens
- Emergency contact notifications
- SMS preview with character count
- Delivery tracking and status
- Cost tracking per message

### ✅ Database Enhancements

- Enhanced announcements table with SMS fields
- SMS notifications tracking table
- Announcement reads tracking
- RLS (Row Level Security) policies
- Performance indexes

## Installation Steps

### 1. Run Database Migration

```sql
-- Execute the migration script
\i scripts/announcements-migration.sql
```

### 2. Install Dependencies (Already Available)

```bash
# Zod validation library is already installed
npm list zod
```

### 3. Configure Environment

Add to your `.env.local`:

```bash
# SMS Provider Configuration (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Or AWS SNS Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
```

## File Structure

```
client/
├── app/dashboard/osca/announcements/
│   └── page.tsx                     # Main announcements page
├── lib/
│   ├── api/announcements.ts         # API functions for CRUD operations
│   └── validations/announcements.ts # Form validation schemas
├── scripts/
│   └── announcements-migration.sql  # Database migration
└── docs/
    └── announcements-setup.md       # This guide
```

## Usage Guide

### Creating Announcements

1. **Navigate to Announcements**

   - Go to `/dashboard/osca/announcements`
   - Click "New Announcement"

2. **Fill Required Fields**

   - Title (3-100 characters)
   - Content (10-500 characters)
   - Type (general/emergency/benefit/birthday)

3. **Optional Settings**

   - Target Barangay (system-wide if empty)
   - Mark as urgent
   - Set expiry date
   - Enable SMS notifications

4. **SMS Preview**
   - Real-time preview of SMS message
   - Character count estimation
   - Automatic formatting with prefixes

### Managing Announcements

1. **View All Announcements**

   - Stats dashboard with key metrics
   - Filter by type, priority, barangay
   - Search functionality

2. **Edit/Delete**
   - Click edit icon to modify
   - Click delete icon with confirmation
   - Track SMS delivery status

### SMS Features

1. **Automatic Recipients**

   - Senior citizens in target barangay
   - Emergency contacts (family members)
   - Real-time recipient count

2. **Message Format**

   ```
   [URGENT] [EMERGENCY] [Barangay] Title

   Content (truncated if needed)

   - OSCA Pili
   ```

3. **Delivery Tracking**
   - Pending, sent, delivered, failed status
   - Cost tracking per message
   - Delivery timestamps

## API Reference

### AnnouncementsAPI

```typescript
// Get announcements with filters
getAnnouncements(page, limit, filters);

// Create new announcement
createAnnouncement(data);

// Update announcement
updateAnnouncement(data);

// Delete announcement
deleteAnnouncement(id);

// Get barangays
getBarangays();

// Send SMS notifications
sendSMSNotifications(announcement);
```

### Validation

```typescript
// Validate form data
validateAnnouncementForm(data);

// Validate SMS content
validateSMSContent(title, content, isUrgent, type, barangay);

// Validate barangay has seniors
validateBarangayRequirements(barangay);
```

## Database Schema

### announcements table (enhanced)

- `sms_count`: Number of SMS sent
- `sms_delivery_status`: pending/sent/delivered/failed
- `sms_sent_at`: Timestamp of SMS sending
- `priority_level`: 1-5 priority scale
- `recipient_count`: Number of recipients
- `status`: draft/published/archived/scheduled

### sms_notifications table (new)

- `announcement_id`: Reference to announcement
- `recipient_phone`: SMS recipient number
- `recipient_type`: senior/family/emergency_contact
- `delivery_status`: Tracking delivery
- `cost`: SMS cost tracking

### barangays table (new)

- Official Pili, Camarines Sur barangays
- Municipality and province data
- Barangay codes (PSA format)

## Security Features

1. **Row Level Security (RLS)**

   - OSCA can manage all announcements
   - BASCA can only manage their barangay
   - Users can only view relevant announcements

2. **Form Validation**

   - Client-side and server-side validation
   - XSS protection through content sanitization
   - SQL injection prevention

3. **SMS Security**
   - Phone number validation
   - Rate limiting for SMS sending
   - Audit trail for all messages

## Performance Optimizations

1. **Database**

   - Indexes on frequently queried fields
   - Count queries for pagination
   - Parallel query execution

2. **Frontend**

   - Debounced search input
   - Lazy loading for large lists
   - Optimized re-renders

3. **SMS**
   - Batch processing for multiple recipients
   - Asynchronous delivery
   - Error handling and retries

## Troubleshooting

### Common Issues

1. **SMS Not Sending**

   - Check SMS provider configuration
   - Verify phone number format
   - Check rate limits

2. **Validation Errors**

   - Ensure all required fields filled
   - Check character limits
   - Verify barangay has seniors

3. **Database Errors**
   - Run migration script
   - Check RLS policies
   - Verify user permissions

### Error Messages

- "No active senior citizens found in [barangay]"
- "Content will be truncated in SMS"
- "Failed to create announcement"
- "SMS delivery failed"

## Future Enhancements

1. **Advanced SMS Features**

   - Scheduled announcements
   - Delivery confirmation receipts
   - SMS templates

2. **Analytics Dashboard**

   - SMS delivery rates
   - Engagement metrics
   - Cost analysis

3. **Integration Options**
   - Push notifications
   - Email notifications
   - Social media posting

## Support

For technical support or questions:

1. Check error logs in browser console
2. Verify database connection
3. Test SMS provider configuration
4. Review validation requirements

## Testing

### Manual Testing

1. Create announcement with all field types
2. Test SMS preview functionality
3. Verify barangay validation
4. Test filter and search features
5. Confirm delete confirmation dialog

### Database Testing

```sql
-- Test barangays data
SELECT * FROM barangays WHERE municipality = 'Pili';

-- Test senior citizens per barangay
SELECT barangay, COUNT(*) FROM senior_citizens
WHERE status = 'active' GROUP BY barangay;

-- Test SMS notifications
SELECT * FROM sms_notifications
WHERE announcement_id = 'test-id';
```

This comprehensive announcement system provides a solid foundation for senior citizen communication in Pili, Camarines Sur, with room for future enhancements and integrations.
