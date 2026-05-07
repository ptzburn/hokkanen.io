import "@testing-library/jest-dom/vitest";

// Stubs for browser APIs that happy-dom doesn't implement and that Kobalte /
// Ark UI / Corvu touch on mount.
class MockObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): unknown[] {
    return [];
  }
}

if (!("IntersectionObserver" in globalThis)) {
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: MockObserver,
    writable: true,
  });
}

if (!("ResizeObserver" in globalThis)) {
  Object.defineProperty(globalThis, "ResizeObserver", {
    value: MockObserver,
    writable: true,
  });
}
