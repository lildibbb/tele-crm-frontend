import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PasswordResetState {
  // Flow state
  step: 1 | 2;
  
  // User data
  email: string;
  otp: string;
  
  // Forgot password flow state
  isEmailSent: boolean;
  submittedEmail: string;
  
  // Loading & error states
  isLoading: boolean;
  error: string | null;
  
  // Verification state
  isVerified: boolean;
  isCompleted: boolean;
}

interface PasswordResetActions {
  // Step management
  setStep: (step: 1 | 2) => void;
  
  // Email management
  setEmail: (email: string) => void;
  setSubmittedEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  
  // Forgot password flow
  setEmailSent: (sent: boolean) => void;
  
  // Verification
  setVerified: (verified: boolean) => void;
  
  // Loading & error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Completion
  setCompleted: (completed: boolean) => void;
  
  // Reset
  reset: () => void;
  resetForgotPassword: () => void;
}

const initialState: PasswordResetState = {
  step: 1,
  email: "",
  otp: "",
  isEmailSent: false,
  submittedEmail: "",
  isLoading: false,
  error: null,
  isVerified: false,
  isCompleted: false,
};

export const usePasswordResetStore = create<PasswordResetState & PasswordResetActions>()(
  devtools(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }, false, "setStep"),

      setEmail: (email) => set({ email }, false, "setEmail"),

      setSubmittedEmail: (submittedEmail) => set({ submittedEmail }, false, "setSubmittedEmail"),

      setOtp: (otp) => set({ otp }, false, "setOtp"),

      setEmailSent: (isEmailSent) => set({ isEmailSent }, false, "setEmailSent"),

      setVerified: (isVerified) => set({ isVerified }, false, "setVerified"),

      setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

      setError: (error) => set({ error }, false, "setError"),

      setCompleted: (isCompleted) => set({ isCompleted }, false, "setCompleted"),

      reset: () => set(initialState, false, "reset"),

      // Reset only forgot-password flow (keep email for reset page)
      resetForgotPassword: () => set({
        isEmailSent: false,
        isLoading: false,
        error: null,
      }, false, "resetForgotPassword"),
    }),
    { name: "password-reset-store" },
  ),
);
