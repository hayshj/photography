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
  const temporaryPath = `${cachePath}.${process.pid}.${Date.now()}.tmp.webp`;
  const buffer = await sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: width >= 1400 ? 72 : width >= 900 ? 76 : 72, effort: 4 })
    .toBuffer();

  try {
    await fs.promises.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.promises.writeFile(temporaryPath, buffer);
    await fs.promises.rename(temporaryPath, cachePath);
    return null;
  } catch (cacheError) {
    // Some production hosts have an ephemeral or read-only filesystem. The
    // optimized response can still be served and cached by the browser/CDN.
    console.warn('Image cache unavailable; serving from memory:', cacheError.message);
    return buffer;
  } finally {
    await fs.promises.rm(temporaryPath, { force: true }).catch(() => {});
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
    let optimizedBuffer = null;
    if (!fs.existsSync(cachePath)) {
      if (!pendingTransforms.has(cachePath)) {
        const transform = createOptimizedImage(sourcePath, cachePath, width)
          .finally(() => pendingTransforms.delete(cachePath));
        pendingTransforms.set(cachePath, transform);
      }
      optimizedBuffer = await pendingTransforms.get(cachePath);
    }

    const headers = {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/webp'
    };

    if (optimizedBuffer) {
      res.set(headers);
      return res.send(optimizedBuffer);
    }

    return res.sendFile(cachePath, {
      headers
    });
  } catch (error) {
    console.error('Image optimization error:', error);
    return res.status(500).json({ error: 'Failed to optimize image' });
  }
});

module.exports = router;
