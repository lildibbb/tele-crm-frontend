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
          <p className="text-text-secondary text-sm font-sans">Verifying your invitation…</p>
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
    <div className="min-h-svh bg-void flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, #E8B94F 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-sm animate-in-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
            TITAN <span className="text-crimson">JOURNAL</span>
          </h1>
          <p className="text-text-secondary text-xs font-sans mt-1">Account Setup</p>
        </div>

        <div className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-sm">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />

          {/* Identity badge */}
          {invitationInfo && (
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
                      <div className="space-y-1.5 pt-1">
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
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[11px] font-sans font-medium transition-colors duration-300",
                              strengthScore === 1 && "text-danger",
                              strengthScore === 2 && "text-amber-400",
                              strengthScore === 3 && "text-blue-400",
                              strengthScore === 4 && "text-success",
                            )}
                          >
                            {STRENGTH_LABELS[strengthScore]}
                          </span>
                          <div className="flex gap-3">
                            {PASSWORD_RULES.map((rule) => (
                              <span
                                key={rule.label}
                                className={cn(
                                  "text-[10px] font-sans transition-colors duration-200",
                                  rule.test(password) ? "text-success" : "text-text-muted",
                                )}
                              >
                                {rule.test(password) ? "✓" : "·"} {rule.label}
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
