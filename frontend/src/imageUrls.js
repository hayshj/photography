const GALLERY_URL_PATTERN = /^\/galleries\/([^/]+)\/([^/]+)$/;

export function optimizedImageUrl(image, width) {
  const originalUrl = image?.url;
  const match = originalUrl?.match(GALLERY_URL_PATTERN);

  if (!match) return image?.thumbnailUrl || originalUrl || '';

  const [, galleryId] = match;
  const filename = image.filename || match[2];
  return `/api/image/${encodeURIComponent(galleryId)}/${encodeURIComponent(filename)}?w=${width}`;
}

export function optimizedImageSrcSet(image, widths) {
  return widths
    .map(width => `${optimizedImageUrl(image, width)} ${width}w`)
    .join(', ');
}
