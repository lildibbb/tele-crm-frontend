"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Bell,
  UserPlus,
  CurrencyDollar,
  ShieldCheck,
  XCircle,
  Users,
  Database,
  CheckCircle,
  BellSlash,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: string;
  Icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  category: "leads" | "verification" | "system";
}

export interface MobileNotificationsProps {
  readonly notifications?: NotificationItem[];
  readonly onMarkAllRead?: () => void;
  readonly onNotificationClick?: (id: string) => void;
}

type FilterTab = "all" | "leads" | "verification" | "system";

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    read: false,
    category: "leads",
    Icon: UserPlus,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "New lead registered",
    body: "Muhammad Hafiz registered via Telegram",
    time: "2h ago",
  },
  {
    id: "n2",
    read: false,
    category: "verification",
    Icon: CurrencyDollar,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "Deposit reported",
    body: "Siti Aminah submitted $800 deposit receipt",
    time: "4h ago",
  },
  {
    id: "n3",
    read: false,
    category: "verification",
    Icon: ShieldCheck,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "Verification approved",
    body: "Lead #TJ-1279 deposit confirmed",
    time: "5h ago",
  },
  {
    id: "n4",
    read: true,
    category: "verification",
    Icon: XCircle,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "Deposit rejected",
    body: "Lead #TJ-1277 rejected — poor image quality",
    time: "Yesterday",
  },
  {
    id: "n5",
    read: true,
    category: "leads",
    Icon: Users,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "New team member",
    body: "Ahmad Razali added as Staff",
    time: "Jan 20",
  },
  {
    id: "n6",
    read: true,
    category: "system",
    Icon: Database,
    iconColor: "text-text-secondary",
    iconBg: "bg-elevated",
    title: "KB processing complete",
    body: "knowledge-base-jan.pdf indexed",
    time: "Jan 19",
  },
];

const FILTER_TABS: { id: FilterTab; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Bell },
  { id: "leads", label: "Leads", icon: UserPlus },
  { id: "verification", label: "Verification", icon: ShieldCheck },
  { id: "system", label: "System", icon: Database },
];

// ── Date grouping helpers ──────────────────────────────────────────────────────
type DateGroup = "Today" | "Yesterday" | "Earlier";

function classifyTime(time: string): DateGroup {
  const t = time.toLowerCase();
  if (t.includes("ago")) return "Today";
  if (t === "yesterday") return "Yesterday";
  return "Earlier";
}

function groupByDate(items: NotificationItem[]): { label: DateGroup; items: NotificationItem[] }[] {
  const groups: Record<DateGroup, NotificationItem[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };
  for (const item of items) {
    groups[classifyTime(item.time)].push(item);
  }
  const order: DateGroup[] = ["Today", "Yesterday", "Earlier"];
  return order.filter((l) => groups[l].length > 0).map((l) => ({ label: l, items: groups[l] }));
}

// ── Notification Card ──────────────────────────────────────────────────────────
function NotificationCard({
  notif,
  onClick,
  isLast,
}: {
  notif: NotificationItem;
  onClick: () => void;
  isLast: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 w-full text-left",
        "min-h-[68px] px-4 py-3.5",
        "transition-all duration-200 active:scale-[0.985]",
        notif.read
          ? "bg-card"
          : "bg-elevated/50",
      )}
    >
      {/* Unread dot indicator */}
      {!notif.read && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-crimson"
          style={{ boxShadow: "0 0 6px var(--crimson-glow)" }}
        />
      )}

      {/* Icon circle */}
      <span
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          "ring-1 ring-border-subtle/50 transition-shadow",
          notif.iconBg,
        )}
      >
        <notif.Icon
          size={20}
          className={notif.iconColor}
          weight="fill"
        />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div
          className={cn(
            "font-sans text-[14px] leading-snug",
            notif.read
              ? "font-medium text-text-secondary"
              : "font-semibold text-text-primary",
          )}
        >
          {notif.title}
        </div>
        <div className="font-sans text-[13px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
          {notif.body}
        </div>
        <span className="font-mono text-[11px] text-text-muted mt-1 inline-block">
          {notif.time}
        </span>
      </div>

      {/* Inset divider */}
      {!isLast && (
        <span className="absolute bottom-0 left-[68px] right-4 h-px bg-border-subtle/60" />
      )}
    </button>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-void/90 backdrop-blur-sm border-b border-border-subtle/40">
      <span className="font-sans font-semibold text-[11px] text-text-muted uppercase tracking-widest">
        {label}
      </span>
      <span className="font-mono text-[10px] text-text-muted tabular-nums">
        {count}
      </span>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ filterLabel }: { filterLabel: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center bg-elevated"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <BellSlash size={32} weight="duotone" className="text-text-muted" />
      </div>
      <div className="space-y-1">
        <p className="font-sans font-bold text-[18px] text-text-primary">
          All caught up!
        </p>
        <p className="font-sans text-[14px] text-text-muted leading-relaxed">
          {filterLabel === "All"
            ? "No notifications to show"
            : `No ${filterLabel.toLowerCase()} notifications`}
        </p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function MobileNotifications({
  notifications,
  onMarkAllRead,
  onNotificationClick,
}: MobileNotificationsProps) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [items, setItems] = useState<NotificationItem[]>(
    notifications ?? MOCK_NOTIFICATIONS,
  );

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((n) => n.category === filter)),
    [filter, items],
  );
  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);
  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  const activeTabLabel = FILTER_TABS.find((t) => t.id === filter)?.label ?? "All";

  const handleMarkAll = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
  }, [onMarkAllRead]);

  const handleNotifClick = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      onNotificationClick?.(id);
    },
    [onNotificationClick],
  );

  return (
    <div className="flex flex-col min-h-screen bg-void text-text-primary font-sans">
      {/* Safe area top */}
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 bg-base/95 backdrop-blur-md border-b border-border-subtle"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center justify-between px-4 h-[56px]">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell size={22} weight="fill" className="text-text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-crimson font-mono text-[10px] text-white flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <h1 className="font-sans font-bold text-[18px] text-text-primary tracking-tight">
              Notifications
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className={cn(
                "flex items-center gap-1.5 font-sans text-[13px] font-medium text-crimson",
                "min-h-[44px] min-w-[44px] px-3 rounded-lg",
                "transition-colors active:bg-crimson-subtle",
              )}
            >
              <CheckCircle size={16} weight="bold" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* ── Filter Chips ────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            const tabUnread =
              tab.id === "all"
                ? unreadCount
                : items.filter((n) => !n.read && n.category === tab.id).length;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-full min-h-[36px] px-3.5",
                  "font-sans text-[13px] font-medium",
                  "transition-all duration-200",
                  isActive
                    ? "bg-crimson/15 text-crimson shadow-sm"
                    : "bg-card text-text-secondary border border-border-subtle active:bg-elevated",
                )}
              >
                <TabIcon size={14} weight={isActive ? "fill" : "regular"} />
                <span>{tab.label}</span>
                {tabUnread > 0 && (
                  <span
                    className={cn(
                      "min-w-[18px] h-[18px] px-1 rounded-full font-mono text-[10px] flex items-center justify-center leading-none",
                      isActive
                        ? "bg-crimson/20 text-crimson"
                        : "bg-crimson/10 text-crimson",
                    )}
                  >
                    {tabUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Notification List ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        {filtered.length === 0 ? (
          <EmptyState filterLabel={activeTabLabel} />
        ) : (
          <div className="pb-6">
            {sections.map((section) => (
              <div key={section.label}>
                <SectionHeader label={section.label} count={section.items.length} />
                <div
                  className="mx-3 rounded-xl overflow-hidden"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  {section.items.map((notif, idx) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      isLast={idx === section.items.length - 1}
                      onClick={() => handleNotifClick(notif.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

