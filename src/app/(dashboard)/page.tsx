"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { UserRole } from "@/types/enums";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { SuperadminHome, OwnerHome, StaffHome } from "@/components/mobile";
import {
  Users,
  UserCheck,
  Wallet,
  TrendUp,
  ArrowUpRight,
  Clock,
  ArrowCounterClockwise,
  Warning,
  ArrowsLeftRight,
  Pulse,
  CaretRight,
  SpinnerGap,
} from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useT } from "@/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

gsap.registerPlugin(useGSAP);

// ── Types ──────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  goldValue?: boolean;
  financialAccent?: boolean;
  delay?: number;
}

interface ActivityRow {
  id: string;
  name: string;
  status:
    | "NEW"
    | "REGISTERED"
    | "DEPOSIT_REPORTED"
    | "DEPOSIT_CONFIRMED"
    | "CONTACTED"
    | "REJECTED";
  amount?: string;
  time: string;
}

const BADGE_MAP: Record<ActivityRow["status"], { label: string; cls: string }> =
  {
    NEW: { label: "New", cls: "badge-new" },
    CONTACTED: { label: "Contacted", cls: "badge-contacted" },
    REGISTERED: { label: "Registered", cls: "badge-registered" },
    DEPOSIT_REPORTED: { label: "Proof Pending", cls: "badge-pending" },
    DEPOSIT_CONFIRMED: { label: "Confirmed", cls: "badge-confirmed" },
    REJECTED: { label: "Rejected", cls: "badge-danger" },
  };

// ── Count-up hook ───────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

// ── Scroll reveal hook ──────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-reveal");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const delay = parseInt(el.dataset.delay ?? "0");
            setTimeout(() => el.classList.add("revealed"), delay);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -40px 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Chart Tooltip components ─────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <p className="text-[11px] text-text-secondary mb-2 font-sans">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-[3px]">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: entry.stroke ?? entry.fill }}
          />
          <span className="text-[12px] text-text-secondary font-sans">
            {entry.name}
          </span>
          <span className="text-[12px] text-text-primary data-mono ml-auto pl-3">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <p className="text-[11px] text-text-secondary mb-1 font-sans">{label}</p>
      <p className="text-base data-mono text-gold leading-tight">
        {payload[0].value}{" "}
        <span className="text-[11px] text-text-muted font-sans">deposits</span>
      </p>
    </div>
  );
}

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
      <p className="text-[12px] text-text-secondary font-sans mb-1">
        {item.name}
      </p>
      <p
        className="font-display font-bold text-[18px] leading-tight"
        style={{ color: item.payload.color }}
      >
        {item.value.toLocaleString()}
      </p>
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaPositive = true,
  goldValue = false,
  financialAccent = false,
}: KpiCardProps) {
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const prefix = value.match(/[^0-9,]+(?=[0-9])/)?.[0] ?? "";
  const suffix = value.match(/[^0-9]+$/)?.[0] ?? "";
  const count = useCountUp(numericTarget, 1200);
  const displayValue = prefix + count.toLocaleString() + suffix;

  return (
    <Card className="kpi-stat-card kpi-card overflow-hidden relative">
      {financialAccent && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold to-gold/30 rounded-r" />
      )}
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3.5">
          <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider leading-tight pr-2">
            {label}
          </p>
          <div
            className={`ios-icon ${financialAccent ? "bg-gold-subtle" : "bg-crimson-subtle"}`}
          >
            <Icon
              size={20}
              weight="duotone"
              className={financialAccent ? "text-gold" : "text-crimson"}
            />
          </div>
        </div>
        <p
          className={`font-display font-extrabold text-[30px] sm:text-[34px] tracking-tight leading-none mb-2 ${goldValue ? "text-gold" : "text-text-primary"}`}
        >
          {displayValue}
        </p>
        <p
          className={`text-xs font-sans flex items-center gap-1 ${deltaPositive ? "text-success" : "text-danger"}`}
        >
          <ArrowUpRight size={13} weight="bold" className="flex-shrink-0" />
          {delta}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  const t = useT();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<
    "today" | "this_week" | "last_30_days" | "this_month"
  >("last_30_days");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  const { summary, isLoading, error, fetchSummary } = useAnalyticsStore();
  const { leads, fetchLeads } = useLeadsStore();

  // Fetch on mount or period change
  useEffect(() => {
    fetchSummary({ timeframe: period });
    fetchLeads({ skip: 0, take: 20 });
  }, [fetchSummary, fetchLeads, period]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Derived chart data from real API ──────────────────────────
  const funnelDonut = useMemo(() => {
    if (!summary?.funnel) return [];
    return [
      {
        name: "Confirmed",
        value: summary.funnel.depositConfirmed,
        color: "#22D3A0",
      },
      {
        name: "Pending",
        value: summary.funnel.depositReported,
        color: "#F59E0B",
      },
      {
        name: "Registered",
        value: summary.funnel.registered,
        color: "#60a5fa",
      },
      { name: "New", value: summary.funnel.new, color: "#C4232D" },
    ];
  }, [summary]);

  const trendData = useMemo(() => {
    if (!summary?.trendSeries) return [];
    return summary.trendSeries.map((s) => ({
      date: s.date.includes("T")
        ? new Date(s.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          }) // e.g. "1 PM"
        : new Date(s.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }), // e.g. "24 Feb"
      Leads: s.newLeads,
      Registered: s.registered,
      Confirmed: s.confirmed,
    }));
  }, [summary]);

  // Use the same trendSeries data to show day-by-day (or hour-by-hour) deposits
  const depositsData = useMemo(() => {
    if (!summary?.trendSeries) return [];
    return summary.trendSeries.map((s, i) => ({
      label: s.date.includes("T")
        ? new Date(s.date).toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          })
        : new Date(s.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          }),
      Deposits: s.confirmed, // The summary schema gives us `confirmed`
    }));
  }, [summary]);

  const { avgDeposits, bestDeposits } = useMemo(() => {
    if (!depositsData || depositsData.length === 0)
      return { avgDeposits: 0, bestDeposits: 0 };
    const max = Math.max(...depositsData.map((d) => d.Deposits));
    const sum = depositsData.reduce((acc, d) => acc + d.Deposits, 0);
    const avg = Math.round(sum / depositsData.length);
    return { avgDeposits: avg, bestDeposits: max };
  }, [depositsData]);

  const recentActivity: ActivityRow[] = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((l) => ({
        id: l.id,
        name: l.displayName ?? l.username ?? l.telegramUserId,
        status: l.status as ActivityRow["status"],
        amount: l.depositBalance
          ? `$${Number(l.depositBalance).toLocaleString()}`
          : undefined,
        time: new Date(l.updatedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      }));
  }, [leads]);

  const totalLeads = summary?.kpi.totalLeads.current ?? 0;
  const registeredLeads = summary?.kpi.registeredAccounts.current ?? 0;
  const depositConfirmed = summary?.kpi.depositingClients.current ?? 0;
  const pendingVerifications = summary?.kpi.pendingVerifications.current ?? 0;

  useGSAP(
    () => {
      if (isMobile) return;
      gsap.from(".hero-content", {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: "power2.out",
      });
      gsap.from(".kpi-stat-card", {
        opacity: 0,
        y: 18,
        scale: 0.97,
        stagger: 0.08,
        duration: 0.45,
        ease: "power2.out",
        delay: 0.1,
      });
      gsap.from(".activity-row", {
        opacity: 0,
        x: -10,
        stagger: 0.07,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.4,
      });
      gsap.from(".funnel-bar", {
        width: 0,
        duration: 0.9,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.5,
      });
      gsap.from(".page-section", {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 0.55,
        ease: "power2.out",
        delay: 0.35,
      });
    },
    { scope: containerRef },
  );
  useScrollReveal();

  // Parallax on hero video — passive listener, GPU-only transform
  useEffect(() => {
    if (isMobile) return;
    const main = document.getElementById("dashboard-main");
    if (!main || !videoRef.current) return;
    const onScroll = () => {
      if (!videoRef.current) return;
      videoRef.current.style.transform = `translateY(${main.scrollTop * 0.28}px)`;
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    Promise.all([
      fetchSummary({ timeframe: period }),
      fetchLeads({ skip: 0, take: 20 }),
    ]).finally(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    });
  };

  // ── Mobile: role-based home screens ──
  if (isMobile) {
    if (user?.role === UserRole.SUPERADMIN) return <SuperadminHome />;
    if (user?.role === UserRole.STAFF)
      return <StaffHome staffName={user?.email?.split("@")[0]} />;
    return <OwnerHome />;
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative">
        {/* ── Cinematic Full-Bleed Video Hero ─────────────────────── */}
        <div
          className="relative overflow-hidden -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-7 rounded-2xl"
          style={{ height: 264 }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full object-cover will-change-transform"
            poster="/assets/bg/dashboard-night.jpeg"
            style={{ height: "130%", top: "-15%", left: 0, right: 0 }}
          >
            <source src="/assets/bg/dashboard-loop.mp4" type="video/mp4" />
            <img
              src="/assets/bg/dashboard-night.jpeg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          </video>
          {/* Always-dark cinematic overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(170deg, rgba(4,4,12,0.65) 0%, rgba(8,8,20,0.50) 45%, var(--void) 100%)",
            }}
          />
          {/* Grain texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "160px",
              opacity: 0.035,
            }}
          />
          {/* Hero content */}
          <div className="hero-content absolute inset-0 z-10 flex flex-col justify-end px-5 pb-5 md:px-7 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest bg-white/10 text-white/80 backdrop-blur-sm border border-white/10">
                    <span className="live-dot !w-1.5 !h-1.5" />
                    LIVE DATA
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-[30px] text-white tracking-tight leading-tight drop-shadow-lg">
                  {t("nav.commandCenter")}
                </h1>
                <p className="text-white/50 text-sm font-sans mt-1.5">
                  {t("dashboard.subtitle")} —{" "}
                  {lastRefresh.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 hover:bg-white/20 hover:text-white/90 disabled:cursor-not-allowed h-[30px] px-3 text-xs font-medium"
                >
                  {refreshing ? (
                    <SpinnerGap
                      size={13}
                      weight="bold"
                      className="animate-spin"
                    />
                  ) : (
                    <ArrowCounterClockwise size={13} weight="bold" />
                  )}
                  {refreshing ? t("common.loading") : t("dashboard.refresh")}
                </Button>
                <Select
                  value={period}
                  onValueChange={(val: any) => setPeriod(val)}
                >
                  <SelectTrigger className="h-[30px] px-3 text-xs bg-white/10 backdrop-blur-sm border-white/10 text-white/80 hover:bg-white/20 w-auto min-w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">Weekly</SelectItem>
                    <SelectItem value="this_month">Monthly</SelectItem>
                    <SelectItem value="last_30_days">30 Days</SelectItem>
                    <SelectItem value="last_90_days">90 Days</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-5">
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {isLoading && !summary ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-2xl" />
              ))
            ) : (
              <>
                <KpiCard
                  icon={Users}
                  label={t("dashboard.totalLeads")}
                  value={String(totalLeads)}
                  delta={`${summary?.kpi.totalLeads.changePercentage ?? 0}% ${period === "today" ? "since yesterday" : "since last period"}`}
                  deltaPositive={
                    (summary?.kpi.totalLeads.changePercentage ?? 0) >= 0
                  }
                />
                <KpiCard
                  icon={UserCheck}
                  label={t("dashboard.registered")}
                  value={String(registeredLeads)}
                  delta={`${summary?.kpi.registeredAccounts.changePercentage ?? 0}% ${period === "today" ? "since yesterday" : "since last period"}`}
                  deltaPositive={
                    (summary?.kpi.registeredAccounts.changePercentage ?? 0) >= 0
                  }
                />
                <KpiCard
                  icon={Wallet}
                  label={t("dashboard.depositClients")}
                  value={String(depositConfirmed)}
                  delta={`${summary?.kpi.depositingClients.changePercentage ?? 0}% ${period === "today" ? "since yesterday" : "since last period"}`}
                  deltaPositive={
                    (summary?.kpi.depositingClients.changePercentage ?? 0) >= 0
                  }
                  goldValue
                  financialAccent
                />
                <KpiCard
                  icon={TrendUp}
                  label={t("dashboard.pendingVerifications")}
                  value={String(pendingVerifications)}
                  delta={`${summary?.kpi.pendingVerifications.changePercentage ?? 0}% ${period === "today" ? "since yesterday" : "since last period"}`}
                  deltaPositive={
                    (summary?.kpi.pendingVerifications.changePercentage ?? 0) >=
                    0
                  }
                  goldValue
                  financialAccent
                />
              </>
            )}
            {/* View all link row */}
            <div className="col-span-2 xl:col-span-4 flex justify-end">
              <Button
                variant="link"
                asChild
                className="text-crimson p-0 h-auto text-xs font-sans font-medium"
              >
                <Link href="/leads">
                  {t("dashboard.viewAllLeads")}{" "}
                  <ArrowUpRight size={12} weight="bold" className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* ── Funnel Donut + Live Activity ── */}
          <div className="page-section grid grid-cols-1 xl:grid-cols-7 gap-3 md:gap-4">
            {/* Funnel Donut Chart — always-dark chart-card */}
            <div className="xl:col-span-4 chart-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-sans font-semibold text-[15px] text-white">
                  {t("dashboard.funnelOverview")}
                </h2>
                <span
                  className="text-xs font-sans"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {period === "today"
                    ? "Daily"
                    : period === "this_week"
                      ? "Weekly"
                      : "Last 30 Days"}
                </span>
              </div>
              <p
                className="text-xs font-sans mb-5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {t("dashboard.funnelSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                {/* Donut */}
                <div className="relative flex-shrink-0">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={funnelDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={84}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {funnelDonut.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<FunnelTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-display font-extrabold text-[22px] text-white leading-none">
                      {totalLeads.toLocaleString()}
                    </span>
                    <span
                      className="text-[11px] mt-0.5"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {t("dashboard.totalLeads")}
                    </span>
                  </div>
                </div>

                {/* Stats list */}
                <div className="flex-1 space-y-3.5 w-full">
                  {funnelDonut.map((item) => {
                    const pct =
                      totalLeads > 0
                        ? Math.round((item.value / totalLeads) * 100)
                        : 0;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: item.color }}
                          />
                          <span
                            className="text-[13px] font-sans flex-1"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {item.name}
                          </span>
                          <span className="font-mono text-[13px] text-white">
                            {item.value.toLocaleString()}
                          </span>
                          <span
                            className="text-[11px] w-9 text-right"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        >
                          <div
                            className="funnel-bar h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: item.color,
                              opacity: 0.85,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Activity Feed */}
            <Card className="xl:col-span-3 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
                <CardTitle className="font-sans font-semibold text-[15px] text-text-primary">
                  {t("dashboard.liveActivity")}
                </CardTitle>
                <Badge className="badge badge-live flex items-center gap-1.5">
                  <span className="live-dot !w-1.5 !h-1.5" />
                  LIVE
                </Badge>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <div className="space-y-0.5 px-3">
                  {recentActivity.map((row) => {
                    const badge = BADGE_MAP[row.status];
                    return (
                      <Link
                        key={row.id}
                        href={`/leads/${row.id}`}
                        className="activity-row flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-elevated transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-crimson/15 border border-crimson/20 flex items-center justify-center text-crimson font-display font-bold text-[10px] flex-shrink-0">
                          {row.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-sans font-medium text-text-primary truncate">
                            {row.name}
                          </p>
                          <p className="data-mono text-[11px]">{row.id}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge className={`badge text-[10px] ${badge.cls}`}>
                            {badge.label}
                          </Badge>
                          {row.amount && row.amount !== "—" && (
                            <span className="data-mono text-[11px] text-gold">
                              {row.amount}
                            </span>
                          )}
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-text-muted text-[11px] font-sans flex-shrink-0">
                          <Clock size={11} weight="regular" />
                          {row.time}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="px-5 py-3 border-t border-border-subtle">
                <Button
                  variant="link"
                  asChild
                  className="text-crimson p-0 h-auto text-xs font-sans font-medium"
                >
                  <Link href="/leads">
                    {t("dashboard.viewAllLeads")}
                    <ArrowUpRight size={12} weight="bold" className="ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* ── Action Strip ── */}
          <Card className="page-section overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
                <Button
                  variant="ghost"
                  asChild
                  className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-elevated/60 gap-3"
                >
                  <Link href="/verification">
                    <div className="ios-icon-sm bg-warning/12 flex-shrink-0">
                      <Warning
                        size={16}
                        weight="duotone"
                        className="text-warning"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-sans font-semibold text-[13px] text-text-primary">
                        {t("dashboard.pendingVerifications")}
                      </span>
                      <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                        · {t("dashboard.awaitingReview")}
                      </span>
                    </div>
                    <span className="flex items-center gap-0.5 text-warning text-[12px] font-medium flex-shrink-0 group-hover:gap-1.5 transition-all whitespace-nowrap">
                      {t("common.review")}{" "}
                      <CaretRight size={13} weight="bold" />
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-elevated/60 gap-3"
                >
                  <Link href="/leads?handover=true">
                    <div className="ios-icon-sm bg-info/12 flex-shrink-0">
                      <ArrowsLeftRight
                        size={16}
                        weight="duotone"
                        className="text-info"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-sans font-semibold text-[13px] text-text-primary">
                        {t("dashboard.handoverLeads")}
                      </span>
                      <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                        · {t("dashboard.manualReplies")}
                      </span>
                    </div>
                    <span className="flex items-center gap-0.5 text-info text-[12px] font-medium flex-shrink-0 group-hover:gap-1.5 transition-all whitespace-nowrap">
                      {t("common.view")} <CaretRight size={13} weight="bold" />
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Trend + Weekly Charts ── */}
          <div className="page-section grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
            {/* Area Chart — Lead Acquisition Trend */}
            <div className="xl:col-span-3 chart-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-sans font-semibold text-[15px] text-white">
                  {t("dashboard.acquisitionTrend")}
                </h2>
                <span
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  <Pulse size={13} weight="regular" />
                  {period === "today"
                    ? "Daily"
                    : period === "this_week"
                      ? "Weekly"
                      : "Last 30 Days"}
                </span>
              </div>
              <p
                className="text-xs font-sans mb-5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {t("dashboard.trendSubtitle")}
              </p>

              <ResponsiveContainer width="100%" height={160}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#C4232D"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="95%"
                        stopColor="#C4232D"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#60a5fa"
                        stopOpacity={0.38}
                      />
                      <stop
                        offset="95%"
                        stopColor="#60a5fa"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                    <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#22D3A0"
                        stopOpacity={0.38}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22D3A0"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "rgba(255,255,255,0.3)",
                      fontFamily: "inherit",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Leads"
                    stroke="#C4232D"
                    strokeWidth={2}
                    fill="url(#gradLeads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Registered"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fill="url(#gradReg)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Confirmed"
                    stroke="#22D3A0"
                    strokeWidth={2}
                    fill="url(#gradConf)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div
                className="flex items-center gap-5 mt-4 pt-3.5 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {(
                  [
                    ["#C4232D", "Leads"],
                    ["#60a5fa", "Registered"],
                    ["#22D3A0", "Confirmed"],
                  ] as const
                ).map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: color }}
                    />
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart — Weekly Deposits */}
            <div className="xl:col-span-2 chart-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-sans font-semibold text-[15px] text-white">
                  Deposits Trend
                </h2>
                <span
                  className="text-xs font-sans"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Count
                </span>
              </div>
              <p
                className="text-xs font-sans mb-5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Confirmed deposits per period
              </p>

              <ResponsiveContainer width="100%" height={148}>
                <BarChart
                  data={depositsData}
                  margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
                  barSize={32}
                >
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8B94F" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#E8B94F"
                        stopOpacity={0.25}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 11,
                      fill: "rgba(255,255,255,0.3)",
                      fontFamily: "inherit",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<BarTooltip />} />
                  <Bar
                    dataKey="Deposits"
                    fill="url(#gradBar)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div
                className="mt-4 pt-3.5 border-t flex items-center justify-between"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div>
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Average
                  </p>
                  <p className="font-display font-bold text-xl text-[#E8B94F] leading-tight">
                    {avgDeposits}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Best
                  </p>
                  <p className="font-display font-bold text-xl text-white leading-tight">
                    {bestDeposits}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
