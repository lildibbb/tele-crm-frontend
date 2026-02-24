"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Send } from "lucide-react";
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
import { LoginSchema, type LoginInput } from "@/lib/schemas/auth.schema";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const form = useForm<LoginInput>({
    resolver: standardSchemaResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      router.push("/");
    } catch {
      // error is set in store; form stays open
    }
  };

  return (
    <div className="flex min-h-svh bg-void">
      {/* Left panel — cinematic branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-base overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080810] via-transparent to-[#080810] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/30 to-transparent z-10" />
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/bg/login-cinematic.jpeg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
        <div className="relative z-20">
          <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
            TITAN <span className="text-crimson">JOURNAL</span>
          </h1>
          <p className="text-text-secondary font-sans text-sm mt-1">
            IB Funnel Intelligence Platform
          </p>
        </div>
        <div className="relative z-20 flex gap-6">
          {["1,284 Leads", "856 Registered", "$425K AUM"].map((stat) => (
            <div key={stat}>
              <p className="font-mono text-sm text-text-primary font-medium">{stat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-void">
        <div className="w-full max-w-sm animate-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="font-display font-extrabold text-2xl text-text-primary tracking-tight">
              TITAN <span className="text-crimson">JOURNAL</span>
            </h1>
          </div>

          {/* Form card */}
          <div className="surface-card p-7 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="w-10 h-10 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center mb-4">
                <div className="w-5 h-5 bg-crimson rounded-sm" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary">
                Welcome back
              </h2>
              <p className="text-text-secondary font-sans text-sm mt-1">
                Sign in to your command center
              </p>
            </div>

            <div className="h-px bg-border-subtle mb-6" />

            {/* Global API error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-sans">
                {error}
              </div>
            )}

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-text-secondary">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="owner@titanjournal.com"
                          {...field}
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-medium text-text-secondary">
                          Password
                        </FormLabel>
                        <a
                          href="/forgot-password"
                          className="text-xs text-crimson hover:text-crimson-hover font-sans transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2"
                  size="lg"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-text-muted text-xs font-sans">or continue with</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            {/* Telegram login */}
            <Button
              variant="outline"
              className="w-full gap-2 border-[#2AABEE]/30 bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 text-[#2AABEE] hover:text-[#2AABEE]"
              size="lg"
            >
              <Send className="h-4 w-4" />
              Continue with Telegram
            </Button>

            <p className="text-center text-[11px] text-text-muted font-sans mt-5">
              Need access? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
