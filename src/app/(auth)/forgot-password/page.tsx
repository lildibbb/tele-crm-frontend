"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
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
import { ForgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth.schema";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordInput>({
    resolver: standardSchemaResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await authApi.forgotPassword(data);
    setSubmittedEmail(data.email);
    setSent(true);
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

      <div className="w-full max-w-sm animate-in-up">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-sans transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>

        <div className="surface-card p-7 sm:p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-success/20 border border-success/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                Check your inbox
              </h2>
              <p className="font-sans text-sm text-text-secondary leading-relaxed mb-6">
                If{" "}
                <span className="text-text-primary font-medium">{submittedEmail}</span>{" "}
                is registered, a 4-digit reset code has been sent. It expires in 15 minutes.
              </p>
              <Button
                variant="ghost"
                className="w-full"
                size="lg"
                onClick={() => { setSent(false); form.reset(); }}
              >
                Resend code
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-10 h-10 rounded-lg bg-crimson/20 border border-crimson/30 flex items-center justify-center mb-4">
                  <Mail className="h-4 w-4 text-crimson" />
                </div>
                <h2 className="font-display font-bold text-2xl text-text-primary">
                  Forgot password?
                </h2>
                <p className="text-text-secondary font-sans text-sm mt-1">
                  Enter your email and we&apos;ll send a 4-digit reset code.
                </p>
              </div>

              <div className="h-px bg-border-subtle mb-6" />

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

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="w-full mt-2"
                    size="lg"
                  >
                    {form.formState.isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                    ) : (
                      "Send Reset Code"
                    )}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-[12px] text-text-muted font-sans mt-5">
                Remember your password?{" "}
                <Link href="/login" className="text-crimson hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
