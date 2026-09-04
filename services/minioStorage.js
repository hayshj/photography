const path = require('path');
const { Client } = require('minio');
const { IMAGE_WIDTHS, getVariantPath } = require('./imageProcessing');

const IMAGE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

const requiredSettings = [
  'MINIO_ENDPOINT',
  'MINIO_PORT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'MINIO_BUCKET'
];

for (const setting of requiredSettings) {
  if (!process.env[setting]) {
    throw new Error(`${setting} must be configured for MinIO image uploads`);
  }
}

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  useSSL: String(process.env.MINIO_USE_SSL).toLowerCase() === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

const bucket = process.env.MINIO_BUCKET;

function contentTypeFor(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.webp') return 'image/webp';
  if (extension === '.png') return 'image/png';
  if (extension === '.gif') return 'image/gif';
  if (extension === '.avif') return 'image/avif';
  return 'image/jpeg';
}

async function uploadImageObject(objectKey, filePath) {
  return minioClient.fPutObject(bucket, objectKey, filePath, {
    'Content-Type': contentTypeFor(filePath),
    'Cache-Control': IMAGE_CACHE_CONTROL
  });
}

async function uploadGalleryImageAssets(galleryId, galleryDir, filename) {
  const originalPath = path.join(galleryDir, filename);
  const uploads = [
    uploadImageObject(`galleries/${galleryId}/${filename}`, originalPath),
    ...IMAGE_WIDTHS.map(width => uploadImageObject(
      `galleries/${galleryId}/.optimized/${width}/${filename}.webp`,
      getVariantPath(galleryDir, filename, width)
    ))
  ];

  await Promise.all(uploads);
}

module.exports = {
  IMAGE_CACHE_CONTROL,
  uploadGalleryImageAssets,
  uploadImageObject
};
