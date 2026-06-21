/**
 * Secure error handling utility
 * Logs detailed errors server-side while returning safe messages to clients
 */

export type ErrorCategory = 'auth' | 'authorization' | 'validation' | 'service' | 'not_found' | 'conflict'

export interface SafeErrorResponse {
  error: string
  status: number
}

/**
 * Map detailed server errors to generic client-safe messages
 */
function getSafeMessage(category: ErrorCategory, details?: string): string {
  const messages: Record<ErrorCategory, string> = {
    auth: 'Authentication failed. Please log in and try again.',
    authorization: 'You do not have permission to access this resource.',
    validation: 'The provided information is invalid. Please check and try again.',
    service: 'Service temporarily unavailable. Please try again later.',
    not_found: 'The requested resource was not found.',
    conflict: 'This action conflicts with existing data. Please try again.',
  }

  return messages[category]
}

/**
 * Log error details server-side (secure - not sent to client)
 */
export function logError(
  context: string,
  error: unknown,
  details?: Record<string, any>
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[BACKEND_ERROR] ${context}`, {
    message: errorMessage,
    stack: errorStack,
    details,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Create a safe error response for client
 */
export function createSafeErrorResponse(
  category: ErrorCategory,
  status: number,
  context: string,
  error: unknown,
  details?: Record<string, any>
): SafeErrorResponse {
  // Log the full error server-side
  logError(context, error, details)

  // Return safe message to client
  return {
    error: getSafeMessage(category),
    status,
  }
}

/**
 * Handle Supabase errors securely
 */
export function handleSupabaseError(
  error: any,
  context: string
): SafeErrorResponse {
  logError(context, error)

  // Check for specific error patterns
  if (error.message?.includes('not authorized')) {
    return {
      error: 'You do not have permission to access this resource.',
      status: 403,
    }
  }

  if (error.message?.includes('violates foreign key constraint')) {
    return {
      error: 'This action references invalid data. Please try again.',
      status: 409,
    }
  }

  if (error.message?.includes('violates unique constraint')) {
    return {
      error: 'This record already exists. Please check your information.',
      status: 409,
    }
  }

  // Default to service error
  return {
    error: 'Service temporarily unavailable. Please try again later.',
    status: 503,
  }
}

/**
 * Handle blob storage errors securely
 */
export function handleBlobError(error: any, context: string): SafeErrorResponse {
  logError(context, error)

  if (error.message?.includes('unauthorized')) {
    return {
      error: 'File upload service is not available. Please try again later.',
      status: 503,
    }
  }

  if (error.message?.includes('size')) {
    return {
      error: 'File is too large. Please upload a smaller file.',
      status: 400,
    }
  }

  return {
    error: 'Failed to upload file. Please try again later.',
    status: 503,
  }
}
