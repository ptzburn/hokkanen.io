import { renderHook } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./use-media-query.ts";

type Handler = (event: { matches: boolean }) => void;

function installMatchMedia(
  initialMatches: boolean,
): { fire: (matches: boolean) => void } {
  let matches = initialMatches;
  let handlers: Handler[] = [];

  const mql = {
    get matches(): boolean {
      return matches;
    },
    addEventListener: (_type: string, h: Handler) => {
      handlers.push(h);
    },
    removeEventListener: (_type: string, h: Handler) => {
      handlers = handlers.filter((x) => x !== h);
    },
  };

  Object.defineProperty(globalThis, "matchMedia", {
    value: vi.fn(() => mql),
    configurable: true,
    writable: true,
  });

  return {
    fire: (m: boolean) => {
      matches = m;
      for (const h of handlers) h({ matches: m });
    },
  };
}

describe("useMediaQuery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reflects the initial matchMedia state after mount", async () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    await vi.runAllTimersAsync();
    expect(result()).toBe(true);
  });

  it("updates when the media query change event fires", async () => {
    const { fire } = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    await vi.runAllTimersAsync();
    expect(result()).toBe(false);

    fire(true);
    expect(result()).toBe(true);
  });
});
