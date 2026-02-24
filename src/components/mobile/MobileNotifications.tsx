"use client";

import React, { useState } from "react";
import {
  Bell,
  UserPlus,
  CurrencyDollar,
  ShieldCheck,
  XCircle,
  Users,
  Database,
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
    iconColor: "#60A5FA",
    iconBg: "#60A5FA1A",
    title: "New lead registered",
    body: "Muhammad Hafiz registered via Telegram",
    time: "2h ago",
  },
  {
    id: "n2",
    read: false,
    category: "verification",
    Icon: CurrencyDollar,
    iconColor: "#F59E0B",
    iconBg: "#F59E0B1A",
    title: "Deposit reported",
    body: "Siti Aminah submitted $800 deposit receipt",
    time: "4h ago",
  },
  {
    id: "n3",
    read: false,
    category: "verification",
    Icon: ShieldCheck,
    iconColor: "#22D3A0",
    iconBg: "#22D3A01A",
    title: "Verification approved",
    body: "Lead #TJ-1279 deposit confirmed",
    time: "5h ago",
  },
  {
    id: "n4",
    read: true,
    category: "verification",
    Icon: XCircle,
    iconColor: "#EF4444",
    iconBg: "#EF44441A",
    title: "Deposit rejected",
    body: "Lead #TJ-1277 rejected — poor image quality",
    time: "Yesterday",
  },
  {
    id: "n5",
    read: true,
    category: "leads",
    Icon: Users,
    iconColor: "#8888AA",
    iconBg: "#8888AA1A",
    title: "New team member",
    body: "Ahmad Razali added as Staff",
    time: "Jan 20",
  },
  {
    id: "n6",
    read: true,
    category: "system",
    Icon: Database,
    iconColor: "#60A5FA",
    iconBg: "#60A5FA1A",
    title: "KB processing complete",
    body: "knowledge-base-jan.pdf indexed",
    time: "Jan 19",
  },
];

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "leads", label: "Leads" },
  { id: "verification", label: "Verification" },
  { id: "system", label: "System" },
];

// ── Notification Row ───────────────────────────────────────────────────────────
function NotifRow({
  notif,
  onClick,
}: {
  notif: NotificationItem;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 w-full min-h-[64px] px-4 py-3 text-left transition-colors",
        notif.read
          ? "bg-[#141422]"
          : "bg-[#1C1C2E] border-l-[3px] border-l-[#C4232D]",
      )}
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: notif.iconBg }}
      >
        <notif.Icon
          size={20}
          style={{ color: notif.iconColor }}
          weight="fill"
        />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-sans font-semibold text-[14px] text-[#F0F0FF] leading-snug">
          {notif.title}
        </div>
        <div className="font-sans text-[13px] text-[#8888AA] mt-0.5 line-clamp-2 leading-snug">
          {notif.body}
        </div>
      </div>
      <span className="font-mono text-[11px] text-[#555570] shrink-0 mt-1">
        {notif.time}
      </span>
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-8">
      <Bell size={64} weight="fill" className="text-[#555570]" />
      <span className="font-display font-bold text-[20px] text-[#F0F0FF]">
        All caught up!
      </span>
      <span className="font-sans text-[14px] text-[#555570]">
        No new notifications
      </span>
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

  const filtered =
    filter === "all" ? items : items.filter((n) => n.category === filter);
  const unreadCount = items.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  // Group by date (simplified: today / yesterday / older)
  const todayItems = filtered.filter((n) =>
    ["2h ago", "4h ago", "5h ago"].includes(n.time),
  );
  const earlierItems = filtered.filter(
    (n) => !["2h ago", "4h ago", "5h ago"].includes(n.time),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#080810] text-[#F0F0FF] font-sans">
      <div className="pt-[env(safe-area-inset-top)]" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 h-[52px] bg-[#0E0E1A] border-b border-[#2A2A42]">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-[#F0F0FF]" />
          <span className="font-sans font-semibold text-[17px] text-[#F0F0FF]">
            Notifications
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="font-sans text-[13px] text-[#C4232D] min-h-[44px] px-2"
          >
            Mark all read
          </button>
        )}
      </header>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-3 pb-2">
        {FILTER_TABS.map((tab) => {
          const isActive = filter === tab.id;
          const badgeCount =
            tab.id === "verification"
              ? items.filter((n) => !n.read && n.category === "verification")
                  .length
              : 0;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-1 rounded-full h-7 px-3 font-sans text-[12px] font-medium transition-colors",
                isActive
                  ? "bg-[#C4232D1A] text-[#C4232D]"
                  : "bg-[#141422] text-[#8888AA] border border-[#2A2A42]",
              )}
            >
              {tab.label}
              {badgeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#C4232D] font-mono text-[9px] text-white flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {todayItems.length > 0 && (
              <div>
                <div className="px-4 py-2 font-sans font-semibold text-[11px] text-[#555570] uppercase tracking-wider">
                  Today
                </div>
                {todayItems.map((notif, idx) => (
                  <React.Fragment key={notif.id}>
                    <NotifRow
                      notif={notif}
                      onClick={() => {
                        setItems((prev) =>
                          prev.map((n) =>
                            n.id === notif.id ? { ...n, read: true } : n,
                          ),
                        );
                        onNotificationClick?.(notif.id);
                      }}
                    />
                    {idx < todayItems.length - 1 && (
                      <div className="ml-[56px] border-b border-[#2A2A42]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            {earlierItems.length > 0 && (
              <div>
                <div className="px-4 py-2 font-sans font-semibold text-[11px] text-[#555570] uppercase tracking-wider mt-2">
                  Earlier
                </div>
                {earlierItems.map((notif, idx) => (
                  <React.Fragment key={notif.id}>
                    <NotifRow
                      notif={notif}
                      onClick={() => {
                        setItems((prev) =>
                          prev.map((n) =>
                            n.id === notif.id ? { ...n, read: true } : n,
                          ),
                        );
                        onNotificationClick?.(notif.id);
                      }}
                    />
                    {idx < earlierItems.length - 1 && (
                      <div className="ml-[56px] border-b border-[#2A2A42]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
