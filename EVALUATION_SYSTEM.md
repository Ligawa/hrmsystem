# Applicant Evaluation System

A comprehensive system for managing the applicant evaluation process including document uploads, video interviews, and assessments with automated scoring and review interfaces.

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Applicant Portal Pages](#applicant-portal-pages)
- [Admin Review Interfaces](#admin-review-interfaces)
- [Notifications](#notifications)
- [Setup Instructions](#setup-instructions)

## Features

### 1. **Document Management**
- Multi-type document uploads (Resume, Cover Letter, Certificates, Portfolio, etc.)
- Status tracking (Pending, Approved, Rejected)
- Document approval/rejection workflow
- Admin review interface with document preview

### 2. **Video Interviews**
- Browser-based video recording (WebRTC)
- Automatic duration tracking
- 5-minute recording limit
- Rating system (1-5 stars)
- Multiple scoring dimensions:
  - Communication Score
  - Technical Score
  - Presentation Score
  - Confidence Score
- Admin feedback and review interface

### 3. **Assessments**
- Multiple assessment types (MCQ, Written, Situational, Technical)
- Question banks with automatic scoring
- Time-limited assessments
- Auto-scoring for MCQ questions
- Manual grading for written responses
- Detailed result tracking with passing scores

### 4. **Admin Dashboard**
- Centralized review interface
- Filter and search capabilities
- Bulk operations
- Export functionality
- Performance analytics

## System Architecture

### Technology Stack

```
Frontend:
- React 19+ with Next.js 16
- TypeScript
- Tailwind CSS
- ShadCN/UI Components

Backend:
- Next.js API Routes
- Supabase (PostgreSQL)
- Vercel Blob (File Storage)

Integrations:
- Vercel Blob for document/video storage
- Supabase for data persistence
- Email service for notifications
```

### Data Flow

```
Applicant Portal
    ↓
Upload/Record/Take Assessment
    ↓
API Endpoint (POST)
    ↓
File Storage (Blob)
    ↓
Database (Supabase)
    ↓
Admin Review Interface
    ↓
Email Notifications
```

## Database Schema

### Core Tables

#### `application_documents`
Stores uploaded documents with approval status.

```sql
- id (UUID, PK)
- application_id (UUID, FK)
- document_type (VARCHAR) - resume, cover_letter, certificates, etc.
- document_url (VARCHAR) - Blob storage path
- upload_status (VARCHAR) - pending, approved, rejected
- reviewed_by (UUID, FK to users)
- reviewed_at (TIMESTAMP)
```

#### `video_interviews`
Stores video interview submissions and ratings.

```sql
- id (UUID, PK)
- application_id (UUID, UNIQUE, FK)
- video_url (VARCHAR) - Blob storage path
- duration_seconds (INT)
- overall_rating (INT, 1-5)
- communication_score (INT, 1-5)
- technical_score (INT, 1-5)
- presentation_score (INT, 1-5)
- confidence_score (INT, 1-5)
- reviewer_feedback (TEXT)
- reviewed_by (UUID, FK)
```

#### `assessments`
Stores assessment submissions and grades.

```sql
- id (UUID, PK)
- application_id (UUID, FK)
- assessment_type (VARCHAR) - mcq, written, situational, technical
- assessment_title (VARCHAR)
- submission_status (VARCHAR) - not_started, in_progress, submitted, graded
- score (INT) - auto-calculated
- percentage (DECIMAL)
- passed (BOOLEAN)
- reviewed_by (UUID, FK)
- reviewed_at (TIMESTAMP)
```

#### `assessment_questions`
Question bank for assessments.

```sql
- id (UUID, PK)
- assessment_id (UUID, FK)
- question_number (INT)
- question_text (TEXT)
- question_type (VARCHAR) - mcq, short_answer, essay, code
- marks (INT)
- options (JSONB) - for MCQ options
- correct_answer (TEXT)
```

#### `assessment_responses`
Applicant responses to assessment questions.

```sql
- id (UUID, PK)
- assessment_id (UUID, FK)
- question_id (UUID, FK)
- applicant_response (TEXT)
- marks_obtained (INT)
- is_correct (BOOLEAN)
- feedback (TEXT)
```

## API Endpoints

### Document Management

#### Upload Document
```
POST /api/documents
Content-Type: multipart/form-data

Parameters:
- applicationId (UUID)
- documentType (string)
- file (File)

Response:
{
  "success": true,
  "document": {
    "id": "uuid",
    "file_name": "resume.pdf",
    "upload_status": "pending",
    "created_at": "2026-06-17T..."
  }
}
```

#### Get Documents
```
GET /api/documents?applicationId=uuid

Response:
{
  "documents": [
    {
      "id": "uuid",
      "document_type": "resume",
      "file_name": "resume.pdf",
      "upload_status": "pending"
    }
  ]
}
```

#### Review Document
```
POST /api/documents/{documentId}/review

Body:
{
  "status": "approved" | "rejected",
  "rejectionReason": "string (if rejected)"
}

Response:
{
  "success": true,
  "document": { ... }
}
```

### Video Interview Management

#### Submit Video
```
POST /api/video-interviews

Body:
{
  "applicationId": "uuid",
  "videoBlob": ArrayBuffer,
  "durationSeconds": number
}

Response:
{
  "success": true,
  "interview": { ... }
}
```

#### Get Video Interview
```
GET /api/video-interviews?applicationId=uuid

Response:
{
  "interview": {
    "id": "uuid",
    "video_url": "...",
    "duration_seconds": 120,
    "upload_status": "submitted"
  }
}
```

#### Review Video
```
POST /api/video-interviews/{interviewId}/review

Body:
{
  "overallRating": 4,
  "communicationScore": 4,
  "technicalScore": 3,
  "presentationScore": 4,
  "confidenceScore": 4,
  "feedback": "Great communication skills..."
}

Response:
{
  "success": true,
  "interview": { ... }
}
```

### Assessment Management

#### Get Assessment
```
GET /api/assessments?assessmentId=uuid

Response:
{
  "assessments": {
    "id": "uuid",
    "assessment_title": "Technical Assessment",
    "total_questions": 10,
    "duration_minutes": 30,
    "assessment_questions": [ ... ]
  }
}
```

#### Submit Assessment
```
POST /api/assessments

Body:
{
  "applicationId": "uuid",
  "assessmentType": "mcq",
  "responses": [
    {
      "questionId": "uuid",
      "answer": "option_text"
    }
  ]
}

Response:
{
  "success": true,
  "assessment": { ... },
  "totalScore": 85,
  "percentage": 85,
  "passed": true
}
```

#### Grade Assessment
```
POST /api/assessments/{assessmentId}/grade

Body:
{
  "responses": [
    {
      "responseId": "uuid",
      "marks": 5,
      "feedback": "..."
    }
  ],
  "comments": "Good overall..."
}

Response:
{
  "success": true,
  "assessment": { ... }
}
```

## Applicant Portal Pages

### 1. Document Upload Page
**Route:** `/careers/dashboard/documents/upload/{applicationId}`

Features:
- Drag-and-drop file upload
- Document type selection
- Uploaded documents list with status
- Document checklist with required/optional indicators
- Real-time status tracking

### 2. Video Interview Page
**Route:** `/careers/dashboard/video-interview/{applicationId}`

Features:
- Browser-based video recording
- Duration timer with 5-minute limit
- Camera/microphone permission handling
- Video preview before submission
- Retake functionality
- Interview guidelines

### 3. Assessment Taker Page
**Route:** `/careers/dashboard/assessments/take/{assessmentId}`

Features:
- Question navigator
- Time limit countdown
- Auto-save responses
- Multiple question types (MCQ, Short Answer)
- Progress tracking
- Question review before submission

## Admin Review Interfaces

### 1. Document Review Dashboard
**Route:** `/setup/documents`

Features:
- Document list with filtering
- Status indicators
- Document preview capability
- Approval/rejection workflow
- Bulk operations

### 2. Video Review Dashboard
**Route:** `/setup/video-interviews`

Features:
- Video interview list with status
- Star rating system
- Multi-criteria scoring
- Feedback text editor
- Batch review capability

### 3. Assessment Grading Dashboard
**Route:** `/setup/assessments/grade`

Features:
- Assessment list with filtering
- Auto-scored MCQ questions
- Manual grading interface for open-ended questions
- Score calculation
- Pass/fail indication
- Result export

## Notifications

### Email Templates

The system includes automated email notifications for:

1. **Document Approved** - Notifies applicant when document is approved
2. **Document Rejected** - Sends feedback when document needs revision
3. **Video Reviewed** - Shares rating and feedback on video interview
4. **Assessment Graded** - Provides assessment results and feedback
5. **Admin Notifications** - Alerts admins to new submissions

### Notification Service
Located at: `/lib/services/evaluation-notification-service.ts`

Methods:
- `sendDocumentApprovedEmail(data)`
- `sendDocumentRejectedEmail(data)`
- `sendVideoReviewedEmail(data)`
- `sendAssessmentGradedEmail(data)`
- `sendDocumentUploadedNotificationToAdmin()`
- `sendAssessmentSubmittedNotificationToAdmin()`

## File Storage

### Vercel Blob Integration
Located at: `/lib/utils/blob-storage.ts`

Methods:
- `uploadFile(filename, file, pathname)` - Upload document/video
- `deleteFile(pathname)` - Remove stored files
- `listFiles(directory)` - List files in directory
- `fileExists(pathname)` - Check file existence

Files are stored with structure:
```
documents/{applicationId}/{filename}
videos/{applicationId}/interview.webm
```

## Row-Level Security (RLS)

All evaluation tables have RLS policies:

- **Applicants** can only view their own documents, videos, and assessments
- **Admins/Recruiters** can view all submissions
- **Reviewers** can update status and add feedback

## Setup Instructions

### 1. Run Database Migration
```bash
psql -U postgres -d your_db -f scripts/012_create_evaluation_tables.sql
```

### 2. Configure Environment Variables
```env
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=your_blob_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy Schema Changes
The migration script creates:
- 6 new tables with proper relationships
- Indexes for performance
- RLS policies for security

### 4. Test the System
1. Create a job application
2. Upload a document
3. Record a video interview
4. Submit an assessment
5. Review in admin dashboard

## Performance Optimization

### Indexes
- `idx_application_documents_application_id`
- `idx_application_documents_status`
- `idx_video_interviews_application_id`
- `idx_video_interviews_rating`
- `idx_assessments_application_id`
- `idx_assessments_type`
- `idx_assessments_status`

### Caching
- Document lists cached at application level
- Video interview status updated in real-time
- Assessment questions cached during session

## Security Considerations

1. **File Upload Security**
   - File type validation on frontend
   - Size limits (max 10MB)
   - Virus scanning recommended

2. **Data Privacy**
   - RLS policies enforce user isolation
   - Blob files stored securely
   - Encryption in transit

3. **Access Control**
   - User role validation
   - Application ownership verification
   - Admin-only operations protected

## Troubleshooting

### Video Not Recording
- Check camera/microphone permissions
- Ensure browser supports WebRTC
- Test with HTTPS (required for camera access)

### Documents Not Uploading
- Verify file size < 10MB
- Check BLOB_READ_WRITE_TOKEN
- Ensure Blob storage is configured

### Assessments Not Saving
- Verify application_id exists
- Check database connectivity
- Review error logs in browser console

## Future Enhancements

- Batch import of assessment questions
- Video interview transcription with AI
- Advanced analytics dashboard
- Bulk email notifications
- Assessment templates library
- Resume parsing for auto-fill
