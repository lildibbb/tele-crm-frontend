const ERROR_MAP: Record<string, string> = {
  // Auth
  'Invalid credentials': 'Incorrect email or password. Please try again.',
  'Account deactivated': 'Your account has been deactivated. Contact your administrator.',
  'Token has been revoked': 'Your session has expired. Please sign in again.',
  'Account access has been revoked': 'Your access has been revoked. Contact your administrator.',
  'No refresh token provided': 'Your session has expired. Please sign in again.',
  'Insufficient permissions': "You don't have permission to perform this action.",

  // Generic
  'Validation failed': 'Please check your input and try again.',
  'Record not found': 'The requested item could not be found.',
  'This record already exists': 'A record with this information already exists.',
  'Cannot delete — this record is referenced elsewhere': 'This item cannot be deleted because it is linked to other records.',

  // Storage/Upload
  'File upload failed. Please try again.': 'Upload failed. Please check your file and try again.',
  'Could not read the uploaded file. Please ensure it contains readable text.': "We couldn't read your file. Make sure it contains readable text content.",

  // Config
  'Storage service is not properly configured. Contact your administrator.': 'A system service needs attention. Your admin has been notified.',
  'Encryption service is misconfigured. Contact your administrator.': 'A system service needs attention. Your admin has been notified.',
  'Backup service is not configured. Contact your administrator.': 'Backup service needs setup. Your admin has been notified.',
};

export function friendlyError(raw: string): string {
  if (ERROR_MAP[raw]) return ERROR_MAP[raw];

  const lowerRaw = raw.toLowerCase();
  if (lowerRaw.includes('network') || lowerRaw.includes('econnrefused')) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (lowerRaw.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }
  if (lowerRaw.includes('413') || lowerRaw.includes('too large')) {
    return 'The file is too large. Please use a smaller file.';
  }
  if (lowerRaw.includes('429') || lowerRaw.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // If already user-friendly (not technical), pass through
  if (!raw.includes('Error:') && !raw.includes('error:') && !raw.includes('_') && raw.length < 100) {
    return raw;
  }

  return 'Something went wrong. Please try again.';
}
