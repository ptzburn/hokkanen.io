import { describe, expect, it } from "vitest";

import {
  ImageFileSchema,
  MAX_UPLOAD_BYTES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "./files.ts";

function makeFile(size: number, type: string): File {
  return new File([new Uint8Array(size)], "test", { type });
}

describe("ImageFileSchema", () => {
  it("rejects empty files", () => {
    expect(ImageFileSchema.safeParse(makeFile(0, "image/png")).success).toBe(
      false,
    );
  });

  it("rejects files over the size cap", () => {
    expect(
      ImageFileSchema.safeParse(makeFile(MAX_UPLOAD_BYTES + 1, "image/png"))
        .success,
    ).toBe(false);
  });

  it("accepts files at the size cap", () => {
    expect(
      ImageFileSchema.safeParse(makeFile(MAX_UPLOAD_BYTES, "image/png"))
        .success,
    ).toBe(true);
  });

  it("rejects unsupported MIME types", () => {
    expect(ImageFileSchema.safeParse(makeFile(100, "image/gif")).success).toBe(
      false,
    );
    expect(ImageFileSchema.safeParse(makeFile(100, "image/svg+xml")).success)
      .toBe(false);
    expect(ImageFileSchema.safeParse(makeFile(100, "application/pdf")).success)
      .toBe(false);
  });

  it("accepts every supported MIME type", () => {
    for (const mime of SUPPORTED_IMAGE_MIME_TYPES) {
      expect(ImageFileSchema.safeParse(makeFile(100, mime)).success).toBe(true);
    }
  });

  it("normalizes MIME case", () => {
    expect(ImageFileSchema.safeParse(makeFile(100, "IMAGE/PNG")).success).toBe(
      true,
    );
  });

  it("rejects non-File inputs", () => {
    expect(
      ImageFileSchema.safeParse({ size: 100, type: "image/png" }).success,
    ).toBe(false);
    expect(ImageFileSchema.safeParse(null).success).toBe(false);
    expect(ImageFileSchema.safeParse("not a file").success).toBe(false);
  });
});
