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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";
import { getDeviceId, getUserAgent } from "@/lib/deviceId";

/* ── Brand mark ───────────────────────────────────────────── */
function TitanMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Top bar — full width */}
      <rect x="2" y="3" width="20" height="3.5" rx="1.75" fill="currentColor" />
      {/* Vertical stem — left aligned */}
      <rect x="2" y="3" width="3.5" height="18" rx="1.75" fill="currentColor" />
      {/* Bottom accent — right offset */}
      <rect x="9" y="17.5" width="13" height="3.5" rx="1.75" fill="currentColor" />
    </svg>
  );
}

/* ── Signal Network ───────────────────────────────────────── */
function SignalNetwork() {
  // 25 nodes: [cx, cy] in a 100×100 viewBox
  const nodes: [number, number][] = [
    [8, 12], [22, 8], [38, 15], [55, 6], [72, 18], [90, 9],
    [14, 28], [32, 35], [50, 25], [66, 32], [84, 24],
    [5, 47], [20, 54], [36, 45], [52, 52], [68, 44], [86, 50],
    [11, 68], [28, 75], [44, 65], [61, 72], [79, 62],
    [17, 88], [40, 82], [63, 90],
  ];

  const edges: [number, number][] = [
    [0,1],[1,2],[2,3],[3,4],[4,5],
    [0,6],[1,6],[2,7],[3,8],[4,9],[5,10],
    [6,7],[7,8],[8,9],[9,10],
    [6,11],[7,12],[8,13],[9,14],[10,15],[10,16],
    [11,12],[12,13],[13,14],[14,15],[15,16],
    [12,17],[13,18],[14,19],[15,20],[16,21],
    [17,18],[18,19],[19,20],[20,21],
    [17,22],[19,23],[21,24],
    [22,23],[23,24],
  ];

  const activeNodes = new Set([2, 8, 14, 19]);
  const glowNode = 13;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      aria-hidden="true"
    >
      <defs>
        <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(196,35,45,0.9)" />
        </filter>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="rgba(196,35,45,0.14)"
          strokeWidth="0.18"
          className="dark:stroke-[rgba(196,35,45,0.14)] stroke-[rgba(220,38,38,0.08)]"
        />
      ))}

      {/* Nodes */}
      {nodes.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx} cy={cy}
          r={i === glowNode ? 0.8 : 0.55}
          fill={i === glowNode ? "rgba(196,35,45,0.7)" : "rgba(196,35,45,0.3)"}
          className={i >= 12 ? "dark:fill-[rgba(196,35,45,0.3)] fill-[rgba(220,38,38,0.14)]" : "dark:fill-[rgba(196,35,45,0.3)] fill-[rgba(220,38,38,0.12)]"}
          filter={i === glowNode ? "url(#node-glow)" : undefined}
          style={
            activeNodes.has(i)
              ? { animation: `pulse-node 3s ease-in-out infinite`, animationDelay: `${(i % 4) * 0.8}s` }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

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
        // Use persistent device ID and user agent
        const deviceId = getDeviceId();
        const userAgent = getUserAgent();

        // Store in form so it gets included if they need to manually login to link
        form.setValue("initData", initData);
        form.setValue("deviceId", deviceId);
        form.setValue("userAgent", userAgent);

        // Attempt auto login
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
        // Timed out waiting for Telegram
        setIsAuthenticatingTma(false);
      }
    };

    checkInitData();
  }, [login, router, form]);

  const onSubmit = async (data: LoginInput) => {
    try {
      // Include persistent device ID and user agent with login request
      const loginData: LoginInput = {
        ...data,
        deviceId: data.deviceId || getDeviceId(),
        userAgent: data.userAgent || getUserAgent(),
      };
      await login(loginData);
      router.push("/");
    } catch {
      // error is set in store; form stays open
    }
  };
  return (
    <div className="flex min-h-svh bg-void">
      {/* Left panel — cinematic branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-base overflow-hidden flex-col justify-between p-10 lg:p-14 border-r border-border-subtle/30 shadow-[10px_0_40px_rgba(0,0,0,0.1)]">
        {/* Dynamic theme-adapting glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -left-[20%] top-[-10%] h-[70%] w-[70%] rounded-full bg-crimson/10 blur-[130px] mix-blend-screen dark:mix-blend-normal [animation:pulse_10s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          <div className="absolute -right-[20%] bottom-[-10%] h-[70%] w-[70%] rounded-full bg-crimson/8 blur-[140px] mix-blend-screen dark:mix-blend-normal" />
          <div className="absolute left-[20%] top-[40%] h-[50%] w-[50%] rounded-full bg-crimson/5 blur-[100px] mix-blend-screen dark:mix-blend-normal" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(150,150,150,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(150,150,150,0.04)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        </div>

        {/* Signal Network SVG overlay */}
        <SignalNetwork />

        {/* Logo + tagline */}
        <div className="relative z-20 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex items-center gap-3">
            <TitanMark className="w-9 h-9 text-crimson drop-shadow-[0_0_8px_rgba(196,35,45,0.5)]" />
            <h1 className="font-display font-extrabold text-3xl text-text-primary tracking-tight">
              TITAN <span className="text-crimson">JOURNAL</span>
            </h1>
          </div>
          <p className="text-text-secondary font-sans text-sm mt-4 lg:text-base max-w-md leading-relaxed selection:bg-crimson/30">
            The intelligent command center for managing funnels, optimising
            conversions, and driving growth.
          </p>
        </div>

        {/* Footer badges */}
        <div className="relative z-20 flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {["ENCRYPTED", "ZERO TRUST", "SOC2"].map((badge) => (
            <span
              key={badge}
              className="text-[10px] uppercase tracking-widest text-text-muted font-semibold px-2.5 py-1 rounded border border-border-subtle/50 bg-card/30"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-void relative">
        {/* Right side glow for continuity on mobile */}
        <div className="absolute right-0 top-0 h-[50%] w-[50%] rounded-full bg-crimson/5 blur-[150px] pointer-events-none lg:hidden" />

        <div className="w-full max-w-[420px] animate-in slide-in-from-bottom-4 fade-in duration-500 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 mt-4 text-center flex flex-col items-center">
            <TitanMark className="w-10 h-10 text-crimson mb-5 drop-shadow-[0_0_8px_rgba(196,35,45,0.4)]" />
            <h1 className="font-display font-extrabold text-3xl text-text-primary tracking-tight">
              TITAN <span className="text-crimson">JOURNAL</span>
            </h1>
            <p className="text-text-secondary font-sans text-xs mt-2">
              Intelligence Platform
            </p>
          </div>

          {/* Form card */}
          <div className="surface-card relative overflow-hidden p-8 sm:p-10 rounded-2xl shadow-[0_0_60px_var(--crimson-glow)] ring-1 ring-border-subtle/50 backdrop-blur-xl">
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-crimson/40 to-transparent" />

            {isAuthenticatingTma ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-14 h-14 rounded-full bg-[#2AABEE]/10 border border-[#2AABEE]/30 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-[#2AABEE]/20 animate-ping opacity-20"></div>
                  <Send className="h-6 w-6 text-[#2AABEE] relative z-10 pr-[2px] pt-[2px]" />
                </div>
                <h2 className="font-display font-bold text-xl text-text-primary mb-2">
                  Authorising with Telegram
                </h2>
                <div className="flex items-center gap-2 text-text-secondary font-sans text-sm mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                  <span>Establishing secure connection...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
                    {isLinkingMode ? "Link Account" : "Welcome back"}
                  </h2>
                  <p className="text-text-secondary font-sans text-sm mt-2">
                    {isLinkingMode
                      ? "Sign in with your email and password to link your Telegram account."
                      : "Sign in to your command center."}
                  </p>
                </div>

                <div className="h-px bg-border-subtle/50 mb-8" />

                {/* Global API error */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
                    {error}
                  </div>
                )}

                {/* Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
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
                              {...field}
                              className="text-sm bg-base/50 focus-visible:ring-crimson/50 focus-visible:border-crimson h-11 transition-all shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between mt-5">
                            <FormLabel className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                              Password
                            </FormLabel>
                            <a
                              href="/forgot-password"
                              className="text-[11px] text-crimson hover:text-crimson-hover font-semibold transition-colors"
                            >
                              Forgot password?
                            </a>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="pr-10 bg-base/50 focus-visible:ring-crimson/50 focus-visible:border-crimson h-11 transition-all shadow-sm"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-text-muted hover:text-text-secondary hover:bg-transparent"
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

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-6 h-11 font-semibold tracking-wide transition-all hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group"
                      size="lg"
                    >
                      {/* Subtle shine effect on hover */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Signing
                          in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>

                <p className="text-center text-[11px] text-text-muted font-sans mt-5">
                  Need access? Contact your administrator.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
