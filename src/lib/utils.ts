import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { getRequestEvent } from "solid-js/web";
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

export function getServerHeaders(): Headers {
  const event = getRequestEvent();
  if (!event) {
    throw new Error("No request event available");
  }
  return event.request.headers;
}
