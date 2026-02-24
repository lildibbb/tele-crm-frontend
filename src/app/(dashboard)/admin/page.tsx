"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);

import { useT } from "@/i18n";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Users, Robot, CurrencyDollar, Pulse, PencilSimple, ProhibitInset,
  UserPlus, Export, Gear, ListBullets, House, ShieldStar,
  CheckCircle, ArrowClockwise, ChatText, X, Database,
} from "@phosphor-icons/react";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const users = [
  { id: 1, name: "Ahmad Zulkifli", email: "ahmad@titan.com", role: "owner", status: "active", lastActive: "2m ago", telegramBots: 3 },
  { id: 2, name: "Sarah Lee", email: "sarah@titan.com", role: "admin", status: "active", lastActive: "14m ago", telegramBots: 1 },
  { id: 3, name: "Kevin Tan", email: "kevin@titan.com", role: "staff", status: "active", lastActive: "1h ago", telegramBots: 1 },
  { id: 4, name: "Fatimah Razak", email: "fatimah@titan.com", role: "staff", status: "inactive", lastActive: "3d ago", telegramBots: 0 },
  { id: 5, name: "David Ooi", email: "david@titan.com", role: "admin", status: "active", lastActive: "5m ago", telegramBots: 2 },
];

const botActivity = [
  { day: "Mon", messages: 1240, leads: 38, deposits: 11 },
  { day: "Tue", messages: 1890, leads: 52, deposits: 14 },
  { day: "Wed", messages: 1540, leads: 44, deposits: 9 },
  { day: "Thu", messages: 2100, leads: 67, deposits: 18 },
  { day: "Fri", messages: 1780, leads: 55, deposits: 15 },
  { day: "Sat", messages: 980, leads: 31, deposits: 8 },
  { day: "Sun", messages: 760, leads: 24, deposits: 6 },
];

const auditLog = [
  { id: 1, user: "Ahmad Zulkifli", action: "Approved deposit $500", target: "TG-847291", time: "2m ago", type: "approve" },
  { id: 2, user: "Sarah Lee", action: "Added new team member", target: "Kevin Tan", time: "34m ago", type: "admin" },
  { id: 3, user: "System", action: "Bot restarted", target: "Bot #3", time: "1h ago", type: "system" },
  { id: 4, user: "Ahmad Zulkifli", action: "Exported lead data CSV", target: "1,284 records", time: "2h ago", type: "export" },
  { id: 5, user: "Kevin Tan", action: "Rejected deposit proof", target: "TG-103948", time: "3h ago", type: "reject" },
  { id: 6, user: "System", action: "Daily backup completed", target: "23.4MB", time: "6h ago", type: "system" },
  { id: 7, user: "Sarah Lee", action: "Updated bot config", target: "Welcome message", time: "8h ago", type: "config" },
  { id: 8, user: "David Ooi", action: "Sent manual reply", target: "TG-593827", time: "9h ago", type: "reply" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const auditIcon: Record<string, React.ElementType> = {
  approve: CheckCircle,
  admin: Users,
  system: ArrowClockwise,
  export: Export,
  reject: X,
  config: Gear,
  reply: ChatText,
};

const auditColor: Record<string, string> = {
  approve: "text-[--success]",
  admin: "text-[--info]",
  system: "text-text-secondary",
  export: "text-[--gold]",
  reject: "text-[--danger]",
  config: "text-[--warning]",
  reply: "text-[--crimson]",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent?: "gold" | "crimson" | "success" | "info";
}

function KpiCard({ icon: Icon, label, value, sub, accent }: KpiCardProps) {
  const accentClass: Record<string, string> = {
    gold: "text-[--gold]",
    crimson: "text-[--crimson]",
    success: "text-[--success]",
    info: "text-[--info]",
  };
  const borderClass: Record<string, string> = {
    gold: "border-l-4 border-l-[--gold]",
    crimson: "border-l-4 border-l-[--crimson]",
    success: "border-l-4 border-l-[--success]",
    info: "border-l-4 border-l-[--info]",
  };
  return (
    <Card className={`kpi-card ${accent ? borderClass[accent] : ""}`}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-text-secondary truncate mb-1">{label}</p>
            <p className={`text-2xl font-bold data-mono ${accent ? accentClass[accent] : "text-text-primary"}`}>
              {value}
            </p>
            <p className="text-xs text-text-muted mt-1">{sub}</p>
          </div>
          <div className={`ios-icon shrink-0 ${accent ? accentClass[accent] : "text-text-secondary"}`}>
            <Icon weight="duotone" size={28} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cls: Record<string, string> = {
    owner: "badge badge-owner",
    admin: "badge badge-admin",
    staff: "badge badge-staff",
  };
  return <span className={cls[role] ?? "badge"}>{role}</span>;
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <span className="badge badge-confirmed">Active</span>
  ) : (
    <span className="badge badge-failed">Inactive</span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const t = useT();
  const containerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useGSAP(
    () => {
      gsap.from(".admin-breadcrumb", { opacity: 0, y: -8, duration: 0.4, ease: "power2.out" });
      gsap.from(".kpi-card", {
        opacity: 0, y: 20, scale: 0.97,
        stagger: 0.08, duration: 0.45, ease: "power2.out", delay: 0.1,
      });
      gsap.from(".page-section", {
        opacity: 0, y: 22,
        stagger: 0.1, duration: 0.5, ease: "power2.out", delay: 0.3,
      });
      gsap.from(".quick-action-btn", {
        opacity: 0, scale: 0.93,
        stagger: 0.06, duration: 0.35, ease: "back.out(1.4)", delay: 0.5,
      });
    },
    { scope: containerRef }
  );

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <TooltipProvider>
      <div ref={containerRef} className="space-y-5 p-4 md:p-6">

        {/* Breadcrumb */}
        <div className="admin-breadcrumb">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-1 text-text-secondary hover:text-text-primary">
                  <House size={14} /> Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-1 font-semibold text-text-primary">
                  <ShieldStar size={14} weight="duotone" className="text-[--crimson]" /> Superadmin
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2">
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Superadmin Panel</h1>
            <p className="text-sm text-text-secondary mt-0.5">System-wide control & monitoring</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          <KpiCard
            icon={Users}
            label="Total Users"
            value="5"
            sub="4 active · 1 inactive"
            accent="info"
          />
          <KpiCard
            icon={Robot}
            label="Active Bots"
            value="8"
            sub="All bots running"
            accent="success"
          />
          <KpiCard
            icon={CurrencyDollar}
            label="Monthly Revenue"
            value="$42,500"
            sub="+12% vs last month"
            accent="gold"
          />
          <KpiCard
            icon={Pulse}
            label="System Uptime"
            value="99.97%"
            sub="Last 30 days"
            accent="crimson"
          />
        </div>

        {/* Quick Actions */}
        <div className="page-section flex flex-wrap gap-2">
          <Button size="sm" className="quick-action-btn gap-1.5" variant="default">
            <UserPlus size={15} weight="bold" /> Add User
          </Button>
          <Button size="sm" className="quick-action-btn gap-1.5" variant="outline">
            <Export size={15} weight="bold" /> Export Data
          </Button>
          <Button size="sm" className="quick-action-btn gap-1.5" variant="outline">
            <Gear size={15} weight="bold" /> System Config
          </Button>
          <Button size="sm" className="quick-action-btn gap-1.5" variant="outline">
            <ListBullets size={15} weight="bold" /> View Logs
          </Button>
        </div>

        {/* Main Grid: User Management + Audit Log */}
        <div className="page-section grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* User Management — 2 cols */}
          <Card className="xl:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Users size={18} weight="duotone" className="text-[--info]" /> User Management
                  </CardTitle>
                  <CardDescription className="mt-0.5">Manage team members and permissions</CardDescription>
                </div>
                <Button size="sm" className="gap-1.5 shrink-0">
                  <UserPlus size={14} weight="bold" /> Add User
                </Button>
              </div>
              <Separator className="mt-3" />
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Input
                  placeholder="Search name or email…"
                  className="h-8 text-sm flex-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-8 text-sm w-full sm:w-36">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle">
                      <TableHead className="text-text-secondary text-xs pl-4">Name</TableHead>
                      <TableHead className="text-text-secondary text-xs hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-text-secondary text-xs">Role</TableHead>
                      <TableHead className="text-text-secondary text-xs">Status</TableHead>
                      <TableHead className="text-text-secondary text-xs hidden sm:table-cell">Last Active</TableHead>
                      <TableHead className="text-text-secondary text-xs hidden lg:table-cell">Bots</TableHead>
                      <TableHead className="text-text-secondary text-xs text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border-subtle hover:bg-bg-elevated transition-colors">
                        <TableCell className="pl-4 py-3">
                          <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <p className="text-xs text-text-secondary data-mono">{user.email}</p>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-xs text-text-muted">{user.lastActive}</p>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="text-xs text-text-secondary data-mono text-center">{user.telegramBots}</p>
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-text-secondary hover:text-text-primary">
                                  <PencilSimple size={14} weight="bold" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit user</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-text-secondary hover:text-[--danger]">
                                  <ProhibitInset size={14} weight="bold" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Suspend user</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-text-muted text-sm">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border-subtle pt-3 pb-3">
              <p className="text-xs text-text-muted">{filteredUsers.length} of {users.length} users shown</p>
            </CardFooter>
          </Card>

          {/* Audit Log — 1 col */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Database size={18} weight="duotone" className="text-[--warning]" /> Audit Log
              </CardTitle>
              <CardDescription>Recent system events</CardDescription>
              <Separator className="mt-3" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ScrollArea className="h-[320px] pr-2">
                <div className="space-y-1">
                  {auditLog.map((entry, idx) => {
                    const IconComp = auditIcon[entry.type] ?? Pulse;
                    const colorCls = auditColor[entry.type] ?? "text-text-secondary";
                    return (
                      <div key={entry.id}>
                        <div className="flex items-start gap-2.5 py-2">
                          <div className={`mt-0.5 shrink-0 ${colorCls}`}>
                            <IconComp size={15} weight="duotone" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-text-primary leading-tight">{entry.action}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-text-secondary">{entry.user}</span>
                              <span className="text-[10px] text-text-muted">·</span>
                              <span className="text-[11px] text-text-muted data-mono">{entry.target}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-text-muted shrink-0 whitespace-nowrap">{entry.time}</p>
                        </div>
                        {idx < auditLog.length - 1 && <Separator className="opacity-50" />}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Bot Performance Chart */}
        <Card className="page-section chart-card">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Robot size={18} weight="duotone" className="text-[--success]" /> Bot Performance
                </CardTitle>
                <CardDescription>Activity over the last 7 days</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Live updates</span>
                <Switch defaultChecked />
              </div>
            </div>
            <Separator className="mt-3" />
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={botActivity} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--crimson)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--crimson)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-secondary, #888)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary, #888)" }} axisLine={false} tickLine={false} />
                <RechartTooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card, #1a1a2e)",
                    border: "1px solid var(--border-default, #333)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--text-primary, #fff)", fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="var(--crimson)" strokeWidth={2} fill="url(#gradMessages)" dot={false} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="var(--gold)" strokeWidth={2} fill="url(#gradLeads)" dot={false} />
                <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#22d3a0" strokeWidth={2} fill="url(#gradDeposits)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
}