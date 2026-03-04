# Mobile/Desktop Parity Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 10 critical gaps where mobile components do not match their desktop counterparts — covering KPI alignment, missing features, broken buttons, and UI/UX improvements.

**Architecture:** Each fix is surgical — touch only the minimum code required. All mobile components follow the existing card/sheet patterns with Phosphor icons, TanStack Query hooks, and DESIGN.md tokens. No new libraries introduced.

**Tech Stack:** Next.js 14 App Router, TanStack Query, Zustand, @phosphor-icons/react, shadcn/ui (Sheet, Dialog, Switch), Tailwind CSS, date-fns-tz / Intl API

---

## 🔍 Audit Summary

### Files in scope
| File | Issues |
|---|---|
| `src/components/mobile/OwnerHome.tsx` | Wrong KPI labels, broken Verify button, Add Lead FAB should be removed |
| `src/components/mobile/StaffHome.tsx` | KPI labels might need review |
| `src/components/mobile/MobileAnalytics.tsx` | Wrong KPI labels, missing 3 period options |
| `src/components/mobile/MobileLeadsList.tsx` | Missing Export XLSX button |
| `src/components/mobile/MobileLeadDetail.tsx` | No chat history, image viewer is placeholder |
| `src/components/mobile/MobileProfile.tsx` | Remove broken Edit Profile row, expand timezone list |
| `src/app/(dashboard)/page.tsx` | OwnerHome rendered without props — callbacks not wired |

---

## Task 1: Fix OwnerHome KPI Labels

**Problem:** Mobile shows wrong labels:
- "Verified" → should be **"Pending Verifications"** (it uses `formSubmissions.current`)
- "Deposits" → should be **"Total Depositors"** (it uses `verifiedClients.current`)
- "Conversion" (calculated) → desktop doesn't show this, replace with **"Contacted Leads"** (`contactedLeads.current`)

**Desktop KPIs** (src/app/(dashboard)/page.tsx lines 242-247):
1. "Total Leads" → `totalLeads.current`
2. "Contacted Leads" → `contactedLeads.current`
3. "Total Depositors" → `verifiedClients.current` (gold highlighted)
4. "Pending Verifications" → `formSubmissions.current`

**Files:**
- Modify: `src/components/mobile/OwnerHome.tsx`

**Step 1: Find the KPI card array**
Look for `kpi?.formSubmissions`, `kpi?.verifiedClients`, conversion calculation.

**Step 2: Replace KPI definitions**
```tsx
// BEFORE (wrong):
const cards = [
  { label: "Total Leads", value: kpi?.totalLeads?.current ?? 0, ... },
  { label: "Verified", value: kpi?.formSubmissions?.current ?? 0, ... },
  { label: "Deposits", value: kpi?.verifiedClients?.current ?? 0, ... },
  { label: "Conversion", value: convRate, suffix: "%", ... },
];

// AFTER (matches desktop exactly):
const cards = [
  { label: "Total Leads", value: kpi?.totalLeads?.current ?? 0, trend: kpi?.totalLeads?.trend, change: kpi?.totalLeads?.changePercentage, icon: Users, ... },
  { label: "Contacted Leads", value: kpi?.contactedLeads?.current ?? 0, trend: kpi?.contactedLeads?.trend, change: kpi?.contactedLeads?.changePercentage, icon: ChatCircleDots, ... },
  { label: "Total Depositors", value: kpi?.verifiedClients?.current ?? 0, trend: kpi?.verifiedClients?.trend, change: kpi?.verifiedClients?.changePercentage, icon: Wallet, highlight: true, ... },
  { label: "Pending Verifications", value: kpi?.formSubmissions?.current ?? 0, trend: kpi?.formSubmissions?.trend, change: kpi?.formSubmissions?.changePercentage, icon: ClockCounterClockwise, ... },
];
```

---

## Task 2: Wire Verify Button in OwnerHome

**Problem:** `onVerificationBanner` prop is never passed — desktop renders `<OwnerHome />` with no props (page.tsx line ~210). Clicking Verify does nothing.

**Fix:** Since OwnerHome is a mobile component, wire the Verify quick action and banner button to `router.push("/verification")` directly — no prop needed.

**Files:**
- Modify: `src/components/mobile/OwnerHome.tsx`

**Step 1: Add `useRouter` import**
```tsx
import { useRouter } from "next/navigation";
```

**Step 2: Replace `onVerificationBanner` callback with direct navigation**
In the quickActions array, change:
```tsx
// BEFORE:
{ Icon: ShieldCheck, label: "Verify", action: onVerificationBanner }

// AFTER:
{ Icon: ShieldCheck, label: "Verify", action: () => router.push("/verification") }
```
Also replace any other calls to `onVerificationBanner` → `router.push("/verification")`.

**Step 3: Remove unused prop**
Remove `onVerificationBanner` from the component Props type and signature.

---

## Task 3: Remove Add Lead FAB, Replace with CSV Import Navigation

**Problem:** Desktop home has no "Add Lead" button. The FAB in OwnerHome is misleading. User wants it removed or replaced with CSV import.

**Fix:** Remove the floating "Add Lead" FAB entirely and remove "Add Lead" from Quick Actions. Add a "Import" quick action that navigates to `/leads?import=1` (which will open the import modal on the leads page).

**Files:**
- Modify: `src/components/mobile/OwnerHome.tsx`
- Modify: `src/components/mobile/MobileLeadsList.tsx` — add `?import=1` auto-open support (optional, or just navigate to /leads)

**Step 1: Remove FAB**
Delete the fixed-position Add Lead button (lines ~272-279 in OwnerHome.tsx).

**Step 2: Remove "Add Lead" from quickActions array**
Remove the `{ Icon: Plus, label: "Add Lead", action: onAddLead }` entry.

**Step 3: Add "Import CSV" quick action**
```tsx
{ Icon: UploadSimple, label: "Import CSV", color: "bg-elevated", textColor: "text-text-secondary", action: () => router.push("/leads") }
```

**Step 4: Remove onAddLead from props**
Clean up the unused prop.

---

## Task 4: Add Export XLSX to MobileLeadsList

**Problem:** Desktop leads page has Export XLSX button. Mobile has none.

**Files:**
- Modify: `src/components/mobile/MobileLeadsList.tsx`

**Step 1: Add download state**
```tsx
const [exporting, setExporting] = useState(false);
```

**Step 2: Add export handler**
```tsx
async function handleExport() {
  setExporting(true);
  try {
    const res = await leadsApi.exportExcel();
    const blob = new Blob([res.data as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `leads_export_${date}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  } catch {
    toast.error("Export failed");
  } finally {
    setExporting(false);
  }
}
```

**Step 3: Add export button in header toolbar**
Place next to the existing filter/sort buttons in the top bar:
```tsx
<button
  onClick={handleExport}
  disabled={exporting}
  className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center active:scale-[0.93] transition-transform"
  aria-label="Export XLSX"
>
  {exporting ? (
    <div className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
  ) : (
    <DownloadSimple size={18} className="text-text-secondary" />
  )}
</button>
```

---

## Task 5: Fix MobileAnalytics KPI Labels + Period Options

**Problem:**
1. KPI labels mismatch:
   - "Form Submissions" → should be **"Pending Verification"**
   - "Deposits" → should be **"Total Depositors"**
   - "Conversion" → should be **"Conversion Rate"**
2. Missing period options: Mobile only has 4, desktop has 7

**Desktop periods:**
1. "today" → "Today"
2. "yesterday" → "Yesterday"
3. "this_week" → "This Week"
4. "this_month" → "This Month"
5. "last_30_days" → "Last 30 Days"
6. "last_90_days" → "Last 90 Days"
7. "all_time" → "All Time"

**Files:**
- Modify: `src/components/mobile/MobileAnalytics.tsx`

**Step 1: Fix KPI card label strings**
```tsx
// "Form Submissions" → "Pending Verification"
// "Deposits" → "Total Depositors"
// "Conversion" → "Conversion Rate"
```

**Step 2: Expand TIMEFRAMES / period buttons**
Replace current 4-option array:
```tsx
const PERIODS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "this_week", label: "This Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_30_days", label: "Last 30 Days" },
  { key: "last_90_days", label: "Last 90 Days" },
  { key: "all_time", label: "All Time" },
  { key: "custom", label: "Custom" },
] as const;
```

**Step 3: Update period selector UI**
Use a horizontally-scrollable pill row to fit all 8 options:
```tsx
<div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
  {PERIODS.map((p) => (
    <button key={p.key}
      onClick={() => p.key === "custom" ? setShowDateSheet(true) : setPeriod(p.key)}
      className={cn("shrink-0 px-3 h-7 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors",
        activePeriod === p.key ? "bg-crimson text-white" : "bg-elevated text-text-secondary"
      )}
    >{p.label}</button>
  ))}
</div>
```

---

## Task 6: Remove Edit Profile Row from MobileProfile

**Problem:** "Edit Profile" AccountRow in MobileProfile calls `onEditProfile()` but no functionality is implemented. It does nothing and confuses users.

**Files:**
- Modify: `src/components/mobile/MobileProfile.tsx`

**Step 1: Delete the AccountRow for Edit Profile**
Remove the `<AccountRow Icon={PencilSimple} label="Edit Profile" onClick={onEditProfile} />` line.

**Step 2: Remove `onEditProfile` from props if no longer used**
Check if `onEditProfile` is used anywhere else in the component. If not, remove from Props type.

---

## Task 7: Expand Timezone Options in MobileProfile

**Problem:** Mobile has 13 hardcoded timezones vs desktop's 40+ grouped IANA zones. No live clock. No auto-detect.

**Fix:** Replace the flat 13-item list with a full searchable grouped list in the bottom sheet, add a live clock badge, and add auto-detect button.

**Files:**
- Modify: `src/components/mobile/MobileProfile.tsx`

**Step 1: Define full IANA timezone list (grouped)**
```tsx
const TZ_GROUPS = [
  {
    region: "UTC",
    zones: [{ tz: "UTC", label: "UTC (UTC+0)" }],
  },
  {
    region: "Americas",
    zones: [
      { tz: "America/New_York", label: "New York (UTC-5/-4)" },
      { tz: "America/Chicago", label: "Chicago (UTC-6/-5)" },
      { tz: "America/Denver", label: "Denver (UTC-7/-6)" },
      { tz: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
      { tz: "America/Toronto", label: "Toronto (UTC-5/-4)" },
      { tz: "America/Vancouver", label: "Vancouver (UTC-8/-7)" },
      { tz: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
      { tz: "America/Mexico_City", label: "Mexico City (UTC-6/-5)" },
    ],
  },
  {
    region: "Europe",
    zones: [
      { tz: "Europe/London", label: "London (UTC+0/+1)" },
      { tz: "Europe/Paris", label: "Paris (UTC+1/+2)" },
      { tz: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
      { tz: "Europe/Rome", label: "Rome (UTC+1/+2)" },
      { tz: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
      { tz: "Europe/Amsterdam", label: "Amsterdam (UTC+1/+2)" },
      { tz: "Europe/Moscow", label: "Moscow (UTC+3)" },
      { tz: "Europe/Istanbul", label: "Istanbul (UTC+3)" },
    ],
  },
  {
    region: "Africa & Middle East",
    zones: [
      { tz: "Africa/Cairo", label: "Cairo (UTC+2)" },
      { tz: "Africa/Lagos", label: "Lagos (UTC+1)" },
      { tz: "Africa/Johannesburg", label: "Johannesburg (UTC+2)" },
      { tz: "Asia/Dubai", label: "Dubai (UTC+4)" },
      { tz: "Asia/Riyadh", label: "Riyadh (UTC+3)" },
      { tz: "Asia/Baghdad", label: "Baghdad (UTC+3)" },
      { tz: "Asia/Tehran", label: "Tehran (UTC+3:30)" },
    ],
  },
  {
    region: "Asia",
    zones: [
      { tz: "Asia/Kolkata", label: "India (UTC+5:30)" },
      { tz: "Asia/Dhaka", label: "Dhaka (UTC+6)" },
      { tz: "Asia/Colombo", label: "Colombo (UTC+5:30)" },
      { tz: "Asia/Kathmandu", label: "Kathmandu (UTC+5:45)" },
      { tz: "Asia/Bangkok", label: "Bangkok (UTC+7)" },
      { tz: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh (UTC+7)" },
      { tz: "Asia/Jakarta", label: "Jakarta (UTC+7)" },
      { tz: "Asia/Singapore", label: "Singapore (UTC+8)" },
      { tz: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (UTC+8)" },
      { tz: "Asia/Manila", label: "Manila (UTC+8)" },
      { tz: "Asia/Hong_Kong", label: "Hong Kong (UTC+8)" },
      { tz: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
      { tz: "Asia/Seoul", label: "Seoul (UTC+9)" },
      { tz: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
    ],
  },
  {
    region: "Oceania",
    zones: [
      { tz: "Australia/Perth", label: "Perth (UTC+8)" },
      { tz: "Australia/Adelaide", label: "Adelaide (UTC+9:30)" },
      { tz: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
      { tz: "Pacific/Auckland", label: "Auckland (UTC+12/+13)" },
    ],
  },
];
```

**Step 2: Add live clock state**
```tsx
const [liveClock, setLiveClock] = useState("");

useEffect(() => {
  function tick() {
    const now = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
      timeZone: currentTz,
    }).format(new Date());
    setLiveClock(now);
  }
  tick();
  const id = setInterval(tick, 15_000);
  return () => clearInterval(id);
}, [currentTz]);
```

**Step 3: Add auto-detect browser timezone**
```tsx
const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
```

**Step 4: Add search state in bottom sheet**
```tsx
const [tzSearch, setTzSearch] = useState("");
```

**Step 5: Update bottom sheet UI**
Replace flat 13-item list with:
- Search input at top
- Grouped sections (region headers)
- Live clock display above the list
- Auto-detect button if browser TZ differs from selected

---

## Task 8: Fix Image Viewer in MobileLeadDetail

**Problem:** Attachments section shows placeholder icons only. No real file loading, no click-to-expand lightbox.

**Fix:**
1. Load real attachments via `attachmentsApi.findByLead(lead.id)`
2. Show actual thumbnails (image preview or file type icon)
3. Add click-to-expand Dialog lightbox (same pattern as desktop MediaLightbox)
4. Support download

**Files:**
- Modify: `src/components/mobile/MobileLeadDetail.tsx`

**Step 1: Add attachments query**
```tsx
import { attachmentsApi } from "@/lib/api";

// Inside component:
const { data: attachmentsData } = useQuery({
  queryKey: ["lead-attachments", lead.id],
  queryFn: () => attachmentsApi.findByLead(lead.id!).then((r) => r.data.data),
  enabled: !!lead.id,
});
const attachments = attachmentsData ?? [];
```

**Step 2: Add MediaPreview state**
```tsx
type MediaItem = { url: string; type: "image" | "video" | "file"; name: string; mimeType?: string | null; size?: number | null };
const [mediaPreview, setMediaPreview] = useState<MediaItem | null>(null);
```

**Step 3: Replace placeholder section with real thumbnails**
```tsx
{attachments.length > 0 && (
  <section className="px-4 mb-5">
    <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
      <PaperclipHorizontal size={14} weight="bold" /> Attachments
      <span className="text-[10px] font-mono ml-1 text-text-muted">{attachments.length}</span>
    </h2>
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-none">
      {attachments.map((file) => {
        const isImg = file.mimeType?.startsWith("image/");
        const isVid = file.mimeType?.startsWith("video/");
        return (
          <button key={file.id} onClick={() => setMediaPreview({
            url: file.fileUrl, type: isImg ? "image" : isVid ? "video" : "file",
            name: file.fileName ?? "File", mimeType: file.mimeType, size: file.size,
          })} className="shrink-0 snap-start w-[110px] h-[80px] rounded-xl overflow-hidden bg-elevated border border-border-subtle active:scale-[0.95] transition-transform relative">
            {isImg && file.fileUrl
              ? <img src={file.fileUrl} alt={file.fileName ?? ""} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <File size={28} weight="duotone" />
                </div>
            }
          </button>
        );
      })}
    </div>
  </section>
)}
```

**Step 4: Add MediaLightbox Dialog**
```tsx
{mediaPreview && (
  <Dialog open onOpenChange={() => setMediaPreview(null)}>
    <DialogContent className="max-w-sm mx-4 p-0 overflow-hidden rounded-2xl bg-[#0a0a0f] border-border-subtle">
      <div className="relative">
        <button onClick={() => setMediaPreview(null)} className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white/70">
          <X size={16} />
        </button>
        <div className="flex items-center justify-center min-h-[200px] max-h-[60vh] overflow-hidden">
          {mediaPreview.type === "image"
            ? <img src={mediaPreview.url} alt={mediaPreview.name} className="w-full max-h-[60vh] object-contain" />
            : mediaPreview.type === "video"
            ? <video src={mediaPreview.url} controls className="w-full max-h-[60vh] object-contain" />
            : <div className="flex flex-col items-center gap-3 p-10 text-text-muted">
                <File size={48} weight="duotone" />
                <p className="text-sm">{mediaPreview.name}</p>
              </div>
          }
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-elevated/80">
          <p className="text-[12px] font-sans text-text-primary truncate flex-1 mr-3">{mediaPreview.name}</p>
          <button onClick={() => {
            const a = document.createElement("a");
            a.href = mediaPreview.url; a.download = mediaPreview.name; a.click();
          }} className="shrink-0 px-3 h-7 rounded-lg bg-card border border-border-subtle text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
            <DownloadSimple size={13} /> Download
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)}
```

---

## Task 9: Add Chat History Panel to MobileLeadDetail

**Problem:** MobileLeadDetail only has a textarea to send messages. There is no message history shown. Desktop shows full scrollable chat panel with polling.

**Fix:** Add a collapsible chat history section with polling via `leadsApi.getInteractions()`.

**Files:**
- Modify: `src/components/mobile/MobileLeadDetail.tsx`

**Step 1: Add interactions query with polling**
```tsx
const { data: interactionsData } = useQuery({
  queryKey: ["lead-interactions", lead.id],
  queryFn: () => leadsApi.getInteractions(lead.id!, { skip: 0, take: 30 }).then((r) => r.data.data ?? []),
  enabled: !!lead.id,
  refetchInterval: 5000, // poll every 5s like desktop
});
const messages = interactionsData ?? [];
```

**Step 2: Map interactions to display format**
```tsx
function msgSide(msg: Interaction): "user" | "bot" | "agent" | "system" {
  if (msg.senderType === "USER" || msg.senderType === "LEAD") return "user";
  if (msg.senderType === "BOT") return "bot";
  if (msg.senderType === "AGENT") return "agent";
  return "system";
}
```

**Step 3: Render chat history section above the send textarea**
```tsx
{/* ── Chat History ─────────────────────────────────────── */}
<section className="px-4 mb-5">
  <h2 className="font-sans font-bold text-[13px] text-text-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
    <ChatCircleDots size={14} weight="bold" /> Conversation
    <span className="text-[10px] font-mono ml-1 text-text-muted">{messages.length}</span>
  </h2>
  <div className="space-y-2 max-h-[300px] overflow-y-auto rounded-xl bg-card border border-border-subtle p-3" style={{ scrollbarWidth: "thin" }}>
    {messages.length === 0 && (
      <p className="text-[12px] font-sans text-text-muted text-center py-6">No messages yet</p>
    )}
    {messages.map((msg, i) => {
      const side = msgSide(msg);
      if (side === "system") return (
        <div key={i} className="text-center">
          <span className="text-[10px] font-sans italic text-text-muted bg-elevated px-3 py-1 rounded-full">{msg.content}</span>
        </div>
      );
      const isUser = side === "user";
      return (
        <div key={i} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
          <div className={cn(
            "max-w-[85%] rounded-2xl px-3 py-2",
            isUser ? "bg-elevated border border-border-default"
              : side === "agent" ? "bg-crimson/10 border border-crimson/20"
              : "bg-success/10 border border-success/20"
          )}>
            {side === "agent" && <p className="text-[9px] font-sans font-bold text-crimson uppercase tracking-wider mb-1">Agent</p>}
            {side === "bot" && <p className="text-[9px] font-sans font-bold text-success uppercase tracking-wider mb-1">Bot</p>}
            {msg.content && <p className="text-[13px] font-sans text-text-primary leading-relaxed">{msg.content}</p>}
            <p className="text-[10px] font-mono text-text-muted mt-1">
              {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</section>
```

**Note:** The `Interaction` type fields: `senderType`, `content`, `createdAt` — check `src/lib/api/leads.ts` for the exact type definition and adjust field names accordingly.

---

## Task 10: Verify Final TypeScript Compilation

After all tasks above are complete:

```bash
cd D:\Project\tele-crm-frontend && npx tsc --noEmit 2>&1 | Where-Object { $_ -match "error TS" } | Where-Object { $_ -notmatch "forgot-password" }
```

Expected: 0 new errors

---

## Todos (SQL)

```sql
INSERT INTO todos (id, title, description) VALUES
  ('fix-owner-home-kpi', 'Fix OwnerHome KPI labels', 'Change labels in OwnerHome.tsx: Verified→Pending Verifications (formSubmissions), Deposits→Total Depositors (verifiedClients), Conversion→Contacted Leads (contactedLeads). Match desktop page.tsx labels exactly.'),
  ('fix-owner-home-verify', 'Wire Verify button in OwnerHome', 'onVerificationBanner prop is never passed — it does nothing. Replace with useRouter().push("/verification") directly in OwnerHome.tsx.'),
  ('remove-add-lead-fab', 'Remove Add Lead FAB from OwnerHome', 'Remove floating Add Lead button (lines ~272-279) and Remove "Add Lead" from quickActions. Replace with "Import CSV" quick action navigating to /leads.'),
  ('add-export-xlsx-mobile', 'Add Export XLSX to MobileLeadsList', 'Add DownloadSimple button in header toolbar. Uses leadsApi.exportExcel() → Blob → download as leads_export_DATE.xlsx. Show spinner during export.'),
  ('fix-analytics-kpi-labels', 'Fix MobileAnalytics KPI labels', 'Form Submissions→Pending Verification, Deposits→Total Depositors, Conversion→Conversion Rate. Also update icon choices to match desktop.'),
  ('fix-analytics-periods', 'Add all 7 period options to MobileAnalytics', 'Add Yesterday, This Month, Last 90 Days, All Time to MobileAnalytics period selector. Use horizontally-scrollable pill row UI.'),
  ('remove-edit-profile-row', 'Remove broken Edit Profile row from MobileProfile', 'Delete the AccountRow with PencilSimple icon for "Edit Profile". Remove onEditProfile from props if no longer used elsewhere.'),
  ('fix-timezone-mobile', 'Expand MobileProfile timezone to match desktop', 'Replace 13 hardcoded zones with 40+ grouped IANA zones. Add live clock (15s interval, Intl API). Add auto-detect button. Add search input in bottom sheet.'),
  ('fix-image-viewer', 'Fix image viewer in MobileLeadDetail', 'Replace placeholder icons with real attachments via attachmentsApi.findByLead(). Add click-to-expand Dialog lightbox with download button. Show actual thumbnails.'),
  ('add-chat-panel', 'Add chat history to MobileLeadDetail', 'Add message history section above send textarea. Poll leadsApi.getInteractions() every 5s. Show user/bot/agent messages styled by side. Max-height 300px scrollable.');
```
