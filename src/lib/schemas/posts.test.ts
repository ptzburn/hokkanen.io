import { describe, expect, it } from "vitest";

import {
  CreatePostInput,
  PostFormSchema,
  SetPostCoverInput,
  UpdatePostImageAltInput,
  UpdatePostInput,
} from "./posts.ts";

describe("CreatePostInput", () => {
  it("rejects empty title", () => {
    const result = CreatePostInput.safeParse({ title: "", content: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects title over 200 chars", () => {
    const result = CreatePostInput.safeParse({
      title: "a".repeat(201),
      content: "x",
    });
    expect(result.success).toBe(false);
  });

  it("trims title whitespace", () => {
    const result = CreatePostInput.safeParse({
      title: "  hello  ",
      content: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("hello");
  });

  it("accepts content at the 500k cap", () => {
    const result = CreatePostInput.safeParse({
      title: "t",
      content: "a".repeat(500_000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects content over the 500k cap", () => {
    const result = CreatePostInput.safeParse({
      title: "t",
      content: "a".repeat(500_001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects excerpt over 500 chars", () => {
    const result = CreatePostInput.safeParse({
      title: "t",
      content: "x",
      excerpt: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("treats excerpt as optional", () => {
    const result = CreatePostInput.safeParse({ title: "t", content: "x" });
    expect(result.success).toBe(true);
  });
});

describe("UpdatePostInput", () => {
  it("requires a positive integer id", () => {
    expect(UpdatePostInput.safeParse({ id: 0 }).success).toBe(false);
    expect(UpdatePostInput.safeParse({ id: -1 }).success).toBe(false);
    expect(UpdatePostInput.safeParse({ id: 1.5 }).success).toBe(false);
    expect(UpdatePostInput.safeParse({ id: 1 }).success).toBe(true);
  });

  it("allows null excerpt for clearing", () => {
    const result = UpdatePostInput.safeParse({ id: 1, excerpt: null });
    expect(result.success).toBe(true);
  });

  it("enforces the same 500k content cap", () => {
    expect(
      UpdatePostInput.safeParse({ id: 1, content: "a".repeat(500_001) })
        .success,
    ).toBe(false);
  });
});

describe("PostFormSchema", () => {
  it("requires non-empty content", () => {
    const result = PostFormSchema.safeParse({
      title: "t",
      content: "",
      excerpt: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires non-empty title", () => {
    const result = PostFormSchema.safeParse({
      title: "",
      content: "x",
      excerpt: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("SetPostCoverInput", () => {
  it("accepts null imageId for clearing", () => {
    expect(SetPostCoverInput.safeParse({ postId: 1, imageId: null }).success)
      .toBe(true);
  });

  it("rejects non-positive ids", () => {
    expect(SetPostCoverInput.safeParse({ postId: 0, imageId: 1 }).success)
      .toBe(false);
  });
});

describe("UpdatePostImageAltInput", () => {
  it("caps alt text at 200 chars", () => {
    expect(
      UpdatePostImageAltInput.safeParse({ id: 1, alt: "a".repeat(201) })
        .success,
    ).toBe(false);
    expect(
      UpdatePostImageAltInput.safeParse({ id: 1, alt: "a".repeat(200) })
        .success,
    ).toBe(true);
  });
});
