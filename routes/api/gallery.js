const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');
const verifyAdmin = require('../../middleware/verifyAdmin');
const Gallery = require('../../models/Gallery');
const {
  IMAGE_WIDTHS,
  generateResponsiveVariants,
  getVariantPath,
  readImageDimensions
} = require('../../services/imageProcessing');
const { uploadGalleryImageAssets } = require('../../services/minioStorage');

const router = express.Router();
const PUBLIC_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';

function setPublicCacheHeaders(res) {
  res.set({
    'Cache-Control': PUBLIC_CACHE_CONTROL,
    'Cloudflare-CDN-Cache-Control': PUBLIC_CACHE_CONTROL
  });
}
const uploadDir = path.join(__dirname, '..', '..', 'galleries');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const galleryPath = path.join(uploadDir, req.params.id);
    if (!fs.existsSync(galleryPath)) fs.mkdirSync(galleryPath, { recursive: true });
    cb(null, galleryPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${crypto.randomUUID()}-${path.basename(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, files: 501 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/'))
});

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

// ✅ GET all galleries
router.get('/', async (req, res) => {
  try {
    // Gallery cards only need metadata and the cover. Returning every image in
    // every gallery made this small page download the entire photo catalogue.
    const galleries = await Gallery.find()
      .select('galleryId title date coverImage')
      .sort({ date: -1 })
      .lean();
    setPublicCacheHeaders(res);
    res.json(galleries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch galleries' });
  }
});


// ✅ POST create new gallery
router.post('/', verifyAdmin, async (req, res) => {
  const { title, date, galleryId } = req.body;
  if (!title || !date || !galleryId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const exists = await Gallery.findOne({ galleryId });
    if (exists) {
      return res.status(409).json({ error: 'Gallery with this ID already exists' });
    }

    const newGallery = new Gallery({ title, date, galleryId, images: [] });
    await newGallery.save();
    res.status(201).json(newGallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating gallery' });
  }
});

// Helper: generate a WebP thumbnail, returns the thumbnail filename (with .webp extension)
async function generateThumbnail(filePath, thumbDir, filename) {
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  const thumbFilename = filename.replace(/\.[^.]+$/, '.webp');
  const thumbPath = path.join(thumbDir, thumbFilename);
  await sharp(filePath)
    .resize(900, null, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(thumbPath);
  return thumbFilename;
}

async function processUploadedImage(file, galleryDir, thumbDir, galleryPath) {
  const dimensions = await readImageDimensions(file.path);
  const thumbFilename = await generateThumbnail(file.path, thumbDir, file.filename);
  await generateResponsiveVariants(file.path, galleryDir, file.filename);
  await uploadGalleryImageAssets(path.basename(galleryDir), galleryDir, file.filename);

  return {
    originalName: file.originalname,
    entry: {
      filename: file.filename,
      url: `${galleryPath}/${file.filename}`,
      thumbnailUrl: `${galleryPath}/thumbnails/${thumbFilename}`,
      ...dimensions
    }
  };
}

// ✅ POST upload images & cover image
router.post('/:id/upload', verifyAdmin, upload.fields([
  { name: 'images' },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ galleryId: req.params.id });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const galleryPath = `/galleries/${req.params.id}`;
    const galleryDir = path.join(uploadDir, req.params.id);
    const thumbDir = path.join(uploadDir, req.params.id, 'thumbnails');
    const uploadedImages = req.files['images'] || [];
    const coverFiles = req.files['coverImage'] || [];

    const processedImages = await mapWithConcurrency(
      uploadedImages,
      2,
      file => processUploadedImage(file, galleryDir, thumbDir, galleryPath)
    );
    const newImageEntries = processedImages.map(({ entry }) => entry);

    gallery.images.push(...newImageEntries);

    let coverSetFromImages = false;
    if (req.body.coverOriginalName) {
      const coverMatch = processedImages.find(
        ({ originalName }) => originalName === req.body.coverOriginalName
      );
      if (coverMatch) {
        gallery.coverImage = coverMatch.entry;
        coverSetFromImages = true;
      }
    }

    if (!coverSetFromImages && coverFiles.length > 0) {
      const coverFile = coverFiles[0];
      const { entry: coverEntry } = await processUploadedImage(
        coverFile,
        galleryDir,
        thumbDir,
        galleryPath
      );

      if (!gallery.images.some(img => img.filename === coverEntry.filename)) {
        gallery.images.push(coverEntry);
      }

      gallery.coverImage = coverEntry;
    }

    await gallery.save();

    res.status(200).json({
      message: 'Images uploaded',
      images: newImageEntries,
      coverImage: gallery.coverImage || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// ✅ DELETE gallery
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findOneAndDelete({ galleryId: req.params.id });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const folderPath = path.join(uploadDir, req.params.id);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    res.status(200).json({ message: 'Gallery and files deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting gallery' });
  }
});

// ✅ GET gallery by ID
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ galleryId: req.params.id }).lean();
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
    setPublicCacheHeaders(res);
    res.json(gallery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// ✅ PUT update gallery metadata, cover image, and delete images
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { title, date, coverImage, deletedImages = [] } = req.body;

    const gallery = await Gallery.findOne({ galleryId: req.params.id });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });

    const folderPath = path.join(uploadDir, req.params.id);

    // Update metadata
    if (title) gallery.title = title;
    if (date) gallery.date = date;

    // Delete selected images
    gallery.images = gallery.images.filter(img => {
      const toDelete = deletedImages.includes(img.filename);
      if (toDelete) {
        const filePath = path.join(folderPath, img.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        const parsed = path.parse(img.filename);
        [
          path.join(folderPath, 'thumbnails', img.filename),
          path.join(folderPath, 'thumbnails', `${parsed.name}.webp`),
          ...IMAGE_WIDTHS.map(width => getVariantPath(folderPath, img.filename, width))
        ].forEach(assetPath => {
          if (fs.existsSync(assetPath)) fs.unlinkSync(assetPath);
        });
      }
      return !toDelete;
    });

    // If cover image was deleted, remove reference
    if (gallery.coverImage && deletedImages.includes(gallery.coverImage.filename)) {
      gallery.coverImage = undefined;
    }

    // Update cover image if it's now valid
    if (coverImage) {
      const matched = gallery.images.find(img => img.filename === coverImage);
      if (matched) gallery.coverImage = matched;
    }

    await gallery.save();
    res.status(200).json({ message: 'Gallery updated', gallery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update gallery' });
  }
});

// ✅ GET all galleries except 'portfolio'
router.get('/exclude/portfolio', async (req, res) => {
  try {
    const galleries = await Gallery.find({ galleryId: { $ne: 'portfolio' } })
      .select('galleryId title date coverImage')
      .sort({ date: -1 })
      .lean();
    setPublicCacheHeaders(res);
    res.json(galleries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch galleries excluding portfolio' });
  }
});


module.exports = router;
