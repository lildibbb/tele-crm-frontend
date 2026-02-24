/**
 * Generate a random unique ID using the Web Crypto API.
 * @param opts.length - if provided, returns a shorter hex-based ID of that length
 */
export function generateId(opts?: { length?: number }): string {
  const uuid = crypto.randomUUID();
  if (opts?.length) {
    return uuid.replace(/-/g, "").slice(0, opts.length);
  }
  return uuid;
}
