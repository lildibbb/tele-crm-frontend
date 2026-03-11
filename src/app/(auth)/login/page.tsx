"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";
import { getDeviceId, getUserAgent } from "@/lib/deviceId";
import { TitanLogo } from "@/components/ui/titan-logo";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [isAuthenticatingTma, setIsAuthenticatingTma] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.location.hash.includes("tgWebApp") ||
        window.location.search.includes("tgWebApp")
      );
    }
    return false;
  });

  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      initData: "",
      deviceId: "",
      userAgent: "",
    },
  });

  // Attempt TMA Auto-Login on mount with polling (Desktop TMA can be slow to init)
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds total

    const checkInitData = () => {
      const initData = window.Telegram?.WebApp?.initData;

      if (initData) {
        const deviceId = getDeviceId();
        const userAgent = getUserAgent();

        form.setValue("initData", initData);
        form.setValue("deviceId", deviceId);
        form.setValue("userAgent", userAgent);

        login({ initData, deviceId, userAgent })
          .then(() => {
            router.push("/");
          })
          .catch((err) => {
            if (err?.code === "TELEGRAM_NOT_LINKED") {
              setIsLinkingMode(true);
            }
            setIsAuthenticatingTma(false);
          });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkInitData, 100);
      } else {
        setIsAuthenticatingTma(false);
      }
    };

    checkInitData();
  }, [login, router, form]);

  const onSubmit = async (data: LoginInput) => {
    try {
      const loginData: LoginInput = {
        ...data,
        deviceId: data.deviceId || getDeviceId(),
        userAgent: data.userAgent || getUserAgent(),
      };
      await login(loginData);
      router.push("/");
    } catch {
      // error is set in store
    }
  };

  return (
    <div className="flex min-h-svh bg-void relative overflow-hidden">
      {/* SVG clip-path definition — wavy right edge (objectBoundingBox = 0–1 relative to element) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="login-left-wave" clipPathUnits="objectBoundingBox">
            {/* Wave: right edge oscillates between x=0.88 (dip) and x=1.0 (peak), 2 S-curves */}
            <path d="M0,0 L0.94,0 C1,0.15 0.88,0.35 0.94,0.5 C1,0.65 0.88,0.85 0.94,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* ── LEFT PANEL (desktop only) ──────────────────────────────── */}
      {/* clip-path carves the wavy right edge — panel's own bg, glows & dot-grid form the wave */}
      <div
        className="hidden lg:flex lg:w-[52%] relative flex-col p-14 bg-[#0D0F14] dark:bg-[#16171a]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          clipPath: "url(#login-left-wave)",
        }}
      >
        {/* Crimson glows — vivid on dark panel */}
        <div
          className="absolute -bottom-48 -left-24 w-[640px] h-[640px] rounded-full bg-crimson/30 blur-[180px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-40 right-8 w-[400px] h-[400px] rounded-full bg-crimson/12 blur-[130px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 w-[200px] h-[200px] rounded-full bg-crimson/8 blur-[80px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Logo — inverted to white for dark panel */}
        <div className="relative z-10 animate-in fade-in slide-in-from-left-6 duration-700">
          <TitanLogo
            variant="full"
            size="md"
            priority
            className="brightness-0 invert"
          />
        </div>

        {/* Editorial headline — vertically centered */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="max-w-[320px] animate-in fade-in slide-in-from-left-6 duration-700 delay-100 fill-mode-both">
            <h1 className="font-display font-bold text-white tracking-tight leading-[1.05] text-[2.75rem] xl:text-[3.25rem]">
              Command
              <br />
              Center.
            </h1>

            {/* Crimson accent rule */}
            <div className="w-9 h-[2.5px] bg-crimson mt-5 mb-6 rounded-full" />

            {/* Value props */}
            <div className="space-y-[10px]">
              {[
                "Lead intelligence",
                "Conversation automation",
                "Funnel control",
              ].map((line) => (
                <p
                  key={line}
                  className="font-sans text-[13px] text-white/45 tracking-wide"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stamp */}
        <div className="relative z-10 animate-in fade-in duration-700 delay-300 fill-mode-both">
          <p className="font-mono text-[10px] text-white/25 tracking-widest uppercase">
            IB Funnel Intelligence Platform
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — auth form ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10 bg-void relative">
        {/* Mobile ambient glow */}
        <div
          className="absolute top-0 right-0 w-[280px] h-[280px] rounded-full bg-crimson/6 blur-[100px] pointer-events-none lg:hidden"
          aria-hidden="true"
        />

        <div className="w-full max-w-[360px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <TitanLogo variant="full" size="lg" priority />
          </div>

          {/* ── TMA Authenticating state ──────────────────────────── */}
          {isAuthenticatingTma ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 rounded-full bg-[#2AABEE]/10 border border-[#2AABEE]/25 flex items-center justify-center mb-5 relative">
                <div className="absolute inset-0 rounded-full border border-[#2AABEE]/20 animate-ping opacity-20" />
                <Send className="h-5 w-5 text-[#2AABEE] relative z-10 ml-[2px]" />
              </div>
              <h2 className="font-display font-bold text-lg text-text-primary mb-1.5">
                Authorising with Telegram
              </h2>
              <div className="flex items-center gap-2 text-text-muted font-sans text-sm mt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-crimson" />
                <span>Establishing secure connection&hellip;</span>
              </div>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="mb-7">
                <h2 className="font-display font-bold text-[1.6rem] text-text-primary tracking-tight leading-tight">
                  {isLinkingMode ? "Link your account" : "Welcome back"}
                </h2>
                <p className="text-text-muted font-sans text-[13px] mt-1.5 leading-relaxed">
                  {isLinkingMode
                    ? "Sign in with your credentials to link Telegram."
                    : "Sign in to your workspace."}
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-5 px-3.5 py-2.5 rounded-lg bg-danger/8 border border-danger/25 text-danger text-xs font-sans leading-relaxed">
                  {error}
                </div>
              )}

              {/* ── Form — no labels ─────────────────────────────── */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-3"
                >
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            autoComplete="email"
                            placeholder="Work email"
                            {...field}
                            className="h-11 text-sm bg-white dark:bg-base/60 border-border-default/80 focus-visible:ring-crimson/40 focus-visible:border-crimson transition-colors shadow-none"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPass ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder="Password"
                              className="h-11 pr-10 text-sm bg-white dark:bg-base/60 border-border-default/80 focus-visible:ring-crimson/40 focus-visible:border-crimson transition-colors shadow-none"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                              aria-label={
                                showPass ? "Hide password" : "Show password"
                              }
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

                  {/* Forgot password — right-aligned, below inputs */}
                  <div className="flex justify-end pt-0.5">
                    <a
                      href="/forgot-password"
                      className="text-[12px] text-crimson hover:text-crimson-hover font-medium transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 mt-1 font-semibold tracking-wide transition-all hover:shadow-[0_0_24px_rgba(196,35,45,0.25)] hover:-translate-y-px active:translate-y-0 relative overflow-hidden group"
                    size="lg"
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in&hellip;
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-[11px] text-text-muted/70 font-sans mt-7 leading-relaxed">
                Need access?&ensp;Contact your administrator.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
