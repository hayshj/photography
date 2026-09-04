# Photography frontend

## MinIO image origin

The frontend converts image object keys to public MinIO URLs through
`src/imageUrls.js`. Set `MINIO_PUBLIC_BASE_URL` before the frontend build. This
is the only MinIO setting embedded in browser code; credentials and private S3
API settings remain server-only.

Copy existing image assets into the configured bucket with these object keys:

- `galleries/<galleryId>/<filename>`
- `galleries/<galleryId>/thumbnails/<filename>`
- `galleries/<galleryId>/.optimized/<width>/<filename>.webp`
- `site/hero.jpg`
- `site/hero-768.webp`
- `site/hero-1280.webp`
- `site/hero-1920.webp`

Before copying, run `npm run migrate:images:disk` once so every responsive width
(320, 640, 900, and 1400) exists. The public origin must allow anonymous reads.
Include the bucket path in `MINIO_PUBLIC_BASE_URL` if the public hostname does
not map directly to the bucket.
