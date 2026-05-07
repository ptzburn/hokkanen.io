import { describe, expect, it } from "vitest";

import { normalizeToWebp, normalizeToWebpVariants } from "./images.ts";

describe("normalizeToWebp", () => {
  it("rejects unsupported MIME types", async () => {
    const file = new File([new Uint8Array(10)], "x.gif", {
      type: "image/gif",
    });
    await expect(normalizeToWebp(file)).rejects.toThrow("Unsupported");
  });

  it("rejects files without a MIME type", async () => {
    const file = new File([new Uint8Array(10)], "x");
    await expect(normalizeToWebp(file)).rejects.toThrow();
  });

  it("rejects PDFs and other non-image MIME types", async () => {
    const file = new File([new Uint8Array(10)], "x.pdf", {
      type: "application/pdf",
    });
    await expect(normalizeToWebp(file)).rejects.toThrow("Unsupported");
  });
});

describe("normalizeToWebpVariants", () => {
  it("rejects unsupported MIME types before any decode", async () => {
    const file = new File([new Uint8Array(10)], "x.svg", {
      type: "image/svg+xml",
    });
    await expect(normalizeToWebpVariants(file)).rejects.toThrow("Unsupported");
  });
});
