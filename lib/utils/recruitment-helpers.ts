/**
 * Recruitment System Helper Functions
 */

/**
 * Format applicant status for display
 */
export function formatApplicationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview: 'Interview Scheduled',
    offered: 'Offer Extended',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  return statusMap[status] || status;
}

/**
 * Get color class for application status
 */
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-green-100 text-green-800',
    interview: 'bg-purple-100 text-purple-800',
    offered: 'bg-green-100 text-green-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Calculate profile completion percentage
 */
export function calculateProfileCompletion(applicant: any): number {
  const sections = [
    { name: 'personalInfo', weight: 25 },
    { name: 'professionalDetails', weight: 25 },
    { name: 'education', weight: 25 },
    { name: 'workExperience', weight: 25 },
  ];

  let completionScore = 0;

  sections.forEach((section) => {
    const data = applicant[section.name];
    if (data) {
      // Check if section has at least some data
      const hasData = Object.values(data).some((value) => value && value !== '');
      if (hasData) {
        completionScore += section.weight;
      }
    }
  });

  return Math.min(100, completionScore);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one uppercase letter');
  }

  if (/[0-9]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 25;
  } else {
    feedback.push('At least one special character');
  }

  return {
    valid: score >= 75,
    score,
    feedback,
  };
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${key}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length).trim() + '...';
}

/**
 * Generate PDF filename with timestamp
 */
export function generateDocumentFilename(baseFileName: string, documentType: string): string {
  const timestamp = new Date().getTime();
  const extension = baseFileName.split('.').pop() || 'pdf';
  return `${documentType}_${timestamp}.${extension}`.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Check if file is supported document type
 */
export function isSupportedDocumentType(fileName: string): boolean {
  const supportedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return supportedExtensions.includes(extension);
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Sanitize HTML string
 */
export function sanitizeHTML(html: string): string {
  const textarea = document.createElement('textarea');
  textarea.textContent = html;
  return textarea.innerHTML;
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

/**
 * Generate random color for avatar
 */
export function getAvatarColor(name: string): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
