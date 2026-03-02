"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAuthStore } from "@/store/authStore";
import { useAnalyticsStore } from "@/store/analyticsStore";
import { useLeadsStore } from "@/store/leadsStore";
import { useDashboardLayoutStore } from "@/store/dashboardLayoutStore";
import { UserRole } from "@/types/enums";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { SuperadminHome, OwnerHome, StaffHome } from "@/components/mobile";
import { CustomisePanelTrigger } from "@/components/dashboard/CustomisePanel";
import {
  Users,
  UserCheck,
  Wallet,
  TrendUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ArrowCounterClockwise,
  Warning,
  ArrowsLeftRight,
  Pulse,
  CaretRight,
  CaretDown,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu as PeriodDropdown,
  DropdownMenuContent as PeriodDropdownContent,
  DropdownMenuItem as PeriodDropdownItem,
  DropdownMenuTrigger as PeriodDropdownTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/lib/toast";

gsap.registerPlugin(useGSAP);

// ── Period options ──────────────────────────────────────────────
const PERIODS = [
  { value: "yesterday", label: "Yesterday" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "Weekly" },
  { value: "this_month", label: "Monthly" },
  { value: "last_30_days", label: "30 Days" },
  { value: "last_90_days", label: "90 Days" },
  { value: "all_time", label: "All Time" },
] as const;

type PeriodValue = (typeof PERIODS)[number]["value"];
const PERIOD_LABEL: Record<PeriodValue, string> = Object.fromEntries(
  PERIODS.map((p) => [p.value, p.label]),
) as Record<PeriodValue, string>;

// ── Types ──────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  goldValue?: boolean;
}

interface ActivityRow {
  id: string;
  name: string;
  subtitle: string;
  status:
    | "NEW"
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
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
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
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
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
    <div className="bg-card border border-border-default rounded-[14px] px-[14px] py-[10px] shadow-sm">
      <p className="text-[11px] text-text-secondary mb-1 font-sans">
        {item.name}
      </p>
      <p
        className="font-bold text-[18px] leading-tight data-mono"
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
}: KpiCardProps) {
  const numericTarget = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
  const prefix = value.match(/[^0-9,]+(?=[0-9])/)?.[0] ?? "";
  const suffix = value.match(/[^0-9]+$/)?.[0] ?? "";
  const count = useCountUp(numericTarget, 1200);
  const displayValue = prefix + count.toLocaleString() + suffix;

  return (
    <div className="kpi-stat-card bg-elevated rounded-xl p-5 border border-border-subtle shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <Icon size={22} weight="duotone" className="text-text-secondary" />
        <span
          className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            deltaPositive
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {deltaPositive ? (
            <ArrowUpRight size={12} weight="regular" />
          ) : (
            <ArrowDownRight size={12} weight="regular" />
          )}
          {delta}
        </span>
      </div>
      <p
        className={`text-2xl font-bold data-mono leading-none mb-1.5 tracking-tight ${
          goldValue ? "text-gold" : "text-text-primary"
        }`}
      >
        {displayValue}
      </p>
      <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────
export default function DashboardPage() {
  const t = useT();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodValue>("last_30_days");
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const isMobile = useIsMobile();

  const summary = useAnalyticsStore((s) => s.summary);
  const isLoading = useAnalyticsStore((s) => s.isLoading);
  const error = useAnalyticsStore((s) => s.error);
  const fetchSummary = useAnalyticsStore((s) => s.fetchSummary);
  const leads = useLeadsStore((s) => s.leads);
  const fetchLeads = useLeadsStore((s) => s.fetchLeads);
  const widgets = useDashboardLayoutStore((s) => s.widgets);
  const visibleWidgets = [...widgets].sort((a, b) => a.order - b.order).filter((w) => w.visible);

  // Fetch on mount or period change
  useEffect(() => {
    fetchSummary({ timeframe: period });
    fetchLeads({ skip: 0, take: 20 });
  }, [fetchSummary, fetchLeads, period]);

  useEffect(() => {
    if (error) showToast.error(error);
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
        name: "Submitted",
        value: summary.funnel.formSubmitted,
        color: "#F59E0B",
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
        name: l.displayName ?? l.username ?? String(l.telegramUserId),
        subtitle: l.phoneNumber
          ? l.phoneNumber
          : l.username
          ? `@${l.username}`
          : `#${String(l.telegramUserId).slice(0, 10)}`,
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
  const registeredLeads = summary?.kpi.formSubmissions.current ?? 0;
  const depositConfirmed = summary?.kpi.verifiedClients.current ?? 0;
  const pendingVerifications = summary?.kpi.formSubmissions.current ?? 0;
  const handoverLeadsCount = useMemo(() => leads.filter((l) => l.handoverMode).length, [leads]);

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
      return <StaffHome />;
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
                  className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border-transparent text-white/80 hover:bg-white/20 hover:text-white/90 disabled:cursor-not-allowed h-[30px] px-3 text-xs font-medium"
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
                <PeriodDropdown>
                  <PeriodDropdownTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border-transparent  text-white/80 hover:bg-white/20 hover:text-white/90 h-[30px] px-3 text-xs font-medium"
                    >
                      {PERIOD_LABEL[period]}
                      <CaretDown
                        size={11}
                        weight="bold"
                        className="opacity-70"
                      />
                    </Button>
                  </PeriodDropdownTrigger>
                  <PeriodDropdownContent
                    align="end"
                    sideOffset={6}
                    className="min-w-[140px] border-transparent"
                  >
                    {PERIODS.map((p) => (
                      <PeriodDropdownItem
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${
                            period === p.value
                              ? "bg-crimson opacity-100"
                              : "opacity-0"
                          }`}
                        />
                        {p.label}
                      </PeriodDropdownItem>
                    ))}
                  </PeriodDropdownContent>
                </PeriodDropdown>
                <CustomisePanelTrigger />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-5">
          {visibleWidgets.map((widget) => {
            if (widget.id === "kpi-cards") return (
              <div key="kpi-cards">
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
                        delta={`${summary?.kpi.totalLeads.changePercentage ?? 0}%`}
                        deltaPositive={
                          (summary?.kpi.totalLeads.changePercentage ?? 0) >= 0
                        }
                      />
                      <KpiCard
                        icon={UserCheck}
                        label={t("dashboard.registered")}
                        value={String(registeredLeads)}
                        delta={`${summary?.kpi.formSubmissions.changePercentage ?? 0}%`}
                        deltaPositive={
                          (summary?.kpi.formSubmissions.changePercentage ?? 0) >= 0
                        }
                      />
                      <KpiCard
                        icon={Wallet}
                        label={t("dashboard.depositClients")}
                        value={String(depositConfirmed)}
                        delta={`${summary?.kpi.verifiedClients.changePercentage ?? 0}%`}
                        deltaPositive={
                          (summary?.kpi.verifiedClients.changePercentage ?? 0) >= 0
                        }
                        goldValue
                      />
                      <KpiCard
                        icon={TrendUp}
                        label={t("dashboard.pendingVerifications")}
                        value={String(pendingVerifications)}
                        delta={`${summary?.kpi.formSubmissions.changePercentage ?? 0}%`}
                        deltaPositive={
                          (summary?.kpi.formSubmissions.changePercentage ?? 0) >= 0
                        }
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
              </div>
            );

            if (widget.id === "funnel-activity") return (
              /* ── Funnel Donut + Live Activity ── */
              <div key="funnel-activity" className="page-section grid grid-cols-1 xl:grid-cols-7 gap-3 md:gap-4">
                {/* Funnel Donut Chart */}
                <div className="xl:col-span-4 bg-elevated rounded-[20px] p-5 border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                      {t("dashboard.funnelOverview")}
                    </h2>
                    <span className="text-xs font-sans text-text-muted">
                      {period === "today"
                        ? "Daily"
                        : period === "this_week"
                          ? "Weekly"
                          : "Last 30 Days"}
                    </span>
                  </div>
                  <p className="text-xs font-sans mb-5 text-text-muted">
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
                            {funnelDonut.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={<FunnelTooltip />}
                            offset={12}
                            isAnimationActive={false}
                            wrapperStyle={{ pointerEvents: "none" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold data-mono text-text-primary leading-none">
                          {totalLeads.toLocaleString()}
                        </span>
                        <span className="text-[11px] mt-0.5 text-text-muted">
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
                              <span className="text-[13px] font-sans flex-1 text-text-secondary">
                                {item.name}
                              </span>
                              <span className="data-mono text-[13px] text-text-primary">
                                {item.value.toLocaleString()}
                              </span>
                              <span className="text-[11px] w-9 text-right text-text-muted">
                                {pct}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: "var(--border-subtle)" }}
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
                <div className="xl:col-span-3 bg-elevated rounded-[20px] border border-border-subtle flex flex-col overflow-hidden shadow-sm">
                  <div className="flex flex-row items-center justify-between px-5 py-4 bg-card shadow-sm">
                    <span className="font-sans font-semibold text-[15px] text-text-primary">
                      {t("dashboard.liveActivity")}
                    </span>
                    <Badge className="badge badge-live flex items-center gap-1.5">
                      <span className="live-dot !w-1.5 !h-1.5" />
                      LIVE
                    </Badge>
                  </div>
                  <div className="flex-1 p-0">
                    <div className="space-y-0.5 px-3 py-2">
                      {recentActivity.map((row) => {
                        const badge = BADGE_MAP[row.status];
                        return (
                          <Link
                            key={row.id}
                            href={`/leads/${row.id}`}
                            className="activity-row flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-void/40 transition-colors group"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 border ${
                              row.status === "DEPOSIT_CONFIRMED" ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" :
                              row.status === "DEPOSIT_REPORTED" ? "bg-amber-500/15 border-amber-500/25 text-amber-400" :
                              row.status === "CONTACTED" ? "bg-blue-500/15 border-blue-500/25 text-blue-400" :
                              row.status === "REJECTED" ? "bg-red-500/15 border-red-500/25 text-red-400" :
                              "bg-crimson/15 border-crimson/20 text-crimson"
                            }`}>
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
                              <p className="data-mono text-[11px] text-text-muted truncate">{row.subtitle}</p>
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
                  </div>
                  <div className="px-5 py-3 border-t border-border-subtle">
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
                  </div>
                </div>
              </div>
            );

            if (widget.id === "action-strip") return (
              /* ── Action Strip ── */
              <div key="action-strip" className="page-section bg-elevated rounded-xl overflow-hidden border border-border-subtle shadow-sm">
                <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border-subtle">
                  <Button
                    variant="ghost"
                    asChild
                    className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-void/40 gap-3"
                  >
                    <Link href="/verification">
                      <div className="flex-shrink-0">
                        <Warning size={16} weight="duotone" className="text-warning" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="font-sans font-semibold text-[13px] text-text-primary">
                          {t("dashboard.pendingVerifications")}
                        </span>
                        <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                          · {t("dashboard.awaitingReview")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pendingVerifications > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-warning/15 border border-warning/30 text-warning text-[11px] font-bold tabular-nums">
                            {pendingVerifications}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-warning text-[12px] font-medium group-hover:gap-1.5 transition-all whitespace-nowrap">
                          {t("common.review")} <CaretRight size={13} weight="bold" />
                        </span>
                      </div>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                    className="flex-1 h-auto px-5 py-3.5 justify-start rounded-none hover:bg-void/40 gap-3"
                  >
                    <Link href="/leads?handover=true">
                      <div className="flex-shrink-0">
                        <ArrowsLeftRight size={16} weight="duotone" className="text-info" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="font-sans font-semibold text-[13px] text-text-primary">
                          {t("dashboard.handoverLeads")}
                        </span>
                        <span className="hidden sm:inline text-text-muted text-[12px] font-sans ml-2">
                          · {t("dashboard.manualReplies")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {handoverLeadsCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-info/15 border border-info/30 text-info text-[11px] font-bold tabular-nums">
                            {handoverLeadsCount}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-info text-[12px] font-medium group-hover:gap-1.5 transition-all whitespace-nowrap">
                          {t("common.view")} <CaretRight size={13} weight="bold" />
                        </span>
                      </div>
                    </Link>
                  </Button>
                </div>
              </div>
            );

            if (widget.id === "trend-charts") return (
              /* ── Trend + Weekly Charts ── */
              <div key="trend-charts" className="page-section grid grid-cols-1 xl:grid-cols-5 gap-3 md:gap-4">
                {/* Area Chart — Lead Acquisition Trend */}
                <div className="xl:col-span-3 bg-elevated rounded-[20px] p-5 border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                      {t("dashboard.acquisitionTrend")}
                    </h2>
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Pulse size={13} weight="regular" />
                      {period === "today"
                        ? "Daily"
                        : period === "this_week"
                          ? "Weekly"
                          : "Last 30 Days"}
                    </span>
                  </div>
                  <p className="text-xs font-sans mb-5 text-text-muted">
                    {t("dashboard.trendSubtitle")}
                  </p>

                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart
                      data={trendData}
                      margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C4232D" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#C4232D" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22D3A0" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="#22D3A0" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={20}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={<ChartTooltip />}
                        offset={12}
                        isAnimationActive={false}
                        wrapperStyle={{ pointerEvents: "none" }}
                      />
                      <Area type="monotone" dataKey="Leads" stroke="#C4232D" strokeWidth={2} fill="url(#gradLeads)" />
                      <Area type="monotone" dataKey="Confirmed" stroke="#22D3A0" strokeWidth={2} fill="url(#gradConf)" />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-border-subtle">
                    {(
                      [
                        ["#C4232D", "Leads"],
                        ["#22D3A0", "Confirmed"],
                      ] as const
                    ).map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-[11px] text-text-muted">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Chart — Deposits Trend */}
                <div className="xl:col-span-2 bg-elevated rounded-[20px] p-5 border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-sans font-semibold text-[15px] text-text-primary">
                      Deposits Trend
                    </h2>
                    <span className="text-xs font-sans text-text-muted">Count</span>
                  </div>
                  <p className="text-xs font-sans mb-5 text-text-muted">
                    Confirmed deposits per period
                  </p>

                  <ResponsiveContainer width="100%" height={148}>
                    <BarChart
                      data={depositsData}
                      margin={{ top: 0, right: 0, left: -22, bottom: 0 }}
                      maxBarSize={32}
                    >
                      <defs>
                        <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8B94F" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#E8B94F" stopOpacity={0.25} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={20}
                      />
                      <YAxis hide />
                      <Tooltip
                        content={<BarTooltip />}
                        offset={12}
                        isAnimationActive={false}
                        wrapperStyle={{ pointerEvents: "none" }}
                      />
                      <Bar dataKey="Deposits" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-4 pt-3.5 border-t border-border-subtle flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-text-muted">Average</p>
                      <p className="data-mono text-xl text-gold leading-tight">{avgDeposits}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-text-muted">Best</p>
                      <p className="data-mono text-xl text-text-primary leading-tight">{bestDeposits}</p>
                    </div>
                  </div>
                </div>
              </div>
            );

            return null;
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
