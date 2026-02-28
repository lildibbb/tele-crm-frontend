import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { getDeviceId } from "@/lib/deviceId";
import { friendlyError } from "@/lib/errorMessages";

/** Absolute API base URL for use with EventSource and other non-Axios clients. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// Create a configured Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? "/api/v1"
      : "http://localhost:3001/api/v1"),
  timeout: 15000,
  withCredentials: true, // sends HTTP-Only refresh_token cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach in-memory access token and device ID header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach device ID header for all requests (especially important for refresh requests)
    if (typeof window !== "undefined") {
      try {
        const deviceId = getDeviceId();
        if (deviceId && config.headers) {
          config.headers["X-Device-Id"] = deviceId;
        }
      } catch {
        // proceed without device ID if unavailable
      }

      try {
        // Lazily import to avoid circular deps — authStore is populated after initAuth()
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require("@/store/authStore");
        const token: string | null = useAuthStore.getState().accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // store not yet initialized — proceed without token
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flag to prevent infinite 401 retry loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
}

// Response Interceptor: Silent token refresh on 401
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // Transform error messages to user-friendly text before propagation
    if (error.response?.data?.message && typeof error.response.data.message === 'string') {
      error.response.data.message = friendlyError(error.response.data.message);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh loop for the refresh endpoint itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      // Don't redirect if we're already on a public route
      // This prevents infinite redirect loops on login/forgot-password pages
      if (typeof window !== "undefined") {
        const publicRoutes = [
          "/login",
          "/forgot-password",
          "/reset-password",
          "/setup-account",
        ];
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(
          (route) =>
            currentPath === route || currentPath.startsWith(route + "/"),
        );

        if (!isPublicRoute) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useAuthStore } = require("@/store/authStore");
            useAuthStore.getState().clearAuth();
          } catch {
            /* ignore */
          }
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await apiClient.post<{
        statusCode: number;
        message: string;
        data: { accessToken: string };
      }>("/auth/refresh");

      const newToken = response.data.data.accessToken;

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require("@/store/authStore");
      useAuthStore.getState().setAccessToken(newToken);

      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      originalRequest.headers!.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (typeof window !== "undefined") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { useAuthStore } = require("@/store/authStore");
          useAuthStore.getState().clearAuth();
        } catch {
          /* ignore */
        }
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
