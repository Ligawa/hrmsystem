import { createClient } from '@/lib/supabase/server'

interface NotificationData {
  applicantEmail: string
  applicantName: string
  documentType?: string
  documentStatus?: string
  videoRating?: number
  assessmentTitle?: string
  assessmentScore?: number
  assessmentPercentage?: number
  assessmentPassed?: boolean
  rejectionReason?: string
  feedback?: string
}

export const evaluationNotificationService = {
  async sendDocumentApprovedEmail(data: NotificationData) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.applicantEmail,
          subject: `Document Approved: ${data.documentType}`,
          template: 'document_approved',
          data: {
            name: data.applicantName,
            documentType: data.documentType,
            nextSteps: 'Your document has been approved. You may now proceed to the next stage of the evaluation.'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending document approved email:', error)
    }
  },

  async sendDocumentRejectedEmail(data: NotificationData) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.applicantEmail,
          subject: `Document Revision Needed: ${data.documentType}`,
          template: 'document_rejected',
          data: {
            name: data.applicantName,
            documentType: data.documentType,
            reason: data.rejectionReason,
            instruction: 'Please revise your document based on the feedback and resubmit.'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending document rejected email:', error)
    }
  },

  async sendVideoReviewedEmail(data: NotificationData) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.applicantEmail,
          subject: 'Your Video Interview Has Been Reviewed',
          template: 'video_reviewed',
          data: {
            name: data.applicantName,
            rating: data.videoRating,
            feedback: data.feedback,
            nextSteps: 'Your video interview has been reviewed and you will be notified of the next steps.'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending video reviewed email:', error)
    }
  },

  async sendAssessmentGradedEmail(data: NotificationData) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.applicantEmail,
          subject: 'Your Assessment Has Been Graded',
          template: 'assessment_graded',
          data: {
            name: data.applicantName,
            assessmentTitle: data.assessmentTitle,
            score: data.assessmentScore,
            percentage: data.assessmentPercentage,
            passed: data.assessmentPassed,
            feedback: data.feedback,
            result: data.assessmentPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending assessment graded email:', error)
    }
  },

  async sendAssessmentSubmittedNotificationToAdmin(
    adminEmail: string,
    applicantName: string,
    assessmentTitle: string
  ) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `New Assessment Submission: ${assessmentTitle}`,
          template: 'assessment_submitted_admin',
          data: {
            applicantName,
            assessmentTitle,
            action: 'Please review the assessment submission in your admin dashboard.'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending admin notification email:', error)
    }
  },

  async sendDocumentUploadedNotificationToAdmin(
    adminEmail: string,
    applicantName: string,
    documentType: string
  ) {
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `New Document Upload: ${documentType}`,
          template: 'document_uploaded_admin',
          data: {
            applicantName,
            documentType,
            action: 'Please review and approve/reject the document in your admin dashboard.'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('[v0] Error sending admin notification email:', error)
    }
  }
}
