/**
 * Job Reference Number Generator for WHO
 * Format: WHO-YYYY-0001, WHO-YYYY-0002, etc.
 */

export async function generateJobReferenceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `WHO-${currentYear}`;
  
  // In a real scenario, you would query the database to find the highest number for this year
  // For now, we'll generate based on timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-5);
  const sequenceNumber = parseInt(timestamp) % 10000;
  
  return `${prefix}-${sequenceNumber.toString().padStart(4, '0')}`;
}

/**
 * Parse a job reference number to extract year and sequence
 */
export function parseJobReferenceNumber(reference: string) {
  const match = reference.match(/WHO-(\d{4})-(\d{4})/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1]),
    sequence: parseInt(match[2]),
    fullReference: reference,
  };
}

/**
 * Validate job reference number format
 */
export function isValidJobReferenceNumber(reference: string): boolean {
  return /^WHO-\d{4}-\d{4}$/.test(reference);
}

/**
 * Generate next sequence number for a given year
 * This should be called with the highest sequence number for the year
 */
export function getNextSequenceNumber(lastSequence: number): number {
  return lastSequence + 1;
}
