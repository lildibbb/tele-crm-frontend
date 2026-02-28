"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  UserCircle,
  CheckCircle,
  Shield,
  Calendar,
  Clock,
  Globe,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import type { ChangeOwnPasswordInput } from "@/lib/schemas/auth.schema";
import { UserRole } from "@/types/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SessionsTab } from "@/app/(dashboard)/settings/_components/sessions-tab";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileProfile } from "@/components/mobile";

const ROLE_BADGE: Record<UserRole, string> = {
  SUPERADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  OWNER:      "bg-crimson/15 text-crimson border-crimson/30",
  ADMIN:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  STAFF:      "bg-elevated text-text-secondary border-border-default",
};

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (isMobile) return <MobileProfile onBack={() => router.back()} onSignOut={() => router.replace("/login")} onActiveSessions={() => router.push("/settings/sessions")} />;

  const role = (user?.role ?? "STAFF") as UserRole;
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

  const handleChangePassword = async () => {
    setError(null);
    if (form.newPassword !== form.confirmPassword) { setError("New passwords do not match."); return; }
    if (form.newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    setSaving(true);
    try {
      await authApi.changeOwnPassword(form as ChangeOwnPasswordInput);
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to change password. Check your current password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in-up">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
          <UserCircle className="h-5 w-5 text-crimson" weight="fill" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-text-primary">{t(K.profile.pageTitle)}</h1>
          <p className="font-sans text-sm text-text-secondary">{t(K.profile.subtitle)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[270px_1fr] lg:grid-cols-[300px_1fr] gap-5 items-start">
        {/* ── Left: Profile identity card ───────────────────── */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            {/* Avatar */}
            <Avatar className="w-20 h-20 rounded-2xl bg-crimson/10 border border-crimson/20 flex-shrink-0">
              <AvatarFallback className="rounded-2xl bg-crimson/10 text-crimson font-display font-bold text-3xl">
                {initial}
              </AvatarFallback>
            </Avatar>

            {/* Email + role */}
            <div className="space-y-2 w-full">
              <p className="font-display font-bold text-[14.5px] text-text-primary break-all leading-snug">
                {user?.email}
              </p>
              <Badge
                variant="outline"
                className={cn("font-mono text-[11px] tracking-wide px-2.5 py-0.5", ROLE_BADGE[role])}
              >
                {role}
              </Badge>
            </div>

            <Separator className="w-full" />

            {/* Meta info */}
            <div className="w-full space-y-3.5 text-left">
              <div className="flex items-start gap-3">
                <Calendar size={14} weight="regular" className="text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[10.5px] text-text-muted uppercase tracking-widest mb-0.5">
                    {t(K.profile.memberSince)}
                  </p>
                  <p className="font-sans text-[13px] text-text-primary font-medium">{createdAt}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={14} weight="regular" className="text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[10.5px] text-text-muted uppercase tracking-widest mb-0.5">
                    {t(K.profile.lastLogin)}
                  </p>
                  <p className="font-sans text-[13px] text-text-primary font-medium">{lastLogin}</p>
                </div>
              </div>

              {user?.lastIpAddress && (
                <div className="flex items-start gap-3">
                  <Globe size={14} weight="regular" className="text-text-muted shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans text-[10.5px] text-text-muted uppercase tracking-widest mb-0.5">
                      {t(K.profile.ip)}
                    </p>
                    <p className="font-mono text-[12px] text-text-primary">{user.lastIpAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Right: Tabs ─────────────────────────────────── */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="bg-elevated border border-border-subtle">
            <TabsTrigger value="security" className="flex items-center gap-1.5 text-[13px]">
              <Lock size={13} weight="bold" />
              {t(K.profile.tab.account)}
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-1.5 text-[13px]">
              <Shield size={13} weight="bold" />
              {t(K.profile.tab.sessions)}
            </TabsTrigger>
          </TabsList>

          {/* Security tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <Lock size={14} className="text-crimson" weight="bold" />
                    {t(K.profile.changePassword)}
                  </CardTitle>
                  <CardDescription className="mt-0.5">
                    Use a strong password with 8+ characters, including numbers and symbols.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {success ? (
                  <Alert className="border-green-500/25 bg-green-500/8">
                    <CheckCircle size={15} weight="fill" className="text-green-400" />
                    <AlertDescription className="text-green-400 font-sans">
                      {t(K.profile.passwordChanged)}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-text-secondary">{t(K.profile.currentPassword)}</Label>
                      <Input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="h-9 text-sm"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-text-secondary">{t(K.profile.newPassword)}</Label>
                        <Input
                          type="password"
                          value={form.newPassword}
                          onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                          className="h-9 text-sm"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-text-secondary">{t(K.profile.confirmPassword)}</Label>
                        <Input
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                          className="h-9 text-sm"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="py-2.5">
                        <AlertDescription className="text-[13px]">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        onClick={() => void handleChangePassword()}
                        disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                        className="bg-crimson hover:bg-crimson/90 text-white text-sm gap-1.5 px-5"
                      >
                        {saving ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <Lock size={14} />
                        )}
                        {t(K.profile.savePassword)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions tab */}
          <TabsContent value="sessions">
            <SessionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



