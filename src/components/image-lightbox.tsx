import * as DialogPrimitive from "@kobalte/core/dialog";
import XIcon from "~icons/lucide/x";
import { type JSX, Show } from "solid-js";

export type LightboxImage = {
  src: string;
  srcset?: string;
  alt: string;
};

type ImageLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: LightboxImage | null;
};

export function ImageLightbox(props: ImageLightboxProps): JSX.Element {
  return (
    <DialogPrimitive.Root
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay class="data-[closed]:fade-out-0 data-[expanded]:fade-in-0 fixed inset-0 z-50 bg-black/85 data-[closed]:animate-out data-[expanded]:animate-in" />
        <DialogPrimitive.Content class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <Show when={props.image}>
            {(image) => (
              <img
                src={image().src}
                srcset={image().srcset}
                alt={image().alt}
                class="data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 max-h-full max-w-full rounded-lg object-contain shadow-2xl data-[closed]:animate-out data-[expanded]:animate-in"
              />
            )}
          </Show>
          <DialogPrimitive.CloseButton class="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white opacity-80 transition hover:cursor-pointer hover:bg-black/60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50">
            <XIcon class="size-5" />
            <span class="sr-only">Close</span>
          </DialogPrimitive.CloseButton>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function getLargestVariantUrl(img: HTMLImageElement): string {
  const fallback = img.currentSrc || img.src;
  if (!img.srcset) return fallback;
  let best: { url: string; w: number } = { url: fallback, w: 0 };
  for (const entry of img.srcset.split(",")) {
    const trimmed = entry.trim();
    const match = /^(\S+)\s+(\d+)w$/.exec(trimmed);
    if (!match) continue;
    const w = Number(match[2]);
    if (w > best.w) best = { url: match[1], w };
  }
  return best.url;
}
