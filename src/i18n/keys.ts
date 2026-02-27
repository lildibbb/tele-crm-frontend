/**
 * Type-safe translation key constants.
 * Use `K.nav.commandCenter` instead of `"nav.commandCenter"` for IDE autocomplete
 * and compile-time safety.
 *
 * @example
 *   const t = useT();
 *   t(K.nav.broadcasts)  // ✅ autocomplete + typo-safe
 */
export const K = {
  /* ── Navigation ─────────────────────────────────── */
  nav: {
    commandCenter:     "nav.commandCenter",
    leadIntelligence:  "nav.leadIntelligence",
    verificationQueue: "nav.verificationQueue",
    broadcasts:        "nav.broadcasts",
    followUps:         "nav.followUps",
    auditLogs:         "nav.auditLogs",
    analytics:         "nav.analytics",
    settings:          "nav.settings",
    superAdmin:        "nav.superAdmin",
    logout:            "nav.logout",
  },

  /* ── Common ──────────────────────────────────────── */
  common: {
    cancel:     "common.cancel",
    save:       "common.save",
    confirm:    "common.confirm",
    reject:     "common.reject",
    approve:    "common.approve",
    close:      "common.close",
    search:     "common.search",
    loading:    "common.loading",
    refresh:    "common.refresh",
    refreshing: "common.refreshing",
    export:     "common.export",
    exporting:  "common.exporting",
    exportReady:"common.exportReady",
    import:     "common.import",
    viewAll:    "common.viewAll",
    liveData:   "common.liveData",
    live:       "common.live",
    noData:     "common.noData",
    review:     "common.review",
    view:       "common.view",
    prev:       "common.prev",
    next:       "common.next",
    page:       "common.page",
    of:         "common.of",
    clear:      "common.clear",
  },

  /* ── Dashboard ───────────────────────────────────── */
  dashboard: {
    title:         "dashboard.title",
    subtitle:      "dashboard.subtitle",
    refresh:       "dashboard.refresh",
    liveActivity:  "dashboard.liveActivity",
    viewAllLeads:  "dashboard.viewAllLeads",
    funnel: {
      title:  "dashboard.funnel.title",
      period: "dashboard.funnel.period",
      desc:   "dashboard.funnel.desc",
      total:  "dashboard.funnel.total",
    },
    activity: { title: "dashboard.activity.title" },
    trend: {
      title:  "dashboard.trend.title",
      desc:   "dashboard.trend.desc",
      period: "dashboard.trend.period",
    },
    weekly: {
      title: "dashboard.weekly.title",
      desc:  "dashboard.weekly.desc",
      avg:   "dashboard.weekly.avg",
      best:  "dashboard.weekly.best",
    },
    kpi: {
      totalLeads: "dashboard.kpi.totalLeads",
      registered: "dashboard.kpi.registered",
      depositing: "dashboard.kpi.depositing",
      aum:        "dashboard.kpi.aum",
      deltaLeads: "dashboard.kpi.deltaLeads",
      deltaReg:   "dashboard.kpi.deltaReg",
      deltaDep:   "dashboard.kpi.deltaDep",
      deltaAum:   "dashboard.kpi.deltaAum",
    },
    action: {
      pending:     "dashboard.action.pending",
      pendingDesc: "dashboard.action.pendingDesc",
      handover:    "dashboard.action.handover",
      handoverDesc:"dashboard.action.handoverDesc",
      review:      "dashboard.action.review",
      view:        "dashboard.action.view",
    },
    range: {
      "30d":  "dashboard.range.30d",
      "7d":   "dashboard.range.7d",
      month:  "dashboard.range.month",
    },
  },

  /* ── Leads ───────────────────────────────────────── */
  leads: {
    title:    "leads.title",
    subtitle: "leads.subtitle",
    search:   "leads.search",
    showing:  "leads.showing",
    of:       "leads.of",
    page:     "leads.page",
    perPage:  "leads.perPage",
    filter: {
      all:        "leads.filter.all",
      new:        "leads.filter.new",
      registered: "leads.filter.registered",
      proof:      "leads.filter.proof",
      confirmed:  "leads.filter.confirmed",
    },
    col: {
      lead:       "leads.col.lead",
      telegram:   "leads.col.telegram",
      hfm:        "leads.col.hfm",
      phone:      "leads.col.phone",
      status:     "leads.col.status",
      registered: "leads.col.registered",
      balance:    "leads.col.balance",
      handover:   "leads.col.handover",
    },
    import: {
      title:    "leads.import.title",
      drop:     "leads.import.drop",
      or:       "leads.import.or",
      browse:   "leads.import.browse",
      size:     "leads.import.size",
      required: "leads.import.required",
    },
    handover: {
      human: "leads.handover.human",
      bot:   "leads.handover.bot",
    },
  },

  /* ── Lead Detail ─────────────────────────────────── */
  lead: {
    balance:          "lead.balance",
    verify:           "lead.verify",
    edit:             "lead.edit",
    copyLink:         "lead.copyLink",
    copied:           "lead.copied",
    reject:           "lead.reject",
    proof:            "lead.proof",
    history:          "lead.history",
    botControl:       "lead.botControl",
    botActive:        "lead.botActive",
    humanActive:      "lead.humanActive",
    botPaused:        "lead.botPaused",
    clickTakeover:    "lead.clickTakeover",
    replyPlaceholder: "lead.replyPlaceholder",
    replyDisabled:    "lead.replyDisabled",
    replySent:        "lead.replySent",
    verifyDialog: {
      title:   "lead.verify.title",
      confirm: "lead.verify.confirm",
      warning: "lead.verify.warning",
      btn:     "lead.verify.btn",
    },
    rejectDialog: {
      title:       "lead.reject.title",
      desc:        "lead.reject.desc",
      reason:      "lead.reject.reason",
      placeholder: "lead.reject.placeholder",
    },
    editDialog: {
      title: "lead.edit.title",
      hfm:   "lead.edit.hfm",
      email: "lead.edit.email",
      phone: "lead.edit.phone",
    },
    toast: {
      verified: "lead.toast.verified",
      rejected: "lead.toast.rejected",
      copied:   "lead.toast.copied",
      edited:   "lead.toast.edited",
    },
  },

  /* ── Verification ─────────────────────────────────── */
  verification: {
    title:            "verification.title",
    pendingReview:    "verification.pendingReview",
    approve:          "verification.approve",
    reject:           "verification.reject",
    askMore:          "verification.askMore",
    confirmApproval:  "verification.confirmApproval",
    confirmRejection: "verification.confirmRejection",
    clearFilters:     "verification.clearFilters",
    noMatch:          "verification.noMatch",
    notifyUser:       "verification.notifyUser",
    receiptPreview:   "verification.receiptPreview",
    approveDeposit:   "verification.approveDeposit",
    rejectSubmission: "verification.rejectSubmission",
    askMoreInfo:      "verification.askMoreInfo",
    rejectionReason:  "verification.rejectionReason",
    askMorePlaceholder:"verification.askMorePlaceholder",
    send:             "verification.send",
    tabs: {
      pending: "verification.tabs.pending",
      all:     "verification.tabs.all",
    },
    stats: {
      pending:       "verification.stats.pending",
      approvedToday: "verification.stats.approvedToday",
      rejectedToday: "verification.stats.rejectedToday",
    },
  },

  /* ── Analytics ───────────────────────────────────── */
  analytics: {
    title:           "analytics.title",
    subtitle:        "analytics.subtitle",
    conversionRate:  "analytics.conversionRate",
    avgDeposit:      "analytics.avgDeposit",
    totalLeads:      "analytics.totalLeads",
    totalDepositors: "analytics.totalDepositors",
    totalAum:        "analytics.totalAum",
    range: {
      day:   "analytics.range.day",
      week:  "analytics.range.week",
      month: "analytics.range.month",
      "90d": "analytics.range.90d",
    },
    kpi: {
      conversion:  "analytics.kpi.conversion",
      timeDeposit: "analytics.kpi.timeDeposit",
      depositRate: "analytics.kpi.depositRate",
      avgSize:     "analytics.kpi.avgSize",
    },
    deposit: {
      title: "analytics.deposit.title",
      desc:  "analytics.deposit.desc",
    },
    funnel: {
      title: "analytics.funnel.title",
      desc:  "analytics.funnel.desc",
    },
    source: { title: "analytics.source.title" },
    heatmap: {
      title: "analytics.heatmap.title",
      desc:  "analytics.heatmap.desc",
    },
    tabs: {
      day:    "analytics.tabs.day",
      week:   "analytics.tabs.week",
      month:  "analytics.tabs.month",
      days90: "analytics.tabs.days90",
    },
    charts: {
      depositTrend:     "analytics.charts.depositTrend",
      funnelBreakdown:  "analytics.charts.funnelBreakdown",
      leadSources:      "analytics.charts.leadSources",
      conversionFunnel: "analytics.charts.conversionFunnel",
      weeklyHeatmap:    "analytics.charts.weeklyHeatmap",
    },
  },

  /* ── Settings ─────────────────────────────────────── */
  settings: {
    botConfig:      "settings.botConfig",
    knowledgeBase:  "settings.knowledgeBase",
    commands:       "settings.commands",
    team:           "settings.team",
    sessions:       "settings.sessions",
  },

  /* ── Broadcasts ──────────────────────────────────── */
  broadcast: {
    title:           "broadcast.title",
    subtitle:        "broadcast.subtitle",
    compose:         "broadcast.compose",
    message:         "broadcast.message",
    messagePlaceholder: "broadcast.messagePlaceholder",
    photoUrl:        "broadcast.photoUrl",
    photoUrlOptional:"broadcast.photoUrlOptional",
    photoUrlPlaceholder: "broadcast.photoUrlPlaceholder",
    photoCaption:    "broadcast.photoCaption",
    enqueuedFor:     "broadcast.enqueuedFor",
    clear:           "broadcast.clear",
    sending:         "broadcast.sending",
    send:            "broadcast.send",
    history:         "broadcast.history",
    total:           "broadcast.total",
    empty:           "broadcast.empty",
    photoAttached:   "broadcast.photoAttached",
    confirmTitle:    "broadcast.confirmTitle",
    confirmDesc:     "broadcast.confirmDesc",
    sendNow:         "broadcast.sendNow",
    prev:            "broadcast.prev",
    next:            "broadcast.next",
    page:            "broadcast.page",
    of:              "broadcast.of",
    stats: {
      total:      "broadcast.stats.total",
      last7d:     "broadcast.stats.last7d",
      inProgress: "broadcast.stats.inProgress",
      recipients: "broadcast.stats.recipients",
    },
    col: {
      message:    "broadcast.col.message",
      status:     "broadcast.col.status",
      recipients: "broadcast.col.recipients",
      sentAt:     "broadcast.col.sentAt",
    },
  },

  /* ── Follow-ups ──────────────────────────────────── */
  followUp: {
    title:          "followUp.title",
    subtitle:       "followUp.subtitle",
    refresh:        "followUp.refresh",
    empty:          "followUp.empty",
    emptyDesc:      "followUp.emptyDesc",
    failedJob:      "followUp.failedJob",
    failedError:    "followUp.failedError",
    noFailed:       "followUp.noFailed",
    noFailedDesc:   "followUp.noFailedDesc",
    noErrorDetail:  "followUp.noErrorDetail",
    retry:          "followUp.retry",
    cancelTitle:    "followUp.cancelTitle",
    cancelDesc:     "followUp.cancelDesc",
    keep:           "followUp.keep",
    cancelBtn:      "followUp.cancelBtn",
    cancel:         "followUp.cancel",
    prev:           "followUp.prev",
    next:           "followUp.next",
    page:           "followUp.page",
    of:             "followUp.of",
    stats: {
      scheduled: "followUp.stats.scheduled",
      sent:      "followUp.stats.sent",
      cancelled: "followUp.stats.cancelled",
      failed:    "followUp.stats.failed",
    },
    type: {
      register:     "followUp.type.register",
      deposit:      "followUp.type.deposit",
      verification: "followUp.type.verification",
    },
    tabs: {
      scheduled: "followUp.tabs.scheduled",
      failed:    "followUp.tabs.failed",
    },
    col: {
      lead:        "followUp.col.lead",
      type:        "followUp.col.type",
      status:      "followUp.col.status",
      scheduledAt: "followUp.col.scheduledAt",
    },
  },

  /* ── Audit Logs ──────────────────────────────────── */
  auditLog: {
    title:      "auditLog.title",
    subtitle:   "auditLog.subtitle",
    refresh:    "auditLog.refresh",
    search:     "auditLog.search",
    allActions: "auditLog.allActions",
    clear:      "auditLog.clear",
    empty:      "auditLog.empty",
    system:     "auditLog.system",
    prev:       "auditLog.prev",
    next:       "auditLog.next",
    page:       "auditLog.page",
    of:         "auditLog.of",
    stats: {
      total:     "auditLog.stats.total",
      today:     "auditLog.stats.today",
      topAction: "auditLog.stats.topAction",
      actors:    "auditLog.stats.actors",
    },
    col: {
      actor:     "auditLog.col.actor",
      action:    "auditLog.col.action",
      entity:    "auditLog.col.entity",
      details:   "auditLog.col.details",
      timestamp: "auditLog.col.timestamp",
    },
  },

  /* ── Profile ─────────────────────────────────────── */
  profile: {
    title:           "profile.title",
    pageTitle:       "profile.pageTitle",
    subtitle:        "profile.subtitle",
    memberSince:     "profile.memberSince",
    lastLogin:       "profile.lastLogin",
    ip:              "profile.ip",
    changePassword:  "profile.changePassword",
    passwordChanged: "profile.passwordChanged",
    currentPassword: "profile.currentPassword",
    newPassword:     "profile.newPassword",
    confirmPassword: "profile.confirmPassword",
    savePassword:    "profile.savePassword",
    tab: {
      account:  "profile.tab.account",
      sessions: "profile.tab.sessions",
    },
  },

  /* ── Status badges ────────────────────────────────── */
  status: {
    new:          "status.new",
    contacted:    "status.contacted",
    registered:   "status.registered",
    proofPending: "status.proofPending",
    confirmed:    "status.confirmed",
    pending:      "status.pending",
    approved:     "status.approved",
    rejected:     "status.rejected",
  },
} as const;

/** Shorthand alias */
export default K;
