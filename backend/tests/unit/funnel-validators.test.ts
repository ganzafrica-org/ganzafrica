import { describe, it, expect } from "vitest";
import { isFunnelEvent, isSessionKey } from "../../src/services/recruitment/funnel.service";

describe("funnel validators", () => {
  it("isFunnelEvent accepts the enum, rejects others", () => {
    expect(isFunnelEvent("view")).toBe(true);
    expect(isFunnelEvent("form_start")).toBe(true);
    expect(isFunnelEvent("form_submit")).toBe(true);
    expect(isFunnelEvent("click")).toBe(false);
    expect(isFunnelEvent(42)).toBe(false);
    expect(isFunnelEvent(null)).toBe(false);
  });

  it("isSessionKey requires a uuid", () => {
    expect(isSessionKey("3f2504e0-4f89-41d3-9a0c-0305e82c3301")).toBe(true);
    expect(isSessionKey("not-a-uuid")).toBe(false);
    expect(isSessionKey("")).toBe(false);
    expect(isSessionKey(123)).toBe(false);
  });
});
