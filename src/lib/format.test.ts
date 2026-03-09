import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatDate,
  formatDateTime,
  timeAgo,
  isToday,
  getInitials,
} from "@/lib/format";

describe("formatDate", () => {
  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("formats a Date object", () => {
    const d = new Date("2024-06-15T00:00:00.000Z");
    const result = formatDate(d);
    expect(result).toMatch(/Jun|June/);
    expect(result).toMatch(/2024/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-01-01T00:00:00.000Z");
    expect(result).toMatch(/Jan|January/);
    expect(result).toMatch(/2024/);
  });

  it("formats a timestamp number", () => {
    const ts = new Date("2024-03-10T00:00:00.000Z").getTime();
    const result = formatDate(ts);
    expect(result).toMatch(/Mar|March/);
  });
});

describe("formatDateTime", () => {
  it("returns em-dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatDateTime(undefined)).toBe("—");
  });

  it("returns em-dash for empty string", () => {
    expect(formatDateTime("")).toBe("—");
  });

  it("formats an ISO string to localized date+time", () => {
    const result = formatDateTime("2024-03-09T14:35:00.000Z");
    expect(result).toContain("2024");
    // Contains time digits
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("timeAgo", () => {
  it("returns em-dash for null", () => {
    expect(timeAgo(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(timeAgo(undefined)).toBe("—");
  });

  it("returns 'just now' for < 1 minute ago", () => {
    const iso = new Date(Date.now() - 30_000).toISOString();
    expect(timeAgo(iso)).toBe("just now");
  });

  it("returns minutes ago for 5 minutes ago", () => {
    const iso = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe("5m ago");
  });

  it("returns hours ago for 3 hours ago", () => {
    const iso = new Date(Date.now() - 3 * 60 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe("3h ago");
  });

  it("returns days ago for 2 days ago", () => {
    const iso = new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString();
    expect(timeAgo(iso)).toBe("2d ago");
  });
});

describe("isToday", () => {
  it("returns false for null", () => {
    expect(isToday(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isToday(undefined)).toBe(false);
  });

  it("returns true for current date ISO string", () => {
    const now = new Date().toISOString();
    expect(isToday(now)).toBe(true);
  });

  it("returns false for yesterday", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    expect(isToday(yesterday)).toBe(false);
  });
});

describe("getInitials", () => {
  it("returns ?? for null", () => {
    expect(getInitials(null)).toBe("??");
  });

  it("returns ?? for undefined", () => {
    expect(getInitials(undefined)).toBe("??");
  });

  it("returns ?? for empty string", () => {
    expect(getInitials("")).toBe("??");
  });

  it("returns two initials for a full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("is case-insensitive and uppercases result", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });

  it("returns first two chars for single word", () => {
    expect(getInitials("Alice")).toBe("AL");
  });

  it("uses first two words for multi-word names", () => {
    expect(getInitials("John Michael Doe")).toBe("JM");
  });
});
