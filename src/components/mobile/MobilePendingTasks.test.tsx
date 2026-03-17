import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { leadsApi } from "@/lib/api";
import {
  usePendingTasksGroupedByLead,
  usePendingTasksList,
  useUpdatePendingTaskStatus,
} from "@/queries/usePendingTasksQuery";
import { PendingTaskStatus } from "@/types/enums";
import MobilePendingTasks from "./MobilePendingTasks";

vi.mock("@/i18n", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/i18n")>();
  const messages: Record<string, string> = {
    "pending.contextChat": "Context chat",
    "pending.conversation": "Conversation",
    "pending.ownerMessage": "Owner Message",
    "pending.taskDetail": "Task Detail",
    "pending.resolve": "Resolve",
    "pending.username": "Username",
    "pending.email": "Email",
    "pending.hfm": "HFM",
    "pending.send": "Send",
    "pending.attachFile": "Attach file",
    "pending.removeFile": "Remove file",
    "pending.goBack": "Go back",
    "pending.options": "Options",
    "pending.replyPlaceholder": "Reply in context...",
    "pending.attachmentReceived": "Attachment received",
    "pending.pending": "Pending",
    "pending.resolved": "Resolved",
    "pending.dismissed": "Dismissed",
    "pending.swipeRightHint": "Swipe right in chat to go back",
  };
  return {
    ...actual,
    useT: () => (key: string) => messages[key] ?? key,
  };
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/queries/usePendingTasksQuery", () => ({
  usePendingTasksGroupedByLead: vi.fn(),
  usePendingTasksList: vi.fn(),
  useUpdatePendingTaskStatus: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  leadsApi: {
    getInteractions: vi.fn(),
    reply: vi.fn(),
  },
}));

const groupedFixture = {
  groups: [
    {
      leadId: "lead-1",
      lead: {
        id: "lead-1",
        displayName: "Alice Example",
        username: "alice",
        status: "CONTACTED",
        email: "alice@example.com",
        hfmBrokerId: "HFM-9",
      },
      statusCounts: { pending: 1, resolved: 0, dismissed: 0, total: 1 },
      tasks: [
        {
          id: "task-1",
          leadId: "lead-1",
          attachmentId: null,
          interactionId: "interaction-1",
          caption: "Need follow-up",
          status: PendingTaskStatus.PENDING,
          createdAt: "2026-03-15T00:00:00.000Z",
          resolvedAt: null,
        },
      ],
    },
  ],
  totalLeads: 1,
  totalTasks: 1,
  statusCounts: { pending: 1, resolved: 0, dismissed: 0, total: 1 },
};

const contextInteractionsFixture = [
  {
    id: "interaction-1",
    leadId: "lead-1",
    type: "MANUAL_REPLY_SENT",
    content: "Sent context message",
    metadata: null,
    createdAt: "2026-03-15T01:00:00.000Z",
  },
];

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<MobilePendingTasks />, {
    wrapper: createWrapper(queryClient),
  });
}

describe("MobilePendingTasks", () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsyncMock.mockResolvedValue(undefined);

    vi.mocked(usePendingTasksGroupedByLead).mockReturnValue({
      data: groupedFixture,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useUpdatePendingTaskStatus).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    } as never);

    vi.mocked(usePendingTasksList).mockImplementation((params) => {
      const status = params?.status;
      return ({
        data: {
          total:
            status === PendingTaskStatus.PENDING
              ? 1
              : status === PendingTaskStatus.RESOLVED
                ? 0
                : 0,
        },
      }) as never;
    });

    vi.mocked(leadsApi.getInteractions).mockResolvedValue({
      data: { data: contextInteractionsFixture },
    } as never);
    vi.mocked(leadsApi.reply).mockResolvedValue({
      data: { data: { sent: true } },
    } as never);
  });

  it("renders grouped lead cards with lead context", () => {
    renderComponent();

    expect(screen.getByText("Alice Example")).toBeInTheDocument();
    expect(screen.getByText("Username: @alice")).toBeInTheDocument();
    expect(screen.getByText("Email: alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("HFM: HFM-9")).toBeInTheDocument();
    expect(screen.getByText("CONTACTED")).toBeInTheDocument();
    expect(screen.getByText("Need follow-up")).toBeInTheDocument();
  });

  it("preserves resolve action from task detail", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /need follow-up/i }));
    expect(await screen.findByText("Task Detail")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^resolve$/i }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        id: "task-1",
        data: { status: PendingTaskStatus.RESOLVED },
      }),
    );
  });

  it("opens context chat workflow and loads lead interactions", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: /context chat/i }));

    await waitFor(() =>
      expect(leadsApi.getInteractions).toHaveBeenCalledWith(
        "lead-1",
        expect.objectContaining({
          skip: 0,
          take: 20,
          anchorInteractionId: "interaction-1",
          before: 24,
          after: 24,
        }),
      ),
    );

    expect(await screen.findByText("Conversation")).toBeInTheDocument();
    expect(screen.getByText("Owner Message")).toBeInTheDocument();
    expect(screen.getByText("Sent context message")).toBeInTheDocument();
  });

  it("sends attachment-only from context chat", async () => {
    const { container } = renderComponent();
    fireEvent.click(screen.getByRole("button", { name: /context chat/i }));
    await screen.findByText("Conversation");

    const file = new File(["proof"], "proof.png", { type: "image/png" });
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() =>
      expect(leadsApi.reply).toHaveBeenCalledWith("lead-1", {
        message: "",
        file,
      }),
    );
  });
});
