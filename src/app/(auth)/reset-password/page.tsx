"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import { ResetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";

const RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: standardSchemaResolver(ResetPasswordSchema),
    defaultValues: { email: "", code: "", newPassword: "" },
  });

  const password = form.watch("newPassword");
  const passScore = RULES.filter((r) => r.test(password)).length;
  const barColor =
    passScore <= 1 ? "#C4232D" : passScore === 2 ? "#F59E0B" : passScore === 3 ? "#60A5FA" : "#22D3A0";

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await authApi.resetPassword(data);
      setDone(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to reset password. The code may be invalid or expired.";
      form.setError("root", { message });
    }
  };

  if (done)
    return (
      <div className="min-h-svh bg-void flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-in-up surface-card p-7 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-success" />
          </div>
          <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
            Password Reset
          </h2>
          <p className="font-sans text-sm text-text-secondary mb-6">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full" size="lg">
            Go to Sign In
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-svh bg-void flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #C4232D 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-sm animate-in-up">
        <div className="surface-card p-7 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center mb-4">
              <LockKeyhole className="h-4 w-4 text-crimson" />
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary">
              Set new password
            </h2>
            <p className="text-text-secondary font-sans text-sm mt-1">
              Enter the 4-digit code from your email and choose a strong password
            </p>
          </div>

          <div className="h-px bg-border-subtle mb-6" />

          {/* Root error */}
          {form.formState.errors.root && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
              {form.formState.errors.root.message}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-text-secondary">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="owner@titanjournal.com" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* OTP Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-text-secondary">
                      Reset Code (4 digits)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="1234"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-text-secondary">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPass ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-muted hover:text-text-secondary"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-1 rounded-full transition-colors"
                              style={{ background: i <= passScore ? barColor : "var(--color-border-default)" }}
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {RULES.map((rule) => (
                            <div key={rule.label} className="flex items-center gap-1.5">
                              <div
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${rule.test(password) ? "bg-success" : "bg-border-default"}`}
                              />
                              <p className={`text-[11px] font-sans ${rule.test(password) ? "text-success" : "text-text-muted"}`}>
                                {rule.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full mt-2"
                size="lg"
              >
                {form.formState.isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
