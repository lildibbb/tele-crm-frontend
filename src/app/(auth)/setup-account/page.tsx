"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  SetupAccountSchema,
  type SetupAccountInput,
  type InvitationInfo,
} from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";

// ── Password strength ──────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const STRENGTH_COLORS = ["", "bg-danger", "bg-amber-400", "bg-blue-400", "bg-success"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Owner",
  ADMIN: "Administrator",
  STAFF: "Staff",
};

declare global {
  interface Window {
    Telegram?: { WebApp?: { initData?: string } };
  }
}

// ── Main content ───────────────────────────────────────────────────────────────

function SetupAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAccessToken } = useAuthStore();

  const invitationToken = searchParams.get("token") ?? "";

  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [done, setDone] = useState(false);
  const [doneEmail, setDoneEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!invitationToken) {
      setInfoLoading(false);
      setInfoError("No invitation token found in the URL.");
      return;
    }
    authApi
      .getInvitationInfo(invitationToken)
      .then((res) => {
        setInvitationInfo(res.data.data);
      })
      .catch(() => {
        setInfoError("This invitation link is invalid, expired, or has already been used.");
      })
      .finally(() => setInfoLoading(false));
  }, [invitationToken]);

  const form = useForm<SetupAccountInput>({
    resolver: standardSchemaResolver(SetupAccountSchema),
    defaultValues: {
      invitationToken,
      initData: "",
      password: "",
      confirmPassword: "",
      deviceId: "",
      userAgent: "",
    },
  });

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
  const confirmPassword = form.watch("confirmPassword");

  const strengthScore = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(password)).length,
    [password],
  );

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const onSubmit = async (data: SetupAccountInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _confirm, ...payload } = data;
    try {
      const res = await authApi.setupAccount(payload as SetupAccountInput);
      setAccessToken(res.data.data.accessToken);
      setDoneEmail(res.data.data.user.email);
      setDone(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Setup failed. Please check your invitation link.";
      form.setError("root", { message });
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (infoLoading) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-crimson mx-auto" />
          <p className="text-text-secondary text-sm font-sans tracking-wide">Verifying your invitation…</p>
        </div>
      </div>
    );
  }

  // ── Invalid invitation ─────────────────────────────────────────────────────
  if (infoError) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm surface-card relative p-8 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 text-center space-y-4">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-danger/30 to-transparent" />
          <Shield className="h-10 w-10 text-danger mx-auto" />
          <h2 className="font-display font-bold text-xl text-text-primary">Invalid Invitation</h2>
          <p className="font-sans text-sm text-text-secondary leading-relaxed">{infoError}</p>
          <p className="font-sans text-xs text-text-muted">
            Please contact your administrator to receive a new invitation link.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-svh bg-void flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
          />
        </div>
        <div className="w-full max-w-sm animate-in-up">
          <div className="text-center mb-6">
            <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
              TITAN <span className="text-crimson">JOURNAL</span>
            </h1>
          </div>
          <div className="surface-card relative overflow-hidden p-8 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm text-center">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-success/40 to-transparent" />
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
              You&apos;re all set!
            </h2>
            <p className="font-sans text-sm text-text-secondary leading-relaxed mb-2">
              Welcome to Titan Journal CRM. Your account is ready.
            </p>
            {doneEmail && (
              <div className="flex items-center justify-center gap-2 text-xs font-sans text-text-secondary mb-6">
                <UserIcon className="h-3 w-3" />
                <span className="font-mono">{doneEmail}</span>
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
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-svh bg-void flex items-center justify-center p-4 sm:p-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #C4232D 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-sm sm:max-w-md animate-in-up relative">
        {/* Wordmark */}
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
            TITAN <span className="text-crimson">JOURNAL</span>
          </h1>
          <p className="text-text-muted text-xs font-sans mt-1 tracking-widest uppercase">Account Setup</p>
        </div>

        <div className="surface-card relative overflow-hidden p-6 sm:p-8 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />

          {/* Identity header — replaces old bordered box */}
          {invitationInfo && (
            <div className="text-center mb-7">
              {/* Avatar circle */}
              <div className="relative inline-flex mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crimson/20 to-crimson/5 border border-crimson/25 flex items-center justify-center shadow-[0_0_20px_var(--crimson-glow)]">
                  <span className="text-xl font-display font-bold text-crimson select-none">
                    {(invitationInfo.email?.[0] ?? "?").toUpperCase()}
                  </span>
                </div>
                {/* Verified tick */}
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-background border border-border-subtle flex items-center justify-center">
                  <BadgeCheck className="h-3.5 w-3.5 text-crimson" />
                </div>
              </div>

              {/* Email */}
              {invitationInfo.email && (
                <p className="font-mono text-sm text-text-primary font-medium truncate max-w-full px-4">
                  {invitationInfo.email}
                </p>
              )}

              {/* Role pill */}
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-crimson/8 border border-crimson/20">
                <div className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                <span className="text-[11px] font-sans font-semibold text-crimson uppercase tracking-widest">
                  {ROLE_LABELS[invitationInfo.role] ?? invitationInfo.role}
                </span>
              </div>
            </div>
          )}

          {/* Section heading */}
          <div className="mb-5">
            <h2 className="font-display font-bold text-xl text-text-primary">Set Your Password</h2>
            <p className="font-sans text-sm text-text-secondary mt-1">
              Choose a strong password to secure your account.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
                  {form.formState.errors.root.message}
                </div>
              )}

              {/* Password */}
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
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                          onClick={() => setShowPass(!showPass)}
                          tabIndex={-1}
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>

                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-300",
                                strengthScore >= seg
                                  ? STRENGTH_COLORS[strengthScore]
                                  : "bg-elevated",
                              )}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "text-[11px] font-sans font-semibold transition-colors duration-300 shrink-0",
                              strengthScore === 1 && "text-danger",
                              strengthScore === 2 && "text-amber-400",
                              strengthScore === 3 && "text-blue-400",
                              strengthScore === 4 && "text-success",
                            )}
                          >
                            {STRENGTH_LABELS[strengthScore]}
                          </span>
                          {/* 2×2 grid so rules never overflow on mobile */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                            {PASSWORD_RULES.map((rule) => (
                              <span
                                key={rule.label}
                                className={cn(
                                  "text-[10px] font-sans transition-colors duration-200 flex items-center gap-0.5",
                                  rule.test(password) ? "text-success" : "text-text-muted",
                                )}
                              >
                                <span className="text-[9px]">{rule.test(password) ? "✓" : "·"}</span>
                                {rule.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
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
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter your password"
                          className={cn(
                            "pr-10 transition-colors duration-200 focus-visible:ring-crimson/50 focus-visible:border-crimson",
                            passwordsMatch && "border-success focus-visible:border-success focus-visible:ring-success/30",
                          )}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                          onClick={() => setShowConfirm(!showConfirm)}
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    {passwordsMatch && (
                      <p className="text-[11px] text-success font-sans flex items-center gap-1 pt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || password.length < 8}
                className="w-full mt-2 relative overflow-hidden group"
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
            </form>
          </Form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] font-sans text-text-muted mt-5 tracking-wide">
          By completing setup you agree to our{" "}
          <span className="text-text-secondary underline underline-offset-2 cursor-pointer hover:text-text-primary transition-colors">
            Terms of Service
          </span>
        </p>
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
