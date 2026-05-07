import type { Ctx, MilkdownPlugin } from "@milkdown/ctx";
import type { Node as ProseNode } from "@milkdown/prose/model";
import type { NodeViewConstructor } from "@milkdown/prose/view";
import { $node, $remark, $view } from "@milkdown/utils";

import { visit } from "unist-util-visit";

type MdastNode = { type: string; [key: string]: unknown };
type MdastParent = MdastNode & { children: MdastNode[] };

const NODE_NAME = "image-block";
const HTML_IMG_RE = /^<img\b([^>]*?)\s*\/?>\s*$/i;
const HTML_FIGURE_RE = /^<figure\b[^>]*>([\s\S]*?)<\/figure>\s*$/i;
const HTML_IMG_INSIDE_RE = /<img\b([^>]*?)\s*\/?>/i;
const HTML_FIGCAPTION_RE = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i;

const CAPTION_ICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h10M7 16h6"/></svg>`;

export type WidthPreset = {
  label: string;
  value: number | null;
};

export const WIDTH_PRESETS: WidthPreset[] = [
  { label: "S", value: 320 },
  { label: "M", value: 640 },
  { label: "L", value: 1024 },
  { label: "Full", value: null },
];

type ImageAttrs = {
  src: string;
  alt: string;
  width: number | null;
  caption: string;
};

type ImageMdastNode = MdastNode & {
  url?: string;
  alt?: string;
  width?: number | null;
  caption?: string;
};

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function decodeText(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

function parseImgAttrs(attrString: string): Partial<ImageAttrs> {
  const out: Partial<ImageAttrs> = {};
  const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null = re.exec(attrString);
  while (match !== null) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? "";
    if (key === "src") out.src = value;
    else if (key === "alt") out.alt = value;
    else if (key === "width") {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) out.width = Math.round(n);
    }
    match = re.exec(attrString);
  }
  return out;
}

export const imageBlockNode = $node(NODE_NAME, () => ({
  inline: false,
  group: "block",
  selectable: true,
  draggable: true,
  isolating: true,
  marks: "",
  atom: true,
  priority: 100,
  attrs: {
    src: { default: "", validate: "string" },
    alt: { default: "", validate: "string" },
    width: { default: null },
    caption: { default: "", validate: "string" },
  },
  parseDOM: [
    {
      tag: "img",
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) return false;
        const widthAttr = dom.getAttribute("width");
        const widthNum = widthAttr ? Number(widthAttr) : Number.NaN;
        return {
          src: dom.getAttribute("src") ?? "",
          alt: dom.getAttribute("alt") ?? "",
          width: Number.isFinite(widthNum) && widthNum > 0
            ? Math.round(widthNum)
            : null,
        };
      },
    },
  ],
  toDOM: (node) => {
    const { src, alt, width, caption } = node.attrs as ImageAttrs;
    const imgAttrs: Record<string, string> = { src, alt };
    if (typeof width === "number") imgAttrs.width = String(width);
    if (!caption) return ["img", imgAttrs];
    return ["figure", {}, ["img", imgAttrs], ["figcaption", {}, caption]];
  },
  parseMarkdown: {
    match: ({ type }) => type === NODE_NAME,
    runner: (state, node, type) => {
      const n = node as ImageMdastNode;
      state.addNode(type, {
        src: n.url ?? "",
        alt: n.alt ?? "",
        width: typeof n.width === "number" ? n.width : null,
        caption: typeof n.caption === "string" ? n.caption : "",
      });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === NODE_NAME,
    runner: (state, node) => {
      const { src, alt, width, caption } = node.attrs as ImageAttrs;
      state.openNode("paragraph");
      if (width === null && caption === "") {
        state.addNode("image", undefined, undefined, { url: src, alt });
      } else {
        const widthAttr = typeof width === "number" ? ` width="${width}"` : "";
        const imgTag = `<img src="${escapeAttr(src)}" alt="${
          escapeAttr(alt)
        }"${widthAttr} />`;
        if (caption === "") {
          state.addNode("html", undefined, imgTag);
        } else {
          const figcaption = `<figcaption>${escapeText(caption)}</figcaption>`;
          state.addNode(
            "html",
            undefined,
            `<figure>${imgTag}${figcaption}</figure>`,
          );
        }
      }
      state.closeNode();
    },
  },
}));

export const remarkImageBlock = $remark(
  "remark-image-block-resize",
  () => () => (ast): void => {
    visit(
      ast as unknown as MdastNode,
      "paragraph",
      (node, index, parent): void => {
        const p = parent as MdastParent | undefined;
        if (p === undefined || index === undefined) return;
        const paragraph = node as MdastParent;
        if (paragraph.children.length !== 1) return;
        const child = paragraph.children[0];

        if (child.type === "image") {
          const img = child as ImageMdastNode;
          p.children.splice(index, 1, {
            type: NODE_NAME,
            url: img.url ?? "",
            alt: img.alt ?? "",
            width: null,
            caption: "",
          });
          return;
        }

        if (child.type !== "html") return;
        const value = (child as { value?: string }).value ?? "";

        const figure = HTML_FIGURE_RE.exec(value);
        if (figure) {
          const inner = figure[1] ?? "";
          const imgMatch = HTML_IMG_INSIDE_RE.exec(inner);
          if (!imgMatch) return;
          const attrs = parseImgAttrs(imgMatch[1] ?? "");
          if (!attrs.src) return;
          const captionMatch = HTML_FIGCAPTION_RE.exec(inner);
          const caption = captionMatch
            ? decodeText((captionMatch[1] ?? "").trim())
            : "";
          p.children.splice(index, 1, {
            type: NODE_NAME,
            url: attrs.src,
            alt: attrs.alt ?? "",
            width: attrs.width ?? null,
            caption,
          });
          return;
        }

        const matched = HTML_IMG_RE.exec(value);
        if (!matched) return;
        const attrs = parseImgAttrs(matched[1] ?? "");
        if (!attrs.src) return;
        p.children.splice(index, 1, {
          type: NODE_NAME,
          url: attrs.src,
          alt: attrs.alt ?? "",
          width: attrs.width ?? null,
          caption: "",
        });
      },
    );
  },
);

export const imageBlockView = $view(
  imageBlockNode,
  (_ctx: Ctx): NodeViewConstructor => (initialNode, view, getPos) => {
    const dom = document.createElement("figure");
    dom.className = "milkdown-image-resize";

    const img = document.createElement("img");
    img.draggable = false;
    dom.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.className = "milkdown-image-resize__caption";
    figcaption.contentEditable = "false";
    const captionInput = document.createElement("input");
    captionInput.type = "text";
    captionInput.placeholder = "Add a caption…";
    captionInput.className = "milkdown-image-resize__caption-input";
    figcaption.appendChild(captionInput);
    dom.appendChild(figcaption);

    const popover = document.createElement("div");
    popover.className = "milkdown-image-resize__popover";
    popover.contentEditable = "false";

    let captionForcedOpen = Boolean(initialNode.attrs.caption);
    let saveTimer = 0;

    const commitAttrs = (patch: Partial<ImageAttrs>): void => {
      const pos = getPos();
      if (pos === undefined) return;
      const target = view.state.doc.nodeAt(pos);
      if (!target) return;
      view.dispatch(
        view.state.tr.setNodeMarkup(pos, undefined, {
          ...target.attrs,
          ...patch,
        }),
      );
    };

    const presetButtons = WIDTH_PRESETS.map(({ label, value }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "milkdown-image-resize__preset";
      btn.textContent = label;
      btn.dataset.value = value === null ? "full" : String(value);
      btn.addEventListener("mousedown", (e) => e.preventDefault());
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        commitAttrs({ width: value });
      });
      popover.appendChild(btn);
      return btn;
    });

    const captionToggleBtn = document.createElement("button");
    captionToggleBtn.type = "button";
    captionToggleBtn.className =
      "milkdown-image-resize__preset milkdown-image-resize__caption-toggle";
    captionToggleBtn.title = "Caption";
    captionToggleBtn.setAttribute("aria-label", "Toggle caption");
    captionToggleBtn.innerHTML = CAPTION_ICON_SVG;
    captionToggleBtn.addEventListener("mousedown", (e) => e.preventDefault());
    captionToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pos = getPos();
      if (pos === undefined) return;
      const target = view.state.doc.nodeAt(pos);
      if (!target) return;
      const hasCaption = (target.attrs.caption as string).length > 0;
      if (hasCaption) {
        captionForcedOpen = false;
        commitAttrs({ caption: "" });
      } else {
        captionForcedOpen = !captionForcedOpen;
        applyCaptionVisibility(target.attrs.caption as string);
        if (captionForcedOpen) captionInput.focus();
      }
    });
    popover.appendChild(captionToggleBtn);

    dom.appendChild(popover);

    const applyCaptionVisibility = (caption: string): void => {
      const visible = captionForcedOpen || caption.length > 0;
      figcaption.style.display = visible ? "" : "none";
      captionToggleBtn.classList.toggle("is-active", caption.length > 0);
    };

    const commitCaption = (): void => {
      const pos = getPos();
      if (pos === undefined) return;
      const target = view.state.doc.nodeAt(pos);
      if (!target) return;
      const next = captionInput.value;
      if (target.attrs.caption === next) return;
      commitAttrs({ caption: next });
    };

    captionInput.addEventListener("input", () => {
      globalThis.clearTimeout(saveTimer);
      saveTimer = globalThis.setTimeout(commitCaption, 500);
    });
    captionInput.addEventListener("blur", () => {
      globalThis.clearTimeout(saveTimer);
      commitCaption();
      if (captionInput.value.length === 0) {
        captionForcedOpen = false;
        applyCaptionVisibility("");
      }
    });

    const apply = (n: ProseNode): void => {
      img.src = n.attrs.src;
      img.alt = n.attrs.alt;
      const w = n.attrs.width as number | null;
      img.style.width = typeof w === "number" ? `${w}px` : "";
      presetButtons.forEach((b) => {
        const active = (w === null && b.dataset.value === "full") ||
          (typeof w === "number" && b.dataset.value === String(w));
        b.classList.toggle("is-active", active);
      });
      const caption = n.attrs.caption as string;
      if (
        captionInput !== document.activeElement &&
        captionInput.value !== caption
      ) {
        captionInput.value = caption;
      }
      applyCaptionVisibility(caption);
    };
    apply(initialNode);

    return {
      dom,
      update(updatedNode): boolean {
        if (updatedNode.type.name !== NODE_NAME) return false;
        apply(updatedNode);
        return true;
      },
      selectNode(): void {
        dom.classList.add("is-selected");
      },
      deselectNode(): void {
        dom.classList.remove("is-selected");
        if (captionInput.value.length === 0) {
          captionForcedOpen = false;
          applyCaptionVisibility("");
        }
      },
      stopEvent(event): boolean {
        return event.target instanceof HTMLButtonElement ||
          event.target instanceof HTMLInputElement;
      },
      ignoreMutation(): boolean {
        return true;
      },
      destroy(): void {
        globalThis.clearTimeout(saveTimer);
        dom.remove();
      },
    };
  },
);

export const imageResizePlugins: MilkdownPlugin[] = [
  remarkImageBlock,
  imageBlockNode,
  imageBlockView,
].flat();
