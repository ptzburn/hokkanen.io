import { getResponsiveImage } from "~/lib/utils.ts";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const schema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "target",
      "rel",
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "width",
      "height",
      "loading",
      "decoding",
      "srcset",
      "sizes",
      ["dataZoomable", "true"],
    ],
  },
};

type HastElement = {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
};

function rehypeOptimizeImages(): (tree: unknown) => void {
  return (tree) => {
    visit(
      tree as never,
      "element",
      (node: HastElement): void => {
        if (node.tagName !== "img") return;
        const props = node.properties ?? (node.properties = {});
        if (props.loading === undefined) props.loading = "lazy";
        if (props.decoding === undefined) props.decoding = "async";
        if (props.dataZoomable === undefined) props.dataZoomable = "true";

        const src = typeof props.src === "string" ? props.src : null;
        if (src === null) return;
        const responsive = getResponsiveImage(src);
        if (responsive?.srcset && props.srcset === undefined) {
          props.srcset = responsive.srcset;
          if (props.sizes === undefined && responsive.sizes !== undefined) {
            props.sizes = responsive.sizes;
          }
        }
      },
    );
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeOptimizeImages)
  .use(rehypeExternalLinks, {
    target: "_blank",
    rel: ["noopener", "noreferrer"],
  })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
  const file = await processor.process(source);
  return String(file);
}
