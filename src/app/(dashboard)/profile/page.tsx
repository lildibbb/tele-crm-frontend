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
  SlidersHorizontal,
} from "@phosphor-icons/react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SessionsTab } from "@/app/(dashboard)/settings/_components/sessions-tab";
import { cn } from "@/lib/utils";
import { useT, K } from "@/i18n";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MobileProfile } from "@/components/mobile";
import { showToast } from "@/lib/toast";

// Curated list of common IANA timezones grouped by region
const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  // UTC
  { value: "UTC", label: "UTC (GMT+0)" },
  // Americas
  { value: "America/New_York",    label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago",     label: "Central Time (US & Canada)" },
  { value: "America/Denver",      label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage",   label: "Alaska (US)" },
  { value: "Pacific/Honolulu",    label: "Hawaii (US)" },
  { value: "America/Toronto",     label: "Eastern Time (Canada)" },
  { value: "America/Vancouver",   label: "Pacific Time (Canada)" },
  { value: "America/Sao_Paulo",   label: "Brasília (Brazil)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (Argentina)" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "America/Bogota",      label: "Bogotá (Colombia)" },
  // Europe
  { value: "Europe/London",       label: "London (GMT/BST)" },
  { value: "Europe/Paris",        label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin",       label: "Berlin (CET/CEST)" },
  { value: "Europe/Madrid",       label: "Madrid (CET/CEST)" },
  { value: "Europe/Rome",         label: "Rome (CET/CEST)" },
  { value: "Europe/Amsterdam",    label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Warsaw",       label: "Warsaw (CET/CEST)" },
  { value: "Europe/Istanbul",     label: "Istanbul (TRT, UTC+3)" },
  { value: "Europe/Moscow",       label: "Moscow (MSK, UTC+3)" },
  { value: "Europe/Kyiv",         label: "Kyiv (EET/EEST)" },
  // Africa & Middle East
  { value: "Africa/Cairo",        label: "Cairo (EET)" },
  { value: "Africa/Lagos",        label: "Lagos (WAT, UTC+1)" },
  { value: "Africa/Nairobi",      label: "Nairobi (EAT, UTC+3)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST, UTC+2)" },
  { value: "Asia/Dubai",          label: "Dubai (GST, UTC+4)" },
  { value: "Asia/Riyadh",         label: "Riyadh (AST, UTC+3)" },
  { value: "Asia/Tehran",         label: "Tehran (IRST, UTC+3:30)" },
  { value: "Asia/Karachi",        label: "Karachi (PKT, UTC+5)" },
  // Asia
  { value: "Asia/Kolkata",        label: "Mumbai/Kolkata (IST, UTC+5:30)" },
  { value: "Asia/Dhaka",          label: "Dhaka (BST, UTC+6)" },
  { value: "Asia/Yangon",         label: "Yangon (MMT, UTC+6:30)" },
  { value: "Asia/Bangkok",        label: "Bangkok/Jakarta (WIB, UTC+7)" },
  { value: "Asia/Singapore",      label: "Singapore (SGT, UTC+8)" },
  { value: "Asia/Kuala_Lumpur",   label: "Kuala Lumpur (MYT, UTC+8)" },
  { value: "Asia/Manila",         label: "Manila (PHT, UTC+8)" },
  { value: "Asia/Shanghai",       label: "Beijing/Shanghai (CST, UTC+8)" },
  { value: "Asia/Taipei",         label: "Taipei (CST, UTC+8)" },
  { value: "Asia/Hong_Kong",      label: "Hong Kong (HKT, UTC+8)" },
  { value: "Asia/Seoul",          label: "Seoul (KST, UTC+9)" },
  { value: "Asia/Tokyo",          label: "Tokyo (JST, UTC+9)" },
  // Oceania
  { value: "Australia/Perth",     label: "Perth (AWST, UTC+8)" },
  { value: "Australia/Darwin",    label: "Darwin (ACST, UTC+9:30)" },
  { value: "Australia/Brisbane",  label: "Brisbane (AEST, UTC+10)" },
  { value: "Australia/Sydney",    label: "Sydney (AEDT/AEST)" },
  { value: "Australia/Adelaide",  label: "Adelaide (ACST/ACDT)" },
  { value: "Pacific/Auckland",    label: "Auckland (NZST/NZDT)" },
  { value: "Pacific/Fiji",        label: "Fiji (FJT, UTC+12)" },
];

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

  // Timezone preference state
  const [tz, setTz] = useState<string>(user?.timezone ?? "UTC");
  const [tzSaving, setTzSaving] = useState(false);

  if (isMobile) return <MobileProfile onBack={() => router.back()} onSignOut={() => router.replace("/login")} onActiveSessions={() => router.push("/settings/sessions")} />;

  const role = (user?.role ?? "STAFF") as UserRole;
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Never";

  const tzLabel = TIMEZONE_OPTIONS.find((o) => o.value === tz)?.label ?? tz;

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

  const handleSaveTimezone = async () => {
    setTzSaving(true);
    try {
      const res = await usersApi.updateTimezone(tz);
      // Update in-memory auth store so analytics immediately uses the new timezone
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, timezone: res.data.data.timezone } : s.user,
      }));
      showToast.success("Timezone saved — analytics will now use " + tzLabel);
    } catch {
      showToast.error("Failed to save timezone preference.");
    } finally {
      setTzSaving(false);
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

              {/* Current timezone display */}
              <div className="flex items-start gap-3">
                <Globe size={14} weight="regular" className="text-text-muted shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[10.5px] text-text-muted uppercase tracking-widest mb-0.5">
                    Timezone
                  </p>
                  <p className="font-mono text-[11px] text-text-primary leading-tight">{user?.timezone ?? "UTC"}</p>
                </div>
              </div>
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
            <TabsTrigger value="preferences" className="flex items-center gap-1.5 text-[13px]">
              <SlidersHorizontal size={13} weight="bold" />
              Preferences
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

          {/* Preferences tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-display">
                  <Globe size={14} className="text-crimson" weight="bold" />
                  Timezone Preference
                </CardTitle>
                <CardDescription>
                  Choose your local timezone. Analytics date filters (Today, This Week, etc.) will use this timezone
                  to compute correct midnight boundaries — ensuring you see data for your actual calendar day, not the UTC day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-text-secondary">Your Timezone</Label>
                  <Select value={tz} onValueChange={setTz}>
                    <SelectTrigger className="h-9 text-sm w-full max-w-md">
                      <Globe size={13} className="text-text-muted mr-1 shrink-0" />
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-sm">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-text-muted font-mono pt-0.5">{tz}</p>
                </div>

                <Alert className="border-blue-500/20 bg-blue-500/5 py-2.5">
                  <Globe size={13} className="text-blue-400" />
                  <AlertDescription className="text-blue-300 text-[12px]">
                    <strong>How it works:</strong> When you select &quot;Today&quot; on the analytics dashboard, the
                    backend will compute midnight in <strong>{tzLabel}</strong> as the start of day —
                    so you won&apos;t see data from yesterday bleeding in.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end pt-1">
                  <Button
                    onClick={() => void handleSaveTimezone()}
                    disabled={tzSaving || tz === (user?.timezone ?? "UTC")}
                    className="bg-crimson hover:bg-crimson/90 text-white text-sm gap-1.5 px-5"
                  >
                    {tzSaving ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <Globe size={14} />
                    )}
                    Save Timezone
                  </Button>
                </div>
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
