# Frontend Architecture Design: Titan Journal CRM

## 1. Overview & Core Decisions

This document outlines the technical architecture and component design for the Titan Journal CRM frontend application.

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Accessible, customizable Radix UI primitives)
- **Data Visualization**: Tremor (React components specifically built for dashboards and analytics)
- **State Management**: Zustand (for global UI state, e.g., active modals, user session data bridging)
- **Forms & Validation**: React Hook Form + Zod (Strictly typed form submission)

## 2. Project Structure (Next.js App Router)

```text
src/
├── app/
│   ├── (auth)/             # Route group for authentication pages
│   │   ├── login/page.tsx
│   │   └── invite/page.tsx
│   ├── (dashboard)/        # Protected route group
│   │   ├── layout.tsx      # Sidebar navigation & Topbar
│   │   ├── page.tsx        # High-level Analytics (The "Tally" Dashboard)
│   │   ├── leads/          # Lead Management CRM Portal
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── verification/   # Verification Queue
│   │   │   └── page.tsx
│   │   └── settings/       # Bot Config, Templates, Team Members
│   ├── (tma)/              # Route group for Telegram Mini App interfaces
│   │   ├── layout.tsx      # Mobile-first optimized layout
│   │   └── register/page.tsx
│   └── globals.css         # Global Tailwind directives & theming
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Input, Dialog, etc.)
│   ├── dashboard/          # Tremor charts & KPI cards
│   ├── leads/              # Lead data tables, chat interface
│   └── ...
├── lib/
│   ├── api/                # Axios or native fetch wrappers for BE endpoints
│   ├── stores/             # Zustand state stores
│   └── utils.ts            # Tailwind `cn` merger and helpers
└── types/                  # Shared TypeScript interfaces (mirrored from backend)
```

## 3. Key Architectural Patterns

### A. Authentication & Route Protection

- **Strategy**: Use Next.js Middleware (`src/middleware.ts`) to intercept requests. Verify the presence and validity of the JWT token (stored in HTTP-only cookies or secure local storage acting as a session cookie).
- **Redirection**: Unauthenticated users attempting to access `/(dashboard)/*` are redirected to `/login`.
- **Role-Based Access Control (RBAC)**: Enforce RBAC at the layout level and within specific components (e.g., hiding the "Team Members" configuration from non-owners).

### B. Data Fetching & State

- **Server Components (RSC)**: Utilize Next.js React Server Components for initial data loads on dashboard pages (e.g., fetching initial KPI metrics) to ensure fast First Contentful Paint.
- **Client Data Fetching (SWR / React Query)**: For highly interactive views like the Lead CRM Data Table and Verification Queue, use client-side fetching to handle pagination, filtering, and real-time polling (or WebSocket integration if the backend supports it later) for the "active/live lead registration" requirement.

### C. Telegram Mini App (TMA) Integration

- **Isolation**: The TMA routes (`/tma/*`) will have a dedicated layout. They must be strictly mobile-first, hiding complex navigation.
- **Authentication**: The TMA login flow will utilize the Telegram `initData` passed via the URL or Telegram Web App script. The backend `POST /auth/tma-login` handles the actual verification.
- **Script Injection**: Ensure the Telegram Web App script (`https://telegram.org/js/telegram-web-app.js`) is correctly injected into the TMA layout document.

## 4. Addressing Specific Requirements

- **Real-time Vibe**: While true WebSockets are ideal, we can simulate real-time updates using fast polling (via SWR/React Query) on specific endpoints (like the live lead indicator) combined with Framer Motion layout animations when lists update.
- **Media Viewer**: Implement a React Portal dialog (shadcn `Dialog` component) that can render images or a standard HTML5 `<video>` player for S3/GCS links pulled from the backend.
- **Bot Handover**: The Lead Detail view (`/leads/[id]`) will feature a distinct UI panel. Toggling the "Take Over" switch will hit `PATCH /leads/:id/handover`. The chat interface below will then become active, hitting a standard messaging endpoint (to be defined/confirmed with the backend).

## 5. Next Steps for Implementation

1.  **Initialize Next.js**: `npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
2.  **Setup UI Libraries**: Install shadcn/ui, Tremor, Lucide Icons, and Framer Motion.
3.  **Define Theme**: Configure `globals.css` and `tailwind.config.ts` for the enterprise premium dark mode aesthetic.
4.  **API Client**: Scaffold the strict TypeScript fetcher functions correlating to the definitions in `requirements-frontend.md`.
5.  **Build Layouts**: Implement the Dashboard Sidebar and TMA wrappers.
