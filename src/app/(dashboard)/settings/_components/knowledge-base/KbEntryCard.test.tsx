import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { KbEntry } from "@/lib/schemas/kb.schema";
import { KbFileType, KbStatus, KbType } from "@/types/enums";
import { KbEntryCard } from "./KbEntryCard";

function createFailedEntry(): KbEntry {
  return {
    id: "kb-failed-1",
    title: "Failed KB Entry",
    content: "Failed entry content that is long enough for rendering.",
    type: KbType.TEXT,
    fileType: KbFileType.TEXT_MANUAL,
    url: null,
    status: KbStatus.FAILED,
    isActive: false,
    mismatchFlag: false,
    mismatchScore: null,
    createdAt: "2026-03-16T00:00:00.000Z",
    updatedAt: "2026-03-16T00:00:00.000Z",
  };
}

describe("KbEntryCard retry action", () => {
  it("calls onRetry with entry id when retry is clicked", () => {
    const onRetry = vi.fn();

    render(
      <KbEntryCard
        entry={createFailedEntry()}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onRetry={onRetry}
        isRetrying={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^retry$/i }));

    expect(onRetry).toHaveBeenCalledWith("kb-failed-1");
  });

  it("disables retry button and shows loading label while retrying", () => {
    const onRetry = vi.fn();

    render(
      <KbEntryCard
        entry={createFailedEntry()}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onRetry={onRetry}
        isRetrying
      />,
    );

    const retryButton = screen.getByRole("button", { name: /retrying/i });
    expect(retryButton).toBeDisabled();
    expect(screen.getByText("Retrying...")).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).not.toHaveBeenCalled();
  });
});

describe("KbEntryCard mismatch warning", () => {
  it("shows mismatch warning badge and message when mismatchFlag is true", () => {
    render(
      <KbEntryCard
        entry={{
          ...createFailedEntry(),
          status: KbStatus.READY,
          mismatchFlag: true,
          mismatchScore: 0.87,
        }}
        index={0}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onToggleActive={vi.fn()}
        onRetry={vi.fn()}
        isRetrying={false}
      />,
    );

    expect(screen.getByText("Backend mismatch")).toBeInTheDocument();
    expect(screen.getByText("Backend mismatch detected (0.87).")).toBeInTheDocument();
  });
});
