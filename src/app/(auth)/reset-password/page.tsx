"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OTPInput, type SlotProps } from "input-otp";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authApi } from "@/lib/api/auth";

import { cn } from "@/lib/utils";
import { z } from "zod/v4";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

// Password strength rules
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "One special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

// Framer Motion variants for smooth animations
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const stepVariants: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const iconVariants: Variants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// Success page component
function SuccessPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-center"
    >
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center mb-6 relative mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="h-10 w-10 text-success" />
        </motion.div>
        {/* Success ring animation */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-success/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-display font-bold text-2xl text-text-primary mb-2"
      >
        Password Reset Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-sans text-sm text-text-secondary mb-8"
      >
        Your password has been securely updated. You can now sign in with your
        new password.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onGoToLogin}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          Go to Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor:
                step <= currentStep
                  ? "var(--color-crimson)"
                  : "var(--color-border-default)",
              borderColor:
                step <= currentStep
                  ? "var(--color-crimson)"
                  : "var(--color-border-default)",
            }}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
              step <= currentStep ? "text-white" : "text-text-muted",
            )}
          >
            {step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
          </motion.div>
          {step < 2 && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor:
                  step < currentStep
                    ? "var(--color-crimson)"
                    : "var(--color-border-default)",
              }}
              className="w-12 h-0.5 mx-1"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// OTP Slot component (similar to OTP dialog)
function OTPSlot(props: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-12 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold transition-all duration-200",
        {
          "border-crimson ring-2 ring-crimson/30 z-10 shadow-lg shadow-crimson/20":
            props.isActive,
          "border-border-default": !props.isActive,
        },
      )}
    >
      {props.char !== null && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {props.char}
        </motion.span>
      )}
    </div>
  );
}

// Step 1: OTP Verification
function StepOneVerification({
  onNext,
  form,
  submittedEmail,
}: {
  onNext: () => void;
  form: any;
  submittedEmail: string;
}) {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const otpValue = form.watch("code");

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpValue?.length === 4) {
      handleVerify(otpValue);
    }
  }, [otpValue]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  async function handleVerify(code: string) {
    setLoading(true);
    setError(null);

    try {
      // Local validation only for step 1
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (code.length === 4) {
        // Animate to step 2 where actual reset happens
        setTimeout(() => {
          onNext();
        }, 300);
      } else {
        setError("Invalid verification code. Please try again.");
        form.setValue("code", "");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      // Hit the actual API to resend the code
      await authApi.forgotPassword({ email: submittedEmail });
      setResendCountdown(60);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to resend code. Please try again.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Icon */}
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center mb-6"
      >
        <ShieldCheck className="h-8 w-8 text-crimson" />
      </motion.div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
          Verify Your Identity
        </h2>
        <p className="text-text-secondary font-sans text-sm">
          We sent a 4-digit code to your email
        </p>
        <p className="text-crimson font-sans text-sm font-medium mt-1">
          {submittedEmail || "your email"}
        </p>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Input */}
      <div className="flex justify-center mb-6">
        <OTPInput
          id="otp-code"
          ref={inputRef}
          value={form.watch("code") || ""}
          onChange={(value) => form.setValue("code", value)}
          containerClassName="flex items-center gap-2"
          maxLength={4}
          onFocus={() => {
            setError(null);
            form.clearErrors("code");
          }}
          render={({ slots }) => (
            <div className="flex gap-2">
              {slots.map((slot, idx) => (
                <OTPSlot key={idx} {...slot} />
              ))}
            </div>
          )}
        />
      </div>

      {/* Resend */}
      <div className="text-center">
        <p className="text-text-muted text-sm mb-2">Didn't receive the code?</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={resendCountdown > 0 || isResending}
          className="text-crimson hover:text-crimson-hover"
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : resendCountdown > 0 ? (
            `Resend in ${resendCountdown}s`
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Resend Code
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// Step 2: New Password
function StepTwoPassword({
  onSubmit,
  form,
  isSubmitting,
}: {
  onSubmit: (data: any) => void;
  form: any;
  isSubmitting: boolean;
}) {
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const password = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");

  const passScore = PASSWORD_RULES.filter((r) => r.test(password || "")).length;

  const barColor =
    passScore <= 1
      ? "#C4232D"
      : passScore === 2
        ? "#F59E0B"
        : passScore === 3
          ? "#60A5FA"
          : "#22D3A0";

  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Success icon from step 1 */}
      <motion.div
        variants={iconVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center mb-6"
      >
        <CheckCircle2 className="h-8 w-8 text-success" />
      </motion.div>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
          Create New Password
        </h2>
        <p className="text-text-secondary font-sans text-sm">
          Enter a strong password to secure your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="Enter new password"
                      className="pr-10 h-11 focus-visible:ring-crimson/50 focus-visible:border-crimson"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-text-muted hover:text-text-secondary"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>

                {/* Password Strength Meter */}
                {password && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-2"
                  >
                    {/* Strength bar */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="flex-1 h-1.5 rounded-full"
                          initial={{
                            backgroundColor: "var(--color-border-default)",
                          }}
                          animate={{
                            backgroundColor:
                              i <= passScore
                                ? barColor
                                : "var(--color-border-default)",
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      ))}
                    </div>

                    {/* Strength label */}
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs font-medium"
                        style={{ color: barColor }}
                      >
                        {passScore === 1 && "Weak"}
                        {passScore === 2 && "Fair"}
                        {passScore === 3 && "Good"}
                        {passScore === 4 && "Strong"}
                      </span>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {PASSWORD_RULES.map((rule) => (
                        <div
                          key={rule.label}
                          className="flex items-center gap-1.5"
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors",
                              rule.test(password)
                                ? "bg-success"
                                : "bg-border-default",
                            )}
                          />
                          <p
                            className={cn(
                              "text-[10px] font-sans truncate",
                              rule.test(password)
                                ? "text-success"
                                : "text-text-muted",
                            )}
                          >
                            {rule.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="Confirm new password"
                      className={cn(
                        "pr-10 h-11 focus-visible:ring-crimson/50 focus-visible:border-crimson",
                        passwordsMatch &&
                          "border-success focus-visible:ring-success/30",
                      )}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-text-muted hover:text-text-secondary"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-danger mt-1">
                    Passwords do not match
                  </p>
                )}
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !passwordsMatch}
            className="w-full h-12 mt-2 relative overflow-hidden group"
            size="lg"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating Password...
              </>
            ) : (
              <>
                Update Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

// Main component
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";
  const [step, setStep] = useState<1 | 2>(1);
  const [isCompleted, setCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extended schema with confirmPassword for client-side validation
  const formWithConfirmSchema = z
    .object({
      email: z.string().email("Please enter a valid email address"),
      code: z.string().length(4, "Code must be exactly 4 digits"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formWithConfirmSchema>>({
    resolver: standardSchemaResolver(formWithConfirmSchema),
    defaultValues: {
      email: emailFromUrl,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle final submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Call the actual API
      await authApi.resetPassword({
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });

      // Show success
      setCompleted(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to reset password. Please try again.";
      form.setError("root", { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleNextStep = () => {
    setStep(2);
  };

  // Success state
  if (isCompleted) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center p-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.08]"
            style={{
              background:
                "radial-gradient(circle, #22D3A0 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.06, 0.1, 0.06],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="w-full max-w-sm">
          <div className="surface-card relative overflow-hidden p-8 shadow-sm rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm">
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
            <SuccessPage onGoToLogin={handleGoToLogin} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-void flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #C4232D 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.04, 0.08, 0.04],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm"
        >
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
          {/* Logo/Brand */}
          <div className="text-center mb-6">
            <LockKeyhole className="h-6 w-6 text-crimson mx-auto mb-4" />
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={step} />

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <StepOneVerification
                key="step1"
                onNext={handleNextStep}
                form={form}
                submittedEmail={emailFromUrl}
              />
            ) : (
              <StepTwoPassword
                key="step2"
                onSubmit={onSubmit}
                form={form}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>

          {/* Back to login link */}
          <div className="text-center mt-6 pt-4 border-t border-border-subtle">
            <p className="text-text-muted text-sm">
              Remember your password?{" "}
              <a
                href="/login"
                className="text-crimson hover:text-crimson-hover font-medium transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
