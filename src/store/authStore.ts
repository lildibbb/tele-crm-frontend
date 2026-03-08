import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";
import type { UserResponse } from "@/lib/schemas/user.schema";
import type { LoginInput } from "@/lib/schemas/auth.schema";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  /** false until the initial refresh check on app boot completes */
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  /** Called on app boot — attempts silent refresh via HTTP-Only cookie */
  initAuth: () => Promise<void>;
  /** Skip auth check - used for public routes that don't require authentication */
  skipAuthCheck: () => void;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isInitialized: false,
        isLoading: false,
        error: null,

        initAuth: async () => {
          // Skip if already initialized or if we're on a public route
          // This prevents unnecessary API calls on login/forgot-password pages
          const { isInitialized } = useAuthStore.getState();
          if (isInitialized) return;

          set({ isLoading: true, error: null }, false, "initAuth/pending");
          try {
            const { accessToken } = useAuthStore.getState();
            let currentToken = accessToken;

            // If no token in localStorage, attempt to get one via HTTP-Only refresh cookie
            if (!currentToken) {
              const refreshRes = await authApi.refresh();
              currentToken = refreshRes.data.data.accessToken;
              // Set it immediately so apiClient can use it for getMe
              set({ accessToken: currentToken }, false, "initAuth/setToken");
            }

            // Fetch user data (interceptor will auto-refresh if token is expired)
            const meRes = await usersApi.getMe();
            set(
              {
                accessToken: currentToken,
                user: meRes.data.data,
                isInitialized: true,
                isLoading: false,
              },
              false,
              "initAuth/success",
            );
          } catch (err: unknown) {
            // No valid cookie — user is not authenticated; this is normal
            // Don't log error for 401 (no refresh token) as it's expected for unauthenticated users
            const status = (err as { response?: { status?: number } })?.response
              ?.status;
            if (status !== 401) {
              console.warn(
                "initAuth: Unexpected error during token refresh",
                err,
              );
            }

            set(
              {
                user: null,
                accessToken: null,
                isInitialized: true,
                isLoading: false,
              },
              false,
              "initAuth/unauthenticated",
            );
          }
        },

        skipAuthCheck: () => {
          // Mark as initialized without making any API calls
          // Used for public routes that don't require authentication
          set(
            { isInitialized: true, isLoading: false },
            false,
            "skipAuthCheck",
          );
        },

        login: async (data: LoginInput) => {
          set({ isLoading: true, error: null }, false, "login/pending");
          try {
            const res = await authApi.login(data);
            set(
              {
                accessToken: res.data.data.accessToken,
                user: res.data.data.user as UserResponse,
                isLoading: false,
                error: null,
              },
              false,
              "login/success",
            );
          } catch (err: unknown) {
            const message =
              (err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Login failed. Please try again.";
            set({ isLoading: false, error: message }, false, "login/error");
            throw err; // re-throw so form can handle it
          }
        },

        logout: async () => {
          set({ isLoading: true }, false, "logout/pending");
          try {
            await authApi.logout();
          } catch {
            // ignore logout errors — clear state regardless
          } finally {
            set(
              { user: null, accessToken: null, isLoading: false, error: null },
              false,
              "logout/done",
            );
          }
        },

        setAccessToken: (token: string) =>
          set({ accessToken: token }, false, "setAccessToken"),

        clearAuth: () =>
          set(
            { user: null, accessToken: null, isInitialized: true, error: null },
            false,
            "clearAuth",
          ),
      }),
      {
        name: "auth-store",
        partialize: (state: AuthState & AuthActions) => ({
          accessToken: state.accessToken,
          user: state.user,
        }),
      },
    ),
    { name: "auth-store" },
  ),
);
