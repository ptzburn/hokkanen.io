import { decode as decodeJpeg } from "@jsquash/jpeg";
import { decode as decodePng } from "@jsquash/png";
import resize from "@jsquash/resize";
import { decode as decodeWebp, encode as encodeWebp } from "@jsquash/webp";

const MAX_DIMENSION = 2560;
const WEBP_QUALITY = 90;
const WEBP_METHOD = 6;

const POST_IMAGE_VARIANT_WIDTHS = [640, 1280, MAX_DIMENSION] as const;

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export type ImageVariant = {
  body: Uint8Array;
  contentType: "image/webp";
  extension: "webp";
  width: number;
  height: number;
};

export async function normalizeToWebp(file: File): Promise<ImageVariant> {
  const decoded = await decodeFile(file);
  const sized = await fitMaxDim(decoded, MAX_DIMENSION);
  return await encodeVariant(sized);
}

export async function normalizeToWebpVariants(
  file: File,
  requestedWidths: readonly number[] = POST_IMAGE_VARIANT_WIDTHS,
): Promise<ImageVariant[]> {
  const decoded = await decodeFile(file);
  const sized = await fitMaxDim(decoded, MAX_DIMENSION);
  const sourceWidth = sized.width;

  const widths = [
    ...new Set([
      ...requestedWidths.filter((w) => w < sourceWidth),
      sourceWidth,
    ]),
  ].sort((a, b) => a - b);

  return await Promise.all(
    widths.map(async (w) => {
      const resized = await fitWidth(sized, w);
      return await encodeVariant(resized);
    }),
  );
}

async function decodeFile(file: File): Promise<ImageData> {
  const mime = file.type.toLowerCase();
  if (!SUPPORTED_MIME_TYPES.has(mime)) {
    throw new Error(
      `Unsupported image format: ${mime || "unknown"}. Use JPEG, PNG, or WebP.`,
    );
  }
  const buffer = await file.arrayBuffer();
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return await decodeJpeg(buffer);
  }
  if (mime === "image/png") return await decodePng(buffer);
  return await decodeWebp(buffer);
}

async function encodeVariant(image: ImageData): Promise<ImageVariant> {
  const encoded = await encodeWebp(image, {
    quality: WEBP_QUALITY,
    method: WEBP_METHOD,
  });
  return {
    body: new Uint8Array(encoded),
    contentType: "image/webp",
    extension: "webp",
    width: image.width,
    height: image.height,
  };
}

async function fitMaxDim(
  image: ImageData,
  maxDim: number,
): Promise<ImageData> {
  const max = Math.max(image.width, image.height);
  if (max <= maxDim) return image;
  const ratio = maxDim / max;
  return await resize(image, {
    width: Math.round(image.width * ratio),
    height: Math.round(image.height * ratio),
  });
}

async function fitWidth(
  image: ImageData,
  targetWidth: number,
): Promise<ImageData> {
  if (image.width === targetWidth) return image;
  const ratio = targetWidth / image.width;
  return await resize(image, {
    width: targetWidth,
    height: Math.round(image.height * ratio),
  });
}
