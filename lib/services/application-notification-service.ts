/**
 * Application Notification Service
 * Sends emails to applicants when their application status changes
 */

import { sendEmail, EmailType } from './email-service';
import { logError } from '@/lib/utils/error-handler';

export interface NotificationPayload {
  applicantName: string;
  applicantEmail: string;
  position: string;
  applicationId: string;
  [key: string]: any;
}

/**
 * Send application submitted confirmation email
 */
export async function sendApplicationSubmittedEmail(payload: NotificationPayload): Promise<boolean> {
  try {
    return await sendEmail({
      to: payload.applicantEmail,
      type: 'application_received',
      data: {
        applicantName: payload.applicantName,
        position: payload.position,
        applicationId: payload.applicationId,
        submittedDate: new Date(),
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/applications/${payload.applicationId}`,
      },
    });
  } catch (error) {
    logError('sendApplicationSubmittedEmail', error, { applicantEmail: payload.applicantEmail });
    return false;
  }
}

/**
 * Send status change notification email
 */
export async function sendApplicationStatusChangedEmail(
  payload: NotificationPayload & { newStatus: string; previousStatus?: string }
): Promise<boolean> {
  try {
    let emailType: EmailType = 'application_received';
    let emailData: Record<string, any> = {
      applicantName: payload.applicantName,
      position: payload.position,
      applicationId: payload.applicationId,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/applications/${payload.applicationId}`,
    };

    // Map application status to email type
    switch (payload.newStatus.toLowerCase()) {
      case 'shortlisted':
        emailType = 'application_shortlisted';
        emailData.careerPageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/browse`;
        break;

      case 'rejected':
        emailType = 'rejection';
        emailData.careerPageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/browse`;
        break;

      case 'interview_scheduled':
        emailType = 'interview_scheduled';
        emailData.interviewDate = payload.interviewDate || new Date();
        emailData.interviewType = payload.interviewType || 'Preliminary';
        emailData.zoomLink = payload.zoomLink;
        emailData.confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/applications/${payload.applicationId}`;
        break;

      case 'offer_extended':
        emailType = 'offer_extended';
        emailData.offerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/applications/${payload.applicationId}/offer`;
        break;

      default:
        console.log(`[APPLICATION_NOTIFICATION] Unknown status: ${payload.newStatus}, sending generic email`);
    }

    return await sendEmail({
      to: payload.applicantEmail,
      type: emailType,
      data: emailData,
    });
  } catch (error) {
    logError('sendApplicationStatusChangedEmail', error, {
      applicantEmail: payload.applicantEmail,
      newStatus: payload.newStatus,
    });
    return false;
  }
}

/**
 * Send documents requested notification email
 */
export async function sendDocumentsRequestedEmail(
  payload: NotificationPayload & { requestedDocuments: string[] }
): Promise<boolean> {
  try {
    const documentsText = payload.requestedDocuments.join(', ');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0079C2;">Additional Documents Required</h1>
        <p>Hello ${payload.applicantName},</p>
        <p>We need additional documents from you to proceed with your application for the <strong>${payload.position}</strong> position.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Requested Documents:</strong></p>
          <p style="margin: 10px 0 0 0;">${documentsText}</p>
        </div>
        
        <p>Please upload these documents through your application portal within 5 business days. Failure to do so may impact your application status.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/documents/upload?applicationId=${payload.applicationId}" style="background-color: #0079C2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Upload Documents</a>
        </div>
        
        <p>If you have any questions, please contact our recruitment team at careers@who.int</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280;">
          Best regards,<br>WHO Recruitment Team
        </p>
      </div>
    `;

    return await sendEmail({
      to: payload.applicantEmail,
      type: 'application_received' as EmailType, // Using as placeholder - we'll customize the HTML
      data: { emailHtml }, // Custom data that won't be used but needed for the interface
    });
  } catch (error) {
    logError('sendDocumentsRequestedEmail', error, {
      applicantEmail: payload.applicantEmail,
      requestedDocuments: payload.requestedDocuments,
    });
    return false;
  }
}

/**
 * Send application rejection email
 */
export async function sendApplicationRejectionEmail(
  payload: NotificationPayload & { reason?: string }
): Promise<boolean> {
  try {
    return await sendEmail({
      to: payload.applicantEmail,
      type: 'rejection',
      data: {
        applicantName: payload.applicantName,
        position: payload.position,
        careerPageUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/browse`,
      },
    });
  } catch (error) {
    logError('sendApplicationRejectionEmail', error, { applicantEmail: payload.applicantEmail });
    return false;
  }
}

/**
 * Send shortlist notification email
 */
export async function sendApplicationShortlistedEmail(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    return await sendEmail({
      to: payload.applicantEmail,
      type: 'application_shortlisted',
      data: {
        applicantName: payload.applicantName,
        position: payload.position,
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/careers/dashboard/applications/${payload.applicationId}`,
      },
    });
  } catch (error) {
    logError('sendApplicationShortlistedEmail', error, { applicantEmail: payload.applicantEmail });
    return false;
  }
}
