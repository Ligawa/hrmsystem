/**
 * Email Notification Service
 * Handles sending emails to applicants and admins
 */

export type EmailType =
  | 'registration_confirmation'
  | 'application_received'
  | 'application_shortlisted'
  | 'interview_scheduled'
  | 'assessment_assigned'
  | 'offer_extended'
  | 'rejection'
  | 'password_reset'
  | 'admin_new_application';

export interface EmailData {
  to: string;
  type: EmailType;
  data: Record<string, any>;
}

/**
 * Email templates
 */
const emailTemplates: Record<EmailType, (data: any) => { subject: string; html: string }> = {
  registration_confirmation: (data) => ({
    subject: 'Welcome to WHO Careers Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Welcome to WHO Careers!</h1>
        <p>Hello ${data.firstName},</p>
        <p>Thank you for registering with the World Health Organization Careers Portal.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Your Applicant ID: <strong>${data.applicantId}</strong></p>
          <p style="margin: 10px 0 0 0;">Please save this ID for future reference.</p>
        </div>
        
        <p>Complete your profile to start applying for positions.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.profileUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Your Profile</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          If you have any questions, please contact our recruitment team at careers@who.int
        </p>
      </div>
    `,
  }),

  application_received: (data) => ({
    subject: 'Application Received - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Application Received</h1>
        <p>Hello ${data.applicantName},</p>
        <p>Thank you for applying for the position of <strong>${data.position}</strong> at the World Health Organization.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">Application Status: <strong>Submitted</strong></p>
          <p style="margin: 10px 0 0 0;">Application ID: ${data.applicationId}</p>
          <p style="margin: 10px 0 0 0;">Submitted Date: ${new Date(data.submittedDate).toLocaleDateString()}</p>
        </div>
        
        <p>We have received your application and it is now under review. You will be notified of any updates to your application status.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.trackingUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Track Your Application</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          For more information, visit our careers portal at careers.who.int
        </p>
      </div>
    `,
  }),

  application_shortlisted: (data) => ({
    subject: 'Congratulations! You Have Been Shortlisted - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Congratulations!</h1>
        <p>Hello ${data.applicantName},</p>
        <p>We are pleased to inform you that your application for the position of <strong>${data.position}</strong> has been shortlisted.</p>
        
        <p>This is an important step in our recruitment process, and we would like to move forward with your candidacy. The next stage will involve an interview with our recruitment team.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.trackingUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Next Steps</a>
        </div>
        
        <p>If you have any questions, please don't hesitate to contact us at careers@who.int</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          Best regards,<br>WHO Recruitment Team
        </p>
      </div>
    `,
  }),

  interview_scheduled: (data) => ({
    subject: 'Interview Scheduled - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Interview Scheduled</h1>
        <p>Hello ${data.applicantName},</p>
        <p>Your interview for the position of <strong>${data.position}</strong> has been scheduled.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;">
            <strong>Interview Date:</strong> ${new Date(data.interviewDate).toLocaleDateString()} at ${new Date(data.interviewDate).toLocaleTimeString()}
          </p>
          <p style="margin: 10px 0 0 0;">
            <strong>Type:</strong> ${data.interviewType}
          </p>
          ${data.zoomLink ? `
            <p style="margin: 10px 0 0 0;">
              <strong>Meeting Link:</strong> <a href="${data.zoomLink}" style="color: #0079C2;">${data.zoomLink}</a>
            </p>
          ` : ''}
        </div>
        
        <p>Please confirm your attendance by clicking the button below or logging into your portal.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.confirmUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Confirm Attendance</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          If you have questions or need to reschedule, please contact careers@who.int
        </p>
      </div>
    `,
  }),

  assessment_assigned: (data) => ({
    subject: 'Assessment Assigned - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Assessment Assigned</h1>
        <p>Hello ${data.applicantName},</p>
        <p>An assessment has been assigned for your application to the <strong>${data.position}</strong> position.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Assessment:</strong> ${data.assessmentName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Type:</strong> ${data.assessmentType}</p>
          <p style="margin: 10px 0 0 0;"><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
        </div>
        
        <p>Please complete this assessment by the due date to advance in the hiring process.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.assessmentUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Start Assessment</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          For support, contact careers@who.int
        </p>
      </div>
    `,
  }),

  rejection: (data) => ({
    subject: 'Application Status Update - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6b7280;">Application Status Update</h1>
        <p>Hello ${data.applicantName},</p>
        <p>Thank you for applying for the position of <strong>${data.position}</strong> at the World Health Organization.</p>
        
        <p>After careful consideration, we have decided to move forward with other candidates who more closely match the requirements for this position at this time. This decision does not reflect on your qualifications but rather the specific needs of this role.</p>
        
        <p>We would like to encourage you to apply for other positions in the future that match your profile. We value your interest in WHO and hope to connect with you again.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.careerPageUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View More Opportunities</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          Best regards,<br>WHO Recruitment Team
        </p>
      </div>
    `,
  }),

  password_reset: (data) => ({
    subject: 'Password Reset Request - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your WHO Careers Portal account.</p>
        
        <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.resetLink}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        
        <p>If you did not request this password reset, please ignore this email or contact us at careers@who.int</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          WHO Recruitment Team
        </p>
      </div>
    `,
  }),

  admin_new_application: (data) => ({
    subject: `New Application Received - ${data.applicantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">New Application Received</h1>
        <p>A new application has been submitted for review.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Applicant:</strong> ${data.applicantName}</p>
          <p style="margin: 10px 0 0 0;"><strong>Applicant ID:</strong> ${data.applicantId}</p>
          <p style="margin: 10px 0 0 0;"><strong>Position:</strong> ${data.position}</p>
          <p style="margin: 10px 0 0 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Submitted:</strong> ${new Date(data.submittedDate).toLocaleString()}</p>
          <p style="margin: 10px 0 0 0;"><strong>Profile Completion:</strong> ${data.profileCompletion}%</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${data.adminUrl}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Application</a>
        </div>
      </div>
    `,
  }),

  offer_extended: (data) => ({
    subject: 'Offer Extended - WHO Careers',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10b981;">Congratulations! We Would Like to Make an Offer</h1>
        <p>Hello ${data.applicantName},</p>
        <p>We are delighted to extend an offer for the position of <strong>${data.position}</strong> at the World Health Organization.</p>
        
        <p>Please review the offer details and confirm your acceptance or provide any questions you may have.</p>
        
        <div style="margin: 30px 0;">
          <a href="${data.offerUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Offer</a>
        </div>
        
        <p>We look forward to welcoming you to the WHO family!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          Best regards,<br>WHO Human Resources Team
        </p>
      </div>
    `,
  }),
};

/**
 * Send email via Resend API
 */
async function sendViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Fallback to console logging if Resend is not configured
    console.warn('[EMAIL_SERVICE] Resend API key not configured. Logging email instead:');
    console.log('[EMAIL_LOG]', { to, subject });
    return true; // Return true to not break the flow in development
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@careers.who.int',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[EMAIL_SERVICE] Resend API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('[EMAIL_SERVICE] Email sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('[EMAIL_SERVICE] Failed to send email via Resend:', error);
    return false;
  }
}

/**
 * Send email (integration point for email service)
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const template = emailTemplates[emailData.type];

    if (!template) {
      console.error(`[EMAIL_SERVICE] Unknown email type: ${emailData.type}`);
      return false;
    }

    const { subject, html } = template(emailData.data);

    // Send via Resend (with fallback to console logging)
    return await sendViaResend(emailData.to, subject, html);
  } catch (error) {
    console.error('[EMAIL_SERVICE] Error in sendEmail:', error);
    return false;
  }
}

/**
 * Send batch emails
 */
export async function sendBatchEmails(emails: EmailData[]): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const success = await sendEmail(email);
    if (success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}
