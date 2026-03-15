/**
 * One-time migration script: generates thumbnails for all existing gallery images
 * and updates MongoDB documents with thumbnailUrl.
 *
 * Usage:
 *   node generate-thumbnails.js          # generate disk thumbnails + update MongoDB
 *   node generate-thumbnails.js --disk   # generate disk thumbnails only (no MongoDB needed)
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
require('dotenv').config();

const galleriesDir = path.join(__dirname, 'galleries');
const diskOnly = process.argv.includes('--disk');

async function generateThumbnail(srcPath, thumbDir, filename) {
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  const thumbPath = path.join(thumbDir, filename);
  if (fs.existsSync(thumbPath)) return false; // already done
  await sharp(srcPath)
    .resize(900, null, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);
  return true;
}

async function generateDiskThumbnails() {
  const galleryFolders = fs.readdirSync(galleriesDir).filter(name => {
    const fullPath = path.join(galleriesDir, name);
    return fs.statSync(fullPath).isDirectory() && name !== 'thumbnails';
  });

  console.log(`Found ${galleryFolders.length} gallery folders on disk.`);

  for (const folder of galleryFolders) {
    const galleryDir = path.join(galleriesDir, folder);
    const thumbDir = path.join(galleryDir, 'thumbnails');
    const files = fs.readdirSync(galleryDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
    console.log(`\n[${folder}] ${files.length} images`);

    for (const filename of files) {
      const srcPath = path.join(galleryDir, filename);
      try {
        const created = await generateThumbnail(srcPath, thumbDir, filename);
        if (created) console.log(`  Thumbnailed: ${filename}`);
        else console.log(`  Skipped (exists): ${filename}`);
      } catch (err) {
        console.error(`  Error on ${filename}:`, err.message);
      }
    }
  }
}

async function updateMongoDB() {
  const mongoose = require('mongoose');
  const Gallery = require('./models/Gallery');

  await mongoose.connect(process.env.MONGO_URI);
  console.log('\nConnected to MongoDB');

  const galleries = await Gallery.find();
  console.log(`Updating ${galleries.length} galleries in DB...`);

  for (const gallery of galleries) {
    const galleryPath = `/galleries/${gallery.galleryId}`;
    let modified = false;

    for (const img of gallery.images) {
      if (!img.thumbnailUrl) {
        img.thumbnailUrl = `${galleryPath}/thumbnails/${img.filename}`;
        modified = true;
      }
    }

    if (gallery.coverImage && !gallery.coverImage.thumbnailUrl) {
      gallery.coverImage.thumbnailUrl = `${galleryPath}/thumbnails/${gallery.coverImage.filename}`;
      modified = true;
    }

    if (modified) {
      gallery.markModified('images');
      gallery.markModified('coverImage');
      await gallery.save();
      console.log(`  Updated: ${gallery.galleryId}`);
    }
  }

  await mongoose.disconnect();
  console.log('MongoDB updated.');
}

async function run() {
  await generateDiskThumbnails();
  if (!diskOnly) {
    await updateMongoDB();
  } else {
    console.log('\nDisk thumbnails done. Run without --disk to update MongoDB.');
  }
  console.log('\nAll done.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
