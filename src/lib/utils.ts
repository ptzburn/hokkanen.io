import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word.replace(
        /(^|-)(\w)/g,
        (_match, separator: string, char: string) =>
          separator + char.toUpperCase(),
      )
    )
    .join(" ");
}

export function getInitials(name: string): string {
  const names = name.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function getFileUrl(
  fileKey: string | null | undefined,
): string | undefined {
  if (!fileKey) return undefined;
  if (fileKey.startsWith("http")) return fileKey;
  return `${import.meta.env.VITE_S3_PUBLIC_URL}/${fileKey}`;
}

const VARIANT_URL_RE = /^(.+)-(\d+)\.webp$/;
const RESPONSIVE_WIDTHS = [640, 1280, 2560];

export type ImageResponsive = {
  src: string;
  srcset?: string;
  sizes?: string;
};

export function getResponsiveImage(
  fileKey: string | null | undefined,
  sizes = "(max-width: 768px) 100vw, 768px",
): ImageResponsive | undefined {
  const src = getFileUrl(fileKey);
  if (!src) return undefined;
  const match = VARIANT_URL_RE.exec(src);
  if (!match) return { src };
  const base = match[1];
  const masterWidth = Number(match[2]);
  const widths = RESPONSIVE_WIDTHS.filter((w) => w < masterWidth);
  widths.push(masterWidth);
  const srcset = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  return { src, srcset, sizes };
}

export function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return cleaned.slice(0, 80).replace(/-+$/, "");
}
