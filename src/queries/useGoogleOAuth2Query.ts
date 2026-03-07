import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import {
  googleOAuth2Api,
  type GoogleOAuth2Status,
} from "@/lib/api/googleOAuth2";
import { toast } from "sonner";

// ─── Status Query ─────────────────────────────────────────────────────────────

export function useGoogleOAuth2Status() {
  return useQuery({
    queryKey: queryKeys.googleOAuth2.status(),
    queryFn: async () => {
      const res = await googleOAuth2Api.getStatus();
      // Backend returns data directly (not wrapped in ApiResponse)
      return res.data as GoogleOAuth2Status;
    },
    staleTime: 30_000,
    retry: false,
  });
}

// ─── Connect (Popup Flow) ─────────────────────────────────────────────────────

export function useGoogleConnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Get the auth URL from the backend
      const res = await googleOAuth2Api.getConnectUrl();
      const authUrl = (res.data as unknown as { authUrl: string }).authUrl;

      // 2. Open a popup window with the Google consent screen
      const popup = window.open(
        authUrl,
        "google-oauth2",
        "width=620,height=720,scrollbars=yes,resizable=yes,location=yes",
      );

      // 3. Wait for postMessage from the popup or popup close
      return new Promise<void>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          if (event.data === "google-oauth-success") {
            cleanup();
            popup?.close();
            resolve();
          } else if (event.data === "google-oauth-error") {
            cleanup();
            popup?.close();
            reject(new Error("Google OAuth connection failed"));
          }
        };

        // Fallback: detect popup being closed without a postMessage
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            cleanup();
            // Optimistic: trigger a status refetch — if connected, great; if not, no-op
            resolve();
          }
        }, 600);

        const cleanup = () => {
          clearInterval(pollTimer);
          window.removeEventListener("message", messageHandler);
        };

        window.addEventListener("message", messageHandler);

        // Safety timeout: 5 minutes
        setTimeout(
          () => {
            cleanup();
            popup?.close();
            reject(new Error("OAuth connection timed out"));
          },
          5 * 60 * 1000,
        );
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.googleOAuth2.all,
      });
      toast.success("Google Drive connected successfully!");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to connect Google Drive");
    },
  });
}

// ─── Disconnect ───────────────────────────────────────────────────────────────

export function useGoogleDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => googleOAuth2Api.disconnect(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.googleOAuth2.all,
      });
      toast.success("Google Drive disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect Google Drive");
    },
  });
}
