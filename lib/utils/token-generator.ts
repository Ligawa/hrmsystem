import crypto from 'crypto';

/**
 * Generates a secure, URL-safe token for applicant tracking
 * Used for applicant dashboard access and document submissions
 */
export function generateApplicationToken(): string {
  // Generate 32 random bytes and convert to URL-safe base64
  const randomBytes = crypto.randomBytes(32);
  return randomBytes
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Hash a token for storage (one-way function)
 * Used when storing tokens in database for security
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Verify a token against its hash
 */
export function verifyToken(token: string, hash: string): boolean {
  return hashToken(token) === hash;
}
