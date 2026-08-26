const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const router = express.Router();
const galleriesDir = path.join(__dirname, '..', '..', 'galleries');
const allowedWidths = new Set([320, 640, 900, 1400]);
const pendingTransforms = new Map();

function isSafeSegment(value) {
  return value &&
    value !== '.' &&
    value !== '..' &&
    value === path.basename(value) &&
    !value.includes('\0');
}

function findSource(galleryDir, filename, width) {
  const parsed = path.parse(filename);
  const original = path.join(galleryDir, filename);

  if (width <= 900) {
    const thumbnailCandidates = [
      path.join(galleryDir, 'thumbnails', filename),
      path.join(galleryDir, 'thumbnails', `${parsed.name}.webp`)
    ];
    const thumbnail = thumbnailCandidates.find(candidate => fs.existsSync(candidate));
    if (thumbnail) return thumbnail;
  }

  return fs.existsSync(original) ? original : null;
}

async function createOptimizedImage(sourcePath, cachePath, width) {
  await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
  const temporaryPath = `${cachePath}.${process.pid}.${Date.now()}.tmp.webp`;

  try {
    await sharp(sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width >= 1400 ? 72 : width >= 900 ? 76 : 72, effort: 4 })
      .toFile(temporaryPath);
    await fs.promises.rename(temporaryPath, cachePath);
  } finally {
    await fs.promises.rm(temporaryPath, { force: true });
  }
}

router.get('/:galleryId/:filename', async (req, res) => {
  const { galleryId, filename } = req.params;
  const width = Number.parseInt(req.query.w, 10);

  if (!isSafeSegment(galleryId) || !isSafeSegment(filename) || !allowedWidths.has(width)) {
    return res.status(400).json({ error: 'Invalid image request' });
  }

  const galleryDir = path.join(galleriesDir, galleryId);
  const sourcePath = findSource(galleryDir, filename, width);
  if (!sourcePath) return res.status(404).json({ error: 'Image not found' });

  const cacheFilename = `${filename}.webp`;
  const cachePath = path.join(galleryDir, '.optimized', String(width), cacheFilename);

  try {
    if (!fs.existsSync(cachePath)) {
      if (!pendingTransforms.has(cachePath)) {
        const transform = createOptimizedImage(sourcePath, cachePath, width)
          .finally(() => pendingTransforms.delete(cachePath));
        pendingTransforms.set(cachePath, transform);
      }
      await pendingTransforms.get(cachePath);
    }

    return res.sendFile(cachePath, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'image/webp'
      }
    });
  } catch (error) {
    console.error('Image optimization error:', error);
    return res.status(500).json({ error: 'Failed to optimize image' });
  }
});

module.exports = router;
