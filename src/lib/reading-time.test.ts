import { describe, expect, it } from "vitest";
import { countWords, readingMinutes } from "./reading-time.ts";

describe("countWords", () => {
  it("returns 0 for empty input", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t  ")).toBe(0);
  });

  it("counts whitespace-separated tokens", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("  hello   world  ")).toBe(2);
  });

  it("treats newlines and tabs as separators", () => {
    expect(countWords("one\ntwo\tthree")).toBe(3);
  });

  it("counts single words", () => {
    expect(countWords("hello")).toBe(1);
  });
});

describe("readingMinutes", () => {
  it("floors at 1 minute even for zero or tiny posts", () => {
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(50)).toBe(1);
  });

  it("rounds at 200 words per minute", () => {
    expect(readingMinutes(200)).toBe(1);
    expect(readingMinutes(300)).toBe(2);
    expect(readingMinutes(1000)).toBe(5);
  });

  it("treats negative input as zero", () => {
    expect(readingMinutes(-100)).toBe(1);
  });
});
