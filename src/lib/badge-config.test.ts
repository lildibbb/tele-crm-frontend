import { describe, it, expect } from "vitest";
import {
  LEAD_STATUS_BADGE,
  BROADCAST_STATUS_BADGE,
  roleBadgeCls,
} from "@/lib/badge-config";

describe("LEAD_STATUS_BADGE", () => {
  const expectedKeys = [
    "NEW",
    "CONTACTED",
    "DEPOSIT_REPORTED",
    "DEPOSIT_CONFIRMED",
    "REJECTED",
  ];

  it.each(expectedKeys)("has entry for %s", (key) => {
    expect(LEAD_STATUS_BADGE[key]).toBeDefined();
    expect(LEAD_STATUS_BADGE[key].labelKey).toBeTypeOf("string");
    expect(LEAD_STATUS_BADGE[key].cls).toBeTypeOf("string");
    expect(LEAD_STATUS_BADGE[key].dotCls).toBeTypeOf("string");
  });

  it("NEW badge has blue styling", () => {
    expect(LEAD_STATUS_BADGE.NEW.cls).toContain("blue");
    expect(LEAD_STATUS_BADGE.NEW.dotCls).toContain("blue");
  });

  it("REJECTED badge has red styling", () => {
    expect(LEAD_STATUS_BADGE.REJECTED.cls).toContain("red");
    expect(LEAD_STATUS_BADGE.REJECTED.dotCls).toContain("red");
  });

  it("DEPOSIT_CONFIRMED badge has emerald styling", () => {
    expect(LEAD_STATUS_BADGE.DEPOSIT_CONFIRMED.cls).toContain("emerald");
  });
});

describe("BROADCAST_STATUS_BADGE", () => {
  const expectedKeys = ["QUEUED", "SENDING", "SENT", "FAILED"];

  it.each(expectedKeys)("has entry for %s", (key) => {
    expect(BROADCAST_STATUS_BADGE[key]).toBeDefined();
  });

  it("QUEUED has animate-pulse dot", () => {
    expect(BROADCAST_STATUS_BADGE.QUEUED.dotCls).toContain("animate-pulse");
  });

  it("SENT has emerald styling without animation", () => {
    expect(BROADCAST_STATUS_BADGE.SENT.cls).toContain("emerald");
    expect(BROADCAST_STATUS_BADGE.SENT.dotCls).not.toContain("animate-pulse");
  });
});

describe("roleBadgeCls", () => {
  it("returns muted class for null", () => {
    expect(roleBadgeCls(null)).toBe("bg-muted text-muted-foreground");
  });

  it("returns muted class for undefined", () => {
    expect(roleBadgeCls(undefined)).toBe("bg-muted text-muted-foreground");
  });

  it("returns muted class for unknown role", () => {
    expect(roleBadgeCls("UNKNOWN")).toBe("bg-muted text-muted-foreground");
  });

  it("returns red for SUPERADMIN (case-insensitive)", () => {
    expect(roleBadgeCls("superadmin")).toContain("red");
    expect(roleBadgeCls("SUPERADMIN")).toContain("red");
  });

  it("returns amber for OWNER", () => {
    expect(roleBadgeCls("OWNER")).toContain("amber");
  });

  it("returns blue for ADMIN", () => {
    expect(roleBadgeCls("ADMIN")).toContain("blue");
  });

  it("returns emerald for STAFF", () => {
    expect(roleBadgeCls("STAFF")).toContain("emerald");
  });
});
