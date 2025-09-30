# Class Management Features

## Overview

The class management system provides comprehensive CRUD operations for teachers to manage their classes, including student enrollment, class information updates, and detailed analytics.

## Features

### 🏫 Class Management

- **Create Classes**: Teachers can create new classes with name, description, subject, and grade level
- **Edit Classes**: Update class information including name, description, subject, and grade level
- **Delete Classes**: Remove classes with confirmation dialog and cascade deletion of related data
- **View Classes**: Display all classes with search, filtering, and sorting capabilities

### 👥 Student Management

- **Add Students**: Enroll students in classes with bulk selection
- **Remove Students**: Remove students from classes with confirmation
- **Student Search**: Search through available students for enrollment
- **Enrollment Tracking**: Monitor student enrollment status and join dates

### 📊 Analytics & Statistics

- **Class Statistics**: Total classes, students, active classes, and average students per class
- **Student Distribution**: View learning styles and grade levels of enrolled students
- **Performance Metrics**: Track class engagement and student progress

## API Endpoints

### ClassesAPI Class

#### Core Operations

```typescript
// Get all classes for a teacher
static async getTeacherClasses(teacherId: string): Promise<Class[]>

// Get a single class by ID with full details
static async getClassById(classId: string): Promise<Class | null>

// Create a new class
static async createClass(classData: CreateClassData): Promise<Class>

// Update an existing class
static async updateClass(classId: string, updates: UpdateClassData): Promise<Class>

// Delete a class
static async deleteClass(classId: string): Promise<void>
```

#### Student Management

```typescript
// Add students to a class
static async addStudentsToClass(classId: string, studentIds: string[]): Promise<void>

// Remove students from a class
static async removeStudentsFromClass(classId: string, studentIds: string[]): Promise<void>

// Get available students (not enrolled in the class)
// Note: Currently returns all students. In a production system, consider adding teacher-student relationships
static async getAvailableStudents(classId: string, teacherId: string): Promise<any[]>
```

#### Analytics & Search

```typescript
// Get class statistics
static async getClassStats(classId: string): Promise<any>

// Search classes with filters
static async searchClasses(teacherId: string, searchTerm: string, filters: any = {}): Promise<Class[]>
```

## Database Schema

### Tables

- **`classes`**: Main class information
- **`class_students`**: Student enrollment relationships
- **`profiles`**: User profiles (teachers and students)

### Key Fields

```sql
-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE public.class_students (
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);
```

## Components

### ClassFormModal

- **Purpose**: Create and edit class information
- **Features**: Form validation, subject/grade selection, responsive design
- **Validation**: Required fields, length limits, proper data types

### DeleteClassDialog

- **Purpose**: Confirm class deletion with warnings
- **Features**: Cascade deletion warnings, loading states, confirmation flow

### StudentManagementModal

- **Purpose**: Manage student enrollments
- **Features**: Bulk student selection, search functionality, enrollment status

## Usage Examples

### Creating a New Class

```typescript
const newClass = await ClassesAPI.createClass({
  name: 'Advanced Mathematics',
  description: 'Advanced level mathematics focusing on calculus and algebra',
  subject: 'Mathematics',
  grade_level: 'Grade 12',
  created_by: teacherId
});
```

### Adding Students to a Class

```typescript
await ClassesAPI.addStudentsToClass(classId, [
  'student1',
  'student2',
  'student3'
]);
```

### Searching Classes

```typescript
const results = await ClassesAPI.searchClasses(teacherId, 'math', {
  subject: 'Mathematics',
  grade_level: 'Grade 12'
});
```

## State Management

### Local State

- `classes`: Array of all classes
- `selectedClass`: Currently selected class for operations
- `availableStudents`: Students available for enrollment
- `isLoading`: Loading states for various operations

### Modal States

- `isCreateModalOpen`: Create class modal visibility
- `isEditModalOpen`: Edit class modal visibility
- `isDeleteDialogOpen`: Delete confirmation dialog visibility
- `isStudentModalOpen`: Student management modal visibility

## Error Handling

### API Errors

- Network failures
- Database constraint violations
- Authentication errors
- Permission denied errors

### User Feedback

- Toast notifications for success/error states
- Loading indicators during operations
- Form validation errors
- Confirmation dialogs for destructive actions

## Security Features

### Row Level Security (RLS)

- Teachers can only access their own classes
- Students can only see classes they're enrolled in
- Proper foreign key constraints and cascade deletion

### Input Validation

- Form validation using Zod schemas
- SQL injection prevention
- XSS protection through proper escaping

## Performance Considerations

### Database Queries

- Efficient joins for class data
- Pagination for large datasets
- Indexed queries on frequently accessed fields

### UI Optimization

- Debounced search inputs
- Lazy loading of student lists
- Optimistic updates for better UX

## Testing

### Sample Data Script

Run `node scripts/insert-sample-classes.js` to populate the database with:

- 8 sample classes across different subjects and grade levels
- Student enrollments for testing
- Realistic class descriptions and metadata

### Test Scenarios

- Create/edit/delete classes
- Add/remove students
- Search and filter functionality
- Error handling and edge cases

## Future Enhancements

### Planned Features

- **Class Templates**: Pre-defined class structures
- **Bulk Operations**: Import/export class data
- **Advanced Analytics**: Learning outcome tracking
- **Integration**: Connect with lessons, quizzes, and activities
- **Notifications**: Automated enrollment confirmations

### Technical Improvements

- **Caching**: Redis integration for frequently accessed data
- **Real-time Updates**: WebSocket integration for live updates
- **File Uploads**: Support for class materials and resources
- **Mobile Optimization**: Enhanced mobile experience

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check RLS policies and user authentication
2. **Cascade Deletion**: Ensure proper foreign key relationships
3. **Student Enrollment**: Verify student profiles exist and are accessible
4. **Search Performance**: Check database indexes on search fields
5. **Student Management**: The current system allows any teacher to enroll any student. Consider adding teacher-student relationships for better access control.

### Debug Steps

1. Verify environment variables are set correctly
2. Check Supabase dashboard for RLS policies
3. Review browser console for API errors
4. Validate database schema matches expected structure

## Support

For technical support or feature requests:

- Check the troubleshooting section above
- Review Supabase logs for detailed error information
- Ensure all dependencies are properly installed
- Verify database migrations have been applied
