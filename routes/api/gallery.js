const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const verifyAdmin = require('../../middleware/verifyAdmin');
const Gallery = require('../../models/Gallery');

const router = express.Router();
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
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ GET all galleries
router.get('/', async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ date: -1 }); // Sort by date descending
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

// Helper: generate a thumbnail for a given file path, return the thumbnail disk path
async function generateThumbnail(filePath, thumbDir, filename) {
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  const thumbPath = path.join(thumbDir, filename);
  await sharp(filePath)
    .resize(900, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);
  return thumbPath;
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
    const thumbDir = path.join(uploadDir, req.params.id, 'thumbnails');
    const uploadedImages = req.files['images'] || [];
    const coverFiles = req.files['coverImage'] || [];

    const newImageEntries = await Promise.all(uploadedImages.map(async (file) => {
      await generateThumbnail(file.path, thumbDir, file.filename);
      return {
        filename: file.filename,
        url: `${galleryPath}/${file.filename}`,
        thumbnailUrl: `${galleryPath}/thumbnails/${file.filename}`
      };
    }));

    gallery.images.push(...newImageEntries);

    if (coverFiles.length > 0) {
      const coverFile = coverFiles[0];
      await generateThumbnail(coverFile.path, thumbDir, coverFile.filename);
      const coverEntry = {
        filename: coverFile.filename,
        url: `${galleryPath}/${coverFile.filename}`,
        thumbnailUrl: `${galleryPath}/thumbnails/${coverFile.filename}`
      };

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
    const gallery = await Gallery.findOne({ galleryId: req.params.id });
    if (!gallery) return res.status(404).json({ error: 'Gallery not found' });
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
    const galleries = await Gallery.find({ galleryId: { $ne: 'portfolio' } }).sort({ date: -1 }); // Sort by date descending
    res.json(galleries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch galleries excluding portfolio' });
  }
});


module.exports = router;
