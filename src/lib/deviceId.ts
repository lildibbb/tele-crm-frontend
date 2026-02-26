/**
 * Device ID utilities for persistent device tracking.
 * Generates and persists a unique UUID per browser/device in localStorage.
 */

const DEVICE_ID_KEY = "titan_device_id";

/**
 * Gets or generates a persistent device ID for the current browser/device.
 * The ID persists across browser sessions via localStorage.
 *
 * @returns The persistent device UUID
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  try {
    // Try to get existing device ID from localStorage
    const existingId = localStorage.getItem(DEVICE_ID_KEY);

    if (existingId && isValidUUID(existingId)) {
      return existingId;
    }

    // Generate new UUID and store it
    const newId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, newId);

    return newId;
  } catch {
    // If localStorage is not available (e.g., private browsing in some browsers),
    // fall back to generating a random ID (will not persist)
    return crypto.randomUUID();
  }
}

/**
 * Gets the user agent string for the current browser.
 *
 * @returns The browser's user agent string
 */
export function getUserAgent(): string {
  if (typeof navigator === "undefined") {
    return "unknown";
  }
  return navigator.userAgent;
}

/**
 * Validates if a string is a valid UUID v4 format.
 *
 * @param id - The string to validate
 * @returns True if the string is a valid UUID
 */
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
