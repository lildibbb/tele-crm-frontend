import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MobileLeadChat from "./MobileLeadChat";
import { leadsApi } from "@/lib/api";
import { useLeadDetail } from "@/queries/useLeadsQuery";
import { LEAD_REPLY_REQUIRED_MESSAGE } from "@/lib/api/leads";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "id" ? "lead-1" : null),
  }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("@/queries/useLeadsQuery", () => ({
  useLeadDetail: vi.fn(),
}));

vi.mock("@/lib/replyAttachmentPolicy", () => ({
  validateReplyAttachmentFile: vi.fn(() => null),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api", () => ({
  leadsApi: {
    getInteractions: vi.fn(),
    reply: vi.fn(),
  },
}));

describe("MobileLeadChat reply contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLeadDetail).mockReturnValue({
      data: { displayName: "Alice" },
    } as never);
    vi.mocked(useQuery).mockReturnValue({
      data: [],
    } as never);
    vi.mocked(useQueryClient).mockReturnValue({
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    } as never);
    vi.mocked(leadsApi.reply).mockResolvedValue({
      data: { data: { sent: true } },
    } as never);
  });

  it("sends attachment-only reply", async () => {
    const { container } = render(<MobileLeadChat />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["img"], "receipt.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await waitFor(() =>
      expect(leadsApi.reply).toHaveBeenCalledWith("lead-1", {
        message: "",
        file,
      }),
    );
  });

  it("rejects empty payload when neither text nor file exists", async () => {
    const { toast } = await import("sonner");
    render(<MobileLeadChat />);

    fireEvent.keyDown(screen.getByPlaceholderText("Type a message…"), {
      key: "Enter",
      code: "Enter",
    });

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(LEAD_REPLY_REQUIRED_MESSAGE),
    );
    expect(leadsApi.reply).not.toHaveBeenCalled();
  });
});

