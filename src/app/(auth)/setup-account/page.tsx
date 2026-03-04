"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Shield,
  UserIcon,
} from "lucide-react";
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
import {
  SetupAccountSchema,
  type SetupAccountInput,
} from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

const STEPS = ["Your Info", "Set Password", "Complete"] as const;

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData?: string } };
  }
}

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken } = useAuthStore();

  const invitationToken = searchParams.get("token") ?? "";
  const emailFromUrl = searchParams.get("email") ?? "";

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [showPass, setShowPass] = useState(false);

  const form = useForm<SetupAccountInput>({
    resolver: standardSchemaResolver(SetupAccountSchema),
    defaultValues: {
      invitationToken,
      initData: "",
      email: emailFromUrl,
      password: "",
      deviceId: "",
      userAgent: "",
    },
  });

  // Populate Telegram initData once component mounts (client only)
  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData ?? "";
    form.setValue("initData", initData);

    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      form.setValue("deviceId", crypto.randomUUID());
    } else {
      form.setValue("deviceId", Math.random().toString(36).substring(2, 15));
    }

    if (typeof navigator !== "undefined") {
      form.setValue("userAgent", navigator.userAgent);
    }
  }, [form]);

  const email = form.watch("email");
  const password = form.watch("password");

  const onSubmit = async (data: SetupAccountInput) => {
    try {
      const res = await authApi.setupAccount(data);
      setAccessToken(res.data.data.accessToken);
      setStep(2);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Setup failed. Please check your invitation link.";
      form.setError("root", { message });
    }
  };

  return (
    <div className="min-h-svh bg-void flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, #E8B94F 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="w-full max-w-sm animate-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
            TITAN <span className="text-crimson">JOURNAL</span>
          </h1>
          <p className="text-text-secondary text-xs font-sans mt-1">
            Account Setup
          </p>
        </div>

        <div className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />
          {/* Stepper */}
          <div className="flex items-center gap-2 mb-7">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                {i > 0 && (
                  <div
                    className={`h-px flex-1 ${i <= step ? "bg-crimson" : "bg-border-subtle"}`}
                  />
                )}
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-colors ${i < step ? "bg-success text-[#0D3D2B]" : i === step ? "bg-crimson text-white" : "bg-elevated text-text-muted border border-border-default"}`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Missing token warning */}
          {!invitationToken && step < 2 && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
              No invitation token found. Please use the link from your
              invitation email.
            </div>
          )}

          {/* Invite badge */}
          {step < 2 && emailFromUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border-subtle mb-6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-crimson/20 border border-crimson/30 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-crimson" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-sans font-medium text-text-secondary">
                  Invited as
                </p>
                <p className="text-[13px] font-mono text-text-primary truncate">
                  {emailFromUrl}
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Root error */}
              {form.formState.errors.root && (
                <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Step 0: Info */}
              {step === 0 && (
                <>
                  <div className="mb-5">
                    <h2 className="font-display font-bold text-xl text-text-primary">
                      Your Information
                    </h2>
                    <p className="font-sans text-sm text-text-secondary mt-1">
                      Confirm your email to continue
                    </p>
                  </div>
                  <div className="space-y-4">
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
                              placeholder="your@email.com"
                              readOnly={!!emailFromUrl}
                              className={`focus-visible:ring-crimson/50 focus-visible:border-crimson ${emailFromUrl ? "opacity-70" : ""}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      if (email) setStep(1);
                    }}
                    disabled={!email || !invitationToken}
                    className="w-full mt-6 relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    Continue →
                  </Button>
                </>
              )}

              {/* Step 1: Password */}
              {step === 1 && (
                <>
                  <div className="mb-5">
                    <h2 className="font-display font-bold text-xl text-text-primary">
                      Set Your Password
                    </h2>
                    <p className="font-sans text-sm text-text-secondary mt-1">
                      Choose a strong, unique password (min. 8 characters)
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPass ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pr-10 focus-visible:ring-crimson/50 focus-visible:border-crimson"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-text-muted hover:text-text-secondary"
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      size="lg"
                      className="flex-shrink-0"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        form.formState.isSubmitting || password.length < 8
                      }
                      className="flex-1 relative overflow-hidden group"
                      size="lg"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Setting
                          up…
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </Form>

          {/* Step 2: Complete */}
          {step === 2 && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                You&apos;re all set!
              </h2>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mb-2">
                Welcome to Titan Journal CRM.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-sans text-text-secondary mb-6">
                <UserIcon className="h-3 w-3" />
                <span className="data-mono">{emailFromUrl || email}</span>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="w-full relative overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                Go to Command Center →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetupAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-void flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      }
    >
      <SetupAccountContent />
    </Suspense>
  );
}
