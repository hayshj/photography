/* global __MINIO_PUBLIC_BASE_URL__, __IMAGE_ASSET_VERSION__ */
const MINIO_PUBLIC_BASE_URL = __MINIO_PUBLIC_BASE_URL__;
const IMAGE_ASSET_VERSION = __IMAGE_ASSET_VERSION__;
const GALLERY_URL_PATTERN = /^\/?galleries\/([^/]+)\/(.+)$/;

function encodeObjectKey(objectKey) {
  return objectKey.split('/').filter(Boolean).map(segment => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  }).join('/');
}

export function getImageUrl(objectKey) {
  if (!objectKey) return '';
  if (/^(?:blob:|data:)/i.test(objectKey)) return objectKey;

  const normalizedKey = String(objectKey)
    .replace(/^https?:\/\/[^/]+\//i, '')
    .replace(/^\/+/, '');

  if (!MINIO_PUBLIC_BASE_URL) {
    throw new Error('MINIO_PUBLIC_BASE_URL must be configured when building the frontend');
  }

  return `${MINIO_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${encodeObjectKey(normalizedKey)}?v=${encodeURIComponent(IMAGE_ASSET_VERSION)}`;
}

export function imageObjectKey(image) {
  const storedPath = image?.objectKey || image?.url || '';
  const match = storedPath.match(GALLERY_URL_PATTERN);
  if (match) return `galleries/${match[1]}/${image.filename || match[2]}`;
  return storedPath;
}

export function originalImageUrl(image) {
  return getImageUrl(imageObjectKey(image));
}

export function optimizedImageUrl(image, width) {
  const originalKey = imageObjectKey(image);
  const match = originalKey.match(GALLERY_URL_PATTERN);
  if (!match) return getImageUrl(image?.thumbnailUrl || originalKey);

  const [, galleryId] = match;
  const filename = image.filename || match[2];
  return getImageUrl(`galleries/${galleryId}/.optimized/${width}/${filename}.webp`);
}

export function optimizedImageSrcSet(image, widths) {
  return widths.map(width => `${optimizedImageUrl(image, width)} ${width}w`).join(', ');
}
