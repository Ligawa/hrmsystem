/**
 * Generates unique Applicant IDs in format: APP-YYYY-XXXXXX
 * where YYYY is the current year and XXXXXX is a 6-digit random number
 */

export function generateApplicantId(): string {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  
  return `APP-${year}-${randomNumber}`;
}

/**
 * Validates applicant ID format
 */
export function isValidApplicantId(id: string): boolean {
  const pattern = /^APP-\d{4}-\d{6}$/;
  return pattern.test(id);
}

/**
 * Extracts year from applicant ID
 */
export function extractYearFromApplicantId(id: string): number | null {
  if (!isValidApplicantId(id)) return null;
  const year = id.split('-')[1];
  return parseInt(year, 10);
}
