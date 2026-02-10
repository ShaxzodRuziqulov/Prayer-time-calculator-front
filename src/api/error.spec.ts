import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./error";

describe("getApiErrorMessage", () => {
  it("returns network error message when response is absent", () => {
    const message = getApiErrorMessage({
      isAxiosError: true,
      response: undefined
    });
    expect(message).toBe("Serverga ulanib bo'lmadi");
  });

  it("returns backend message when available", () => {
    const message = getApiErrorMessage({
      isAxiosError: true,
      response: {
        data: {
          message: "Qaza not found"
        }
      }
    });
    expect(message).toBe("Qaza not found");
  });
});

