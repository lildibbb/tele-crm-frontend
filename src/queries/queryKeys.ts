export const queryKeys = {
  leads: {
    all: ["leads"] as const,
    list: (params: Record<string, unknown>) =>
      ["leads", "list", params] as const,
    detail: (id: string) => ["leads", "detail", id] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    summary: (params: Record<string, unknown>) =>
      ["analytics", "summary", params] as const,
    dashboard: () => ["analytics", "dashboard"] as const,
    today: () => ["analytics", "today"] as const,
    weekly: (params?: Record<string, unknown>) =>
      ["analytics", "weekly", params] as const,
    monthly: (params?: Record<string, unknown>) =>
      ["analytics", "monthly", params] as const,
    velocity: () => ["analytics", "velocity"] as const,
    ragStats: (params?: Record<string, unknown>) =>
      ["analytics", "ragStats", params] as const,
  },
  broadcasts: {
    all: ["broadcasts"] as const,
    history: (params: Record<string, unknown>) =>
      ["broadcasts", "history", params] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
    invitations: () => ["users", "invitations"] as const,
  },
  auditLogs: {
    all: ["auditLogs"] as const,
    list: (params?: Record<string, unknown>) =>
      ["auditLogs", "list", params] as const,
  },
  verification: {
    all: ["verification"] as const,
  },
  kb: {
    all: ["kb"] as const,
    list: () => ["kb", "list"] as const,
    active: () => ["kb", "active"] as const,
  },
  backup: {
    all: ["backup"] as const,
    history: (limit?: number) => ["backup", "history", limit] as const,
  },
  secrets: {
    all: ["secrets"] as const,
    list: () => ["secrets", "list"] as const,
  },
  superadmin: {
    all: ["superadmin"] as const,
    users: () => ["superadmin", "users"] as const,
    ragStats: (params?: Record<string, unknown>) =>
      ["superadmin", "ragStats", params] as const,
    queues: () => ["superadmin", "queues"] as const,
    sessions: () => ["superadmin", "sessions"] as const,
    tokenUsage: () => ["superadmin", "tokenUsage"] as const,
    kbHealth: () => ["superadmin", "kbHealth"] as const,
    systemHealth: () => ["superadmin", "system-health"] as const,
  },
  systemConfig: {
    all: ["systemConfig"] as const,
    entries: () => ["systemConfig", "entries"] as const,
  },
  googleAnalytics: {
    all: ["googleAnalytics"] as const,
    stats: () => ["googleAnalytics", "stats"] as const,
  },
  googleOAuth2: {
    all: ["googleOAuth2"] as const,
    status: () => ["googleOAuth2", "status"] as const,
  },
  maintenance: {
    all: ["maintenance"] as const,
    publicConfig: () => ["maintenance", "publicConfig"] as const,
  },
  bot: {
    all: ["bot"] as const,
    status: () => ["bot", "status"] as const,
  },
} as const;
