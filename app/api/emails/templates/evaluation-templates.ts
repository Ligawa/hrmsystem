export const evaluationEmailTemplates = {
  document_approved: (data: any) => ({
    subject: `Document Approved: ${data.documentType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #22c55e; font-size: 24px;">Document Approved ✓</h1>
        </div>
        
        <p>Hi ${data.name},</p>
        
        <p>Great news! Your <strong>${data.documentType}</strong> has been approved by our evaluation team.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;">
            <strong>Status:</strong> Approved<br>
            <strong>Document:</strong> ${data.documentType}
          </p>
        </div>
        
        <p>${data.nextSteps}</p>
        
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          HR Management System Team
        </p>
      </div>
    `
  }),

  document_rejected: (data: any) => ({
    subject: `Document Revision Needed: ${data.documentType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #ef4444; font-size: 24px;">Document Revision Needed</h1>
        </div>
        
        <p>Hi ${data.name},</p>
        
        <p>Thank you for submitting your <strong>${data.documentType}</strong>. After review, we need you to make some revisions.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #7f1d1d;">
            <strong>Feedback:</strong><br>
            ${data.reason}
          </p>
        </div>
        
        <p>${data.instruction}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          HR Management System Team
        </p>
      </div>
    `
  }),

  video_reviewed: (data: any) => ({
    subject: 'Your Video Interview Has Been Reviewed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #3b82f6; font-size: 24px;">Video Interview Review Complete</h1>
        </div>
        
        <p>Hi ${data.name},</p>
        
        <p>Your video interview has been reviewed by our team.</p>
        
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Overall Rating:</strong> ${data.rating}/5 ⭐<br>
            <strong>Feedback:</strong><br>
            ${data.feedback}
          </p>
        </div>
        
        <p>${data.nextSteps}</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          HR Management System Team
        </p>
      </div>
    `
  }),

  assessment_graded: (data: any) => ({
    subject: 'Your Assessment Has Been Graded',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #3b82f6; font-size: 24px;">Assessment Grading Complete</h1>
        </div>
        
        <p>Hi ${data.name},</p>
        
        <p>Your <strong>${data.assessmentTitle}</strong> assessment has been graded.</p>
        
        <div style="background-color: ${data.passed ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${data.passed ? '#22c55e' : '#ef4444'}; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: ${data.passed ? '#166534' : '#7f1d1d'};">
            <strong>Assessment:</strong> ${data.assessmentTitle}<br>
            <strong>Score:</strong> ${data.score} / 100<br>
            <strong>Percentage:</strong> ${data.percentage}%<br>
            <strong>Result:</strong> <strong>${data.result}</strong>
          </p>
        </div>
        
        ${data.feedback ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong style="display: block; margin-bottom: 8px;">Feedback:</strong>
            <p style="margin: 0; color: #374151;">${data.feedback}</p>
          </div>
        ` : ''}
        
        <p>Thank you for your participation in our evaluation process.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Best regards,<br>
          HR Management System Team
        </p>
      </div>
    `
  }),

  document_uploaded_admin: (data: any) => ({
    subject: `New Document Upload: ${data.documentType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #3b82f6; font-size: 24px;">New Document Submitted</h1>
        </div>
        
        <p>A new document has been submitted and requires your review:</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Applicant:</strong> ${data.applicantName}<br>
            <strong>Document Type:</strong> ${data.documentType}<br>
            <strong>Action:</strong> ${data.action}
          </p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          HR Management System
        </p>
      </div>
    `
  }),

  assessment_submitted_admin: (data: any) => ({
    subject: `New Assessment Submission: ${data.assessmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="margin: 0; color: #3b82f6; font-size: 24px;">New Assessment Submitted</h1>
        </div>
        
        <p>A new assessment has been submitted and requires your review:</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Applicant:</strong> ${data.applicantName}<br>
            <strong>Assessment:</strong> ${data.assessmentTitle}<br>
            <strong>Action:</strong> ${data.action}
          </p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          HR Management System
        </p>
      </div>
    `
  })
}
