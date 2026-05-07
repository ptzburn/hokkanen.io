import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown.ts";

describe("renderMarkdown — sanitization", () => {
  it("strips <script> tags", async () => {
    const html = await renderMarkdown(`Hello <script>alert(1)</script>`);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  it("strips inline event handler attributes", async () => {
    const html = await renderMarkdown(
      `<a href="/" onclick="alert(1)">x</a>`,
    );
    expect(html).not.toMatch(/onclick=/i);
  });

  it("strips javascript: URLs", async () => {
    const html = await renderMarkdown(
      `<a href="javascript:alert(1)">click</a>`,
    );
    expect(html).not.toMatch(/href=["']?javascript:/i);
  });

  it("strips dangerous tags inserted as raw HTML", async () => {
    const html = await renderMarkdown(
      `Hello <iframe src="https://evil.test"></iframe>`,
    );
    expect(html).not.toContain("<iframe");
  });
});

describe("renderMarkdown — link enhancement", () => {
  it("adds target=_blank and rel=noopener,noreferrer to external links", async () => {
    const html = await renderMarkdown(`[ext](https://example.com)`);
    expect(html).toContain('target="_blank"');
    expect(html).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(html).toMatch(/rel="[^"]*noreferrer[^"]*"/);
  });

  it("does not add target/rel to relative links", async () => {
    const html = await renderMarkdown(`[home](/about)`);
    expect(html).not.toContain('target="_blank"');
  });
});

describe("renderMarkdown — image enhancement", () => {
  it("adds loading, decoding, and data-zoomable on <img>", async () => {
    const html = await renderMarkdown(`![alt](https://cdn.test/photo.jpg)`);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toMatch(/data-zoomable=/i);
  });

  it("generates a srcset for variant URLs", async () => {
    const html = await renderMarkdown(
      `![alt](https://cdn.test/posts/1/img-1280.webp)`,
    );
    expect(html).toMatch(/srcset=/);
    expect(html).toContain("img-640.webp 640w");
    expect(html).toContain("img-1280.webp 1280w");
  });

  it("does not include widths larger than the master in srcset", async () => {
    const html = await renderMarkdown(
      `![alt](https://cdn.test/posts/1/img-1280.webp)`,
    );
    expect(html).not.toContain("2560w");
  });

  it("emits no srcset for non-variant URLs", async () => {
    const html = await renderMarkdown(
      `![alt](https://cdn.test/posts/1/cover.webp)`,
    );
    expect(html).not.toMatch(/srcset=/);
  });
});

describe("renderMarkdown — allowed structural tags", () => {
  it("preserves <figure> and <figcaption>", async () => {
    const html = await renderMarkdown(
      `<figure><figcaption>cap</figcaption></figure>`,
    );
    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption");
  });

  it("renders GFM tables", async () => {
    const html = await renderMarkdown(`| a | b |\n|---|---|\n| 1 | 2 |`);
    expect(html).toContain("<table");
    expect(html).toContain("<td>1</td>");
  });
});
