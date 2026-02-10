import { describe, expect, it } from "vitest";
import { formatDateTime } from "./date";

describe("formatDateTime", () => {
  it("formats valid datetime string", () => {
    expect(formatDateTime("2024-01-10T05:30:00")).toBe("2024-01-10 05:30");
  });

  it("returns fallback for empty value", () => {
    expect(formatDateTime()).toBe("-");
  });
});

