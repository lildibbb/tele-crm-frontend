"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

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

// Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const iconVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { ease: "easeOut", duration: 0.2 },
  },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isEmailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(data);
      // Store the email for use in reset-password page
      setSubmittedEmail(data.email);
      setEmailSent(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to send reset code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/reset-password?email=${encodeURIComponent(submittedEmail ?? "")}`);
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    
    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword({ email: submittedEmail });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to resend code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-void flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #C4232D 0%, transparent 70%)" }}
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
          {/* Back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-sans transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>

          <AnimatePresence mode="wait">
            {isEmailSent ? (
              /* SUCCESS STATE */
              <motion.div
                key="success"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Success Icon */}
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  className="flex justify-center mb-6 relative"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, ease: "easeOut", duration: 0.2 }}
                  >
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </motion.div>
                  {/* Success ring — CSS pulse, no JS loop */}
                  <div className="absolute w-14 h-14 rounded-full border-2 border-success/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </motion.div>

                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                    Check your inbox
                  </h2>
                  <p className="font-sans text-sm text-text-secondary leading-relaxed">
                    We sent a 4-digit reset code to{" "}
                    <span className="text-text-primary font-medium">{submittedEmail}</span>
                  </p>
                  <p className="font-sans text-xs text-text-muted mt-2">
                    The code expires in 15 minutes.
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

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    Continue to Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Resend Code"
                    )}
                  </Button>
                </div>

                {/* Help text */}
                <p className="text-center text-xs text-text-muted mt-6">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-crimson hover:underline disabled:opacity-50"
                  >
                    try another email
                  </button>
                </p>
              </motion.div>
            ) : (
              /* FORM STATE */
              <motion.div
                key="form"
                variants={pageVariants}
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
                  <Mail className="h-8 w-8 text-crimson" />
                </motion.div>

                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                    Forgot password?
                  </h2>
                  <p className="font-sans text-sm text-text-secondary">
                    Enter your email and we'll send a 4-digit reset code.
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

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="owner@titanjournal.com"
                              className="h-11 focus-visible:ring-crimson/50 focus-visible:border-crimson"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 mt-2 relative overflow-hidden group"
                      size="lg"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Reset Code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Footer */}
                <p className="text-center text-xs text-text-muted mt-6">
                  Remember your password?{" "}
                  <Link href="/login" className="text-crimson hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
