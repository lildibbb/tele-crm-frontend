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
  BadgeCheck,
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
  type InvitationInfo,
} from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

/** Human-readable role labels */
const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Owner",
  ADMIN: "Administrator",
  STAFF: "Staff",
};

const STEPS = ["Set Password", "Complete"] as const;

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

  // Invitation info fetched from backend before rendering the form
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(
    null,
  );
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [step, setStep] = useState<0 | 1>(0);
  const [showPass, setShowPass] = useState(false);
  // Resolved email — either from invitation (locked) or user input (open invite)
  const [resolvedEmail, setResolvedEmail] = useState("");

  // Fetch invitation metadata on mount — determines whether email field is shown
  useEffect(() => {
    if (!invitationToken) {
      setInfoLoading(false);
      setInfoError("No invitation token found in the URL.");
      return;
    }
    authApi
      .getInvitationInfo(invitationToken)
      .then((res) => {
        const info = res.data.data;
        setInvitationInfo(info);
        if (info.email) {
          // Pre-fill the resolved email; user will never see or edit this field
          setResolvedEmail(info.email);
        }
      })
      .catch(() => {
        setInfoError(
          "This invitation link is invalid, expired, or has already been used.",
        );
      })
      .finally(() => setInfoLoading(false));
  }, [invitationToken]);

  const form = useForm<SetupAccountInput>({
    resolver: standardSchemaResolver(SetupAccountSchema),
    defaultValues: {
      invitationToken,
      initData: "",
      email: undefined,
      password: "",
      deviceId: "",
      userAgent: "",
    },
  });

  // Populate device metadata once component mounts (client only)
  useEffect(() => {
    form.setValue("initData", window.Telegram?.WebApp?.initData ?? "");
    form.setValue(
      "deviceId",
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15),
    );
    form.setValue("userAgent", navigator.userAgent);
  }, [form]);

  const password = form.watch("password");

  const onSubmit = async (data: SetupAccountInput) => {
    // If the invitation pre-fills the email, strip dto.email entirely —
    // the backend uses invitation.email authoritatively in that case.
    const payload: SetupAccountInput = invitationInfo?.email
      ? { ...data, email: undefined }
      : data;

    try {
      const res = await authApi.setupAccount(payload);
      setAccessToken(res.data.data.accessToken);
      setResolvedEmail(res.data.data.user.email);
      setStep(1);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Setup failed. Please check your invitation link.";
      form.setError("root", { message });
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (infoLoading) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-crimson mx-auto" />
          <p className="text-text-secondary text-sm font-sans">
            Verifying your invitation…
          </p>
        </div>
      </div>
    );
  }

  // ── Invalid invitation ─────────────────────────────────────────────────────
  if (infoError) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center p-6">
        <div className="w-full max-w-sm surface-card p-8 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto">
            <Shield className="h-6 w-6 text-danger" />
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary">
            Invalid Invitation
          </h2>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">
            {infoError}
          </p>
          <p className="font-sans text-xs text-text-muted">
            Please contact your administrator to receive a new invitation link.
          </p>
        </div>
      </div>
    );
  }

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

          {/* Invitation identity badge — always visible on step 0 */}
          {step === 0 && invitationInfo && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border-subtle mb-6 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-crimson/20 border border-crimson/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BadgeCheck className="h-4 w-4 text-crimson" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-sans font-medium text-text-secondary">
                  Invitation verified · Role:{" "}
                  <span className="text-text-primary font-semibold">
                    {ROLE_LABELS[invitationInfo.role] ?? invitationInfo.role}
                  </span>
                </p>
                {invitationInfo.email && (
                  <p className="text-[13px] font-mono text-text-primary truncate">
                    {invitationInfo.email}
                  </p>
                )}
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

              {/* Step 0: Password (only step for pre-filled email invitations) */}
              {step === 0 && (
                <>
                  <div className="mb-5">
                    <h2 className="font-display font-bold text-xl text-text-primary">
                      Set Your Password
                    </h2>
                    <p className="font-sans text-sm text-text-secondary mt-1">
                      {invitationInfo?.email
                        ? "Your email is pre-confirmed. Choose a strong password to complete setup."
                        : "Enter your email and choose a strong password."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Email field — only shown for open invitations (no pre-filled email) */}
                    {!invitationInfo?.email && (
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
                                className="focus-visible:ring-crimson/50 focus-visible:border-crimson"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    )}

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
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      form.formState.isSubmitting ||
                      password.length < 8 ||
                      (!invitationInfo?.email && !form.watch("email"))
                    }
                    className="w-full mt-6 relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Setting up…
                      </>
                    ) : (
                      "Complete Setup →"
                    )}
                  </Button>
                </>
              )}
            </form>
          </Form>

          {/* Step 1: Complete */}
          {step === 1 && (
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
              {resolvedEmail && (
                <div className="flex items-center justify-center gap-2 text-xs font-sans text-text-secondary mb-6">
                  <UserIcon className="h-3 w-3" />
                  <span className="font-mono">{resolvedEmail}</span>
                </div>
              )}
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

