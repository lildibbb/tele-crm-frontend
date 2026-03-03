"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useT, K } from "@/i18n";
import {
  useSuperadminUsers,
  useSuperadminRagStats,
  useSuperadminQueues,
  useSuperadminTokenUsage,
  useSuperadminKbHealth,
  useSuperadminSystemHealth,
} from "@/queries/useSuperadminQuery";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle,
  Brain,
  Lightning,
  Pulse,
} from "@phosphor-icons/react";

// ─── KPI Tile ────────────────────────────────────────────────────────────────

interface KpiTileProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  accent: "info" | "success" | "gold" | "crimson";
  loading?: boolean;
}

const ACCENT_COLORS: Record<
  string,
  { bg: string; text: string; grad: string }
> = {
  info: {
    bg: "bg-info/10",
    text: "text-info",
    grad: "color-mix(in srgb, var(--color-info) 9%, transparent)",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    grad: "color-mix(in srgb, var(--color-success) 9%, transparent)",
  },
  gold: {
    bg: "bg-[--gold]/10",
    text: "text-[--gold]",
    grad: "color-mix(in srgb, var(--color-gold) 9%, transparent)",
  },
  crimson: {
    bg: "bg-[--crimson]/10",
    text: "text-[--crimson]",
    grad: "color-mix(in srgb, var(--color-crimson) 9%, transparent)",
  },
};

function KpiTile({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  loading,
}: KpiTileProps) {
  const { bg, text, grad } = ACCENT_COLORS[accent];
  return (
    <div
      className="kpi-tile bg-elevated rounded-xl p-5"
      style={{
        backgroundImage: `linear-gradient(135deg, ${grad} 0%, transparent 65%)`,
      }}
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-text-secondary mb-1.5">{label}</p>
            <p className={`text-2xl font-bold data-mono ${text}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1.5">{sub}</p>
          </div>
          <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
            <Icon className={text} weight="duotone" size={22} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

export function OverviewPanel() {
  const t = useT();
  const { data: users = [], isLoading: isLoadingUsers } = useSuperadminUsers();
  const { data: ragStats, isLoading: isLoadingRag } = useSuperadminRagStats();
  const { data: queues, isLoading: isLoadingQueues } = useSuperadminQueues();
  const { data: tokenUsage, isLoading: isLoadingTokenUsage } =
    useSuperadminTokenUsage();
  const { data: kbHealth, isLoading: isLoadingKbHealth } =
    useSuperadminKbHealth();
  const { data: systemHealth, isLoading: isLoadingSystemHealth } =
    useSuperadminSystemHealth();
  const isLoadingOps =
    isLoadingQueues || isLoadingTokenUsage || isLoadingKbHealth;

  const activeUsers = users.filter((u) => u.isActive).length;
  const ragHitRate = ragStats
    ? `${(ragStats.ragHitRate ?? 0).toFixed(1)}%`
    : "—";
  const ragTokens = ragStats
    ? `${(((ragStats.totalPromptTokens ?? 0) + (ragStats.totalCompletionTokens ?? 0)) / 1000).toFixed(1)}k`
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          {t(K.superadmin.overview.title)}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t(K.superadmin.overview.subtitle)}
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <KpiTile
          icon={Users}
          label={t(K.superadmin.overview.totalUsers)}
          value={isLoadingUsers ? "—" : users.length}
          sub={
            isLoadingUsers
              ? "Loading…"
              : t(K.superadmin.overview.activeInactive, {
                  active: String(activeUsers),
                  inactive: String(users.length - activeUsers),
                })
          }
          accent="info"
          loading={isLoadingUsers}
        />
        <KpiTile
          icon={CheckCircle}
          label={t(K.superadmin.overview.activeUsers)}
          value={isLoadingUsers ? "—" : activeUsers}
          sub={t(K.superadmin.overview.currentlyEnabled)}
          accent="success"
          loading={isLoadingUsers}
        />
        <KpiTile
          icon={Brain}
          label={t(K.superadmin.overview.ragHitRate)}
          value={ragHitRate}
          sub={
            ragStats
              ? t(K.superadmin.overview.totalRequests, {
                  count: String(ragStats.totalRequests ?? 0),
                })
              : "Loading…"
          }
          accent="gold"
          loading={isLoadingRag}
        />
        <KpiTile
          icon={Lightning}
          label={t(K.superadmin.overview.aiTokensUsed)}
          value={ragTokens}
          sub={
            ragStats
              ? t(K.superadmin.overview.avgChunksReply, {
                  count: String((ragStats.avgChunksPerRequest ?? 0).toFixed(1)),
                })
              : "Loading…"
          }
          accent="crimson"
          loading={isLoadingRag}
        />
      </div>

      {/* ── Ops Dashboard — Bot Health + Queue Monitor + Token Budget + KB Health ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Bot Health */}
        <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-text-primary">
              {t(K.superadminOps.botHealth)}
            </span>
            <div
              className={`w-2 h-2 rounded-full ${ragStats ? "bg-emerald-400" : "bg-text-muted"}`}
            />
          </div>
          <div className="space-y-1.5 text-[11px] font-sans">
            {isLoadingRag ? (
              <Skeleton className="h-[2px] w-full" />
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-text-muted text-[11px]">
                    {t(K.superadminOps.pendingUpdates)}
                  </span>
                  <span className="data-mono text-text-primary">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted text-[11px]">
                    {t(K.superadminOps.lastError)}
                  </span>
                  <span className="text-emerald-400">
                    {t(K.superadminOps.noError)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Queue Monitor */}
        <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-text-primary">
              {t(K.superadminOps.queues)}
            </span>
            {isLoadingOps && (
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          {isLoadingOps && !queues ? (
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : queues ? (
            <div className="space-y-1">
              {queues.queues.map((q) => (
                <div
                  key={q.name}
                  className="flex items-center justify-between text-[10px] font-sans"
                >
                  <span className="text-text-muted truncate max-w-[80px]">
                    {q.name}
                  </span>
                  <div className="flex gap-1.5">
                    <span className="text-text-muted">
                      {t(K.superadminOps.waiting)}{" "}
                      <span className="data-mono text-text-primary">
                        {q.waiting}
                      </span>
                    </span>
                    {q.failed > 0 && (
                      <span className="text-red-400 data-mono font-bold">
                        {q.failed}F
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-text-muted font-sans">—</span>
          )}
        </div>

        {/* Token Budget */}
        <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-text-primary">
              {t(K.superadminOps.tokenBudget)}
            </span>
          </div>
          {isLoadingOps && !tokenUsage ? (
            <Skeleton className="h-16 w-full" />
          ) : tokenUsage ? (
            <>
              <div className="text-[11px] font-sans space-y-0.5 mb-2">
                <div className="flex justify-between">
                  <span className="text-text-muted">
                    {t(K.superadminOps.rolling30d)}
                  </span>
                  <span className="data-mono text-text-primary">
                    {tokenUsage.rolling30dTokens.toLocaleString()}{" "}
                    {t(K.superadminOps.tokens)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">
                    {t(K.superadminOps.estimatedCost)}
                  </span>
                  <span className="data-mono text-gold">
                    ${tokenUsage.rolling30dCostUsd.toFixed(4)}
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={36}>
                <AreaChart
                  data={tokenUsage.daily}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="var(--color-crimson)"
                    fill="var(--color-crimson)"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <span className="text-[11px] text-text-muted font-sans">—</span>
          )}
        </div>

        {/* KB Health */}
        <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-text-primary">
              {t(K.superadminOps.kbHealth)}
            </span>
          </div>
          {isLoadingOps && !kbHealth ? (
            <Skeleton className="h-12 w-full" />
          ) : kbHealth ? (
            <div className="space-y-2">
              <div className="text-[11px] font-sans">
                <div className="flex justify-between mb-1">
                  <span className="text-text-muted">
                    {t(K.superadminOps.embeddingCoverage)}
                  </span>
                  <span className="data-mono text-text-primary">
                    {kbHealth.embeddingCoverage.embedded}/
                    {kbHealth.embeddingCoverage.total}{" "}
                    {t(K.superadminOps.chunksEmbedded)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-void/40">
                  <div
                    className="h-1.5 rounded-full bg-crimson"
                    style={{
                      width:
                        kbHealth.embeddingCoverage.total > 0
                          ? `${(kbHealth.embeddingCoverage.embedded / kbHealth.embeddingCoverage.total) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(kbHealth.byStatus).map(([status, count]) => (
                  <span
                    key={status}
                    className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-accent/10 text-text-muted"
                  >
                    {status}: {count}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-[11px] text-text-muted font-sans">—</span>
          )}
        </div>

        {/* System Health */}
        <div className="bg-elevated rounded-xl p-4 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans font-semibold text-[13px] text-text-primary flex items-center gap-1.5">
              <Pulse size={14} weight="duotone" className="text-info" />
              {t(K.superadmin.overview.systemHealth)}
            </span>
            {systemHealth && (
              <span
                className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded-full ${
                  systemHealth.status === "ok"
                    ? "bg-emerald-400/15 text-emerald-400"
                    : systemHealth.status === "degraded"
                      ? "bg-amber-400/15 text-amber-400"
                      : "bg-red-400/15 text-red-400"
                }`}
              >
                {systemHealth.status === "ok"
                  ? t(K.superadmin.overview.operational)
                  : systemHealth.status === "degraded"
                    ? t(K.superadmin.overview.degraded)
                    : t(K.superadmin.overview.down)}
              </span>
            )}
          </div>
          {isLoadingSystemHealth && !systemHealth ? (
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : systemHealth ? (
            <div className="space-y-1.5">
              {systemHealth.checks.map((check) => (
                <div
                  key={check.name}
                  className="flex items-center justify-between text-[11px] font-sans"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        check.status === "ok"
                          ? "bg-emerald-400"
                          : check.status === "degraded"
                            ? "bg-amber-400"
                            : "bg-red-400"
                      }`}
                    />
                    <span className="text-text-secondary capitalize">
                      {check.name}
                    </span>
                  </div>
                  {check.latencyMs !== undefined && (
                    <span className="data-mono text-text-muted">
                      {check.latencyMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[11px] text-text-muted font-sans">—</span>
          )}
        </div>
      </div>

      {/* ── RAG AI Performance ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {ragStats ? (
          <div
            className="page-panel bg-elevated rounded-xl p-5 xl:col-span-1"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 7%, transparent) 0%, transparent 60%)",
            }}
          >
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-5">
              <Brain size={16} weight="duotone" className="text-[--gold]" />
              {t(K.superadmin.overview.ragPerformance)}
            </h2>
            <div className="space-y-4">
              {[
                {
                  label: t(K.superadmin.overview.hitRate),
                  value: `${(ragStats.ragHitRate ?? 0).toFixed(1)}%`,
                  sub: t(K.superadmin.overview.queriesMatchedKb),
                  color: "text-success",
                },
                {
                  label: t(K.superadmin.overview.avgChunks),
                  value: (ragStats.avgChunksPerRequest ?? 0).toFixed(2),
                  sub: t(K.superadmin.overview.perReply),
                  color: "text-info",
                },
                {
                  label: t(K.superadmin.overview.zeroHitQueries),
                  value: String(ragStats.zeroHitCount ?? 0),
                  sub: t(K.superadmin.overview.noKbMatch),
                  color: "text-danger",
                },
                {
                  label: t(K.superadmin.overview.totalAiTokens),
                  value: `${(((ragStats.totalPromptTokens ?? 0) + (ragStats.totalCompletionTokens ?? 0)) / 1000).toFixed(1)}k`,
                  sub: t(K.superadmin.overview.cumulativeUsage),
                  color: "text-[--gold]",
                },
              ].map(({ label, value, sub, color }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="text-xs text-text-secondary leading-tight">
                      {label}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>
                  </div>
                  <p
                    className={`text-lg font-bold data-mono shrink-0 ${color}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="page-panel bg-elevated rounded-xl p-5 xl:col-span-1">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
