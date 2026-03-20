import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/lib/api/apiClient";
import { LEAD_REPLY_REQUIRED_MESSAGE, leadsApi } from "@/lib/api/leads";

describe("leadsApi.reply", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends text-only replies as JSON", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: { data: { sent: true } },
    } as never);

    await leadsApi.reply("lead-1", "  hello team  ");

    expect(postSpy).toHaveBeenCalledWith("/leads/lead-1/reply", {
      message: "hello team",
    });
  });

  it("sends attachment replies as multipart form-data", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: { data: { sent: true } },
    } as never);
    const file = new File(["proof"], "proof.txt", { type: "text/plain" });

    await leadsApi.reply("lead-2", {
      message: "Here is the proof",
      file,
    });

    const [url, body] = postSpy.mock.calls[0] ?? [];
    expect(url).toBe("/leads/lead-2/reply");
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("message")).toBe("Here is the proof");
    expect(form.get("attachment")).toBe(file);
  });

  it("rejects empty replies when no attachment is provided", async () => {
    const postSpy = vi.spyOn(apiClient, "post");

    await expect(
      leadsApi.reply("lead-3", { message: "   ", file: null }),
    ).rejects.toThrow(LEAD_REPLY_REQUIRED_MESSAGE);

    expect(postSpy).not.toHaveBeenCalled();
  });

  it("allows attachment-only replies", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: { data: { sent: true } },
    } as never);
    const file = new File(["img"], "receipt.png", { type: "image/png" });

    await leadsApi.reply("lead-attachment", {
      message: "   ",
      file,
    });

    const [url, body] = postSpy.mock.calls[0] ?? [];
    expect(url).toBe("/leads/lead-attachment/reply");
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("message")).toBe("");
    expect(form.get("attachment")).toBe(file);
  });

  it("allows attachment-only replies when message key is omitted", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({
      data: { data: { sent: true } },
    } as never);
    const file = new File(["img"], "receipt.png", { type: "image/png" });

    await leadsApi.reply("lead-attachment-2", {
      file,
    });

    const [url, body] = postSpy.mock.calls[0] ?? [];
    expect(url).toBe("/leads/lead-attachment-2/reply");
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("message")).toBe("");
    expect(form.get("attachment")).toBe(file);
  });

  it("surfaces backend validation messages", async () => {
    vi.spyOn(apiClient, "post").mockRejectedValue({
      response: {
        data: {
          message: ["message should not be empty", "message must be a string"],
        },
      },
    });

    await expect(leadsApi.reply("lead-4", "Valid message")).rejects.toThrow(
      "message should not be empty, message must be a string",
    );
  });
});
