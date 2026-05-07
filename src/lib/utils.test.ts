import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  capitalize,
  cn,
  errorMessage,
  getFileUrl,
  getInitials,
  getResponsiveImage,
  slugify,
} from "./utils.ts";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b").split(" ")).toEqual(["a", "b"]);
  });

  it("dedupes conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    expect(cn("a", false && "b", null, undefined, "c")).toBe("a c");
  });
});

describe("errorMessage", () => {
  it("returns Error.message for Error instances", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns the default fallback for non-errors", () => {
    expect(errorMessage("nope")).toBe("An error occurred");
  });

  it("respects a custom fallback", () => {
    expect(errorMessage(null, "custom")).toBe("custom");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter of each word", () => {
    expect(capitalize("hello world")).toBe("Hello World");
  });

  it("preserves capitalization across hyphens", () => {
    expect(capitalize("jean-luc picard")).toBe("Jean-Luc Picard");
  });

  it("normalizes whitespace and case", () => {
    expect(capitalize("  HELLO   WORLD  ")).toBe("Hello World");
  });
});

describe("getInitials", () => {
  it("returns the first and last initial for two-word names", () => {
    expect(getInitials("Jane Doe")).toBe("JD");
  });

  it("returns one initial for single-word names", () => {
    expect(getInitials("Madonna")).toBe("M");
  });

  it("ignores middle names", () => {
    expect(getInitials("Mary Beth Jones")).toBe("MJ");
  });
});

describe("slugify", () => {
  it("lowercases and dasherizes", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Olé")).toBe("cafe-ole");
  });

  it("collapses non-alphanumeric runs", () => {
    expect(slugify("foo!@#bar")).toBe("foo-bar");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("caps the result at 80 characters", () => {
    expect(slugify("a".repeat(100)).length).toBeLessThanOrEqual(80);
  });
});

describe("getFileUrl", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_S3_PUBLIC_URL", "https://cdn.test");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns undefined for empty keys", () => {
    expect(getFileUrl(undefined)).toBeUndefined();
    expect(getFileUrl(null)).toBeUndefined();
    expect(getFileUrl("")).toBeUndefined();
  });

  it("passes through full URLs unchanged", () => {
    expect(getFileUrl("https://other.test/x.webp")).toBe(
      "https://other.test/x.webp",
    );
  });

  it("prepends the S3 public URL for keys", () => {
    expect(getFileUrl("posts/1/img.webp")).toBe(
      "https://cdn.test/posts/1/img.webp",
    );
  });
});

describe("getResponsiveImage", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_S3_PUBLIC_URL", "https://cdn.test");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("returns undefined for empty keys", () => {
    expect(getResponsiveImage(undefined)).toBeUndefined();
  });

  it("returns just src for non-variant URLs", () => {
    const r = getResponsiveImage("posts/1/cover.webp");
    expect(r?.src).toBe("https://cdn.test/posts/1/cover.webp");
    expect(r?.srcset).toBeUndefined();
  });

  it("generates a srcset with widths up to the master", () => {
    const r = getResponsiveImage("posts/1/img-1280.webp");
    expect(r?.srcset).toContain("img-640.webp 640w");
    expect(r?.srcset).toContain("img-1280.webp 1280w");
    expect(r?.srcset).not.toContain("2560w");
  });

  it("includes the master width in the srcset for the largest variant", () => {
    const r = getResponsiveImage("posts/1/img-2560.webp");
    expect(r?.srcset).toContain("img-2560.webp 2560w");
  });

  it("provides a default sizes string when a srcset is generated", () => {
    const r = getResponsiveImage("posts/1/img-1280.webp");
    expect(r?.sizes).toBeTruthy();
  });
});
