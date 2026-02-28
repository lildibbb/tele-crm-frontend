/**
 * Activity SSE (Server-Sent Events) stream.
 * Connect with EventSource to receive real-time activity feed updates.
 * Keepalive ping every 30s.
 *
 * Usage:
 *   const source = activityApi.stream(accessToken);
 *   source.onmessage = ({ data }) => { const event = JSON.parse(data); ... };
 *   source.onerror = () => { source.close(); };
 */
import { API_BASE_URL } from "./apiClient";

export const activityApi = {
  /**
   * Opens a Server-Sent Events connection to the real-time activity feed.
   * Pass accessToken as query param since EventSource doesn't support custom headers.
   */
  stream: (accessToken: string): EventSource => {
    const url = `${API_BASE_URL}/activity/stream?token=${encodeURIComponent(accessToken)}`;
    return new EventSource(url);
  },
};
