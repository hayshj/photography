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
  const thumbFilename = filename.replace(/\.[^.]+$/, '.webp');
  const thumbPath = path.join(thumbDir, thumbFilename);
  if (fs.existsSync(thumbPath)) return null; // already done
  await sharp(srcPath)
    .resize(500, null, { withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(thumbPath);
  return thumbFilename;
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
        const thumbFilename = await generateThumbnail(srcPath, thumbDir, filename);
        if (thumbFilename) console.log(`  Thumbnailed: ${filename} → ${thumbFilename}`);
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

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'photo_gallery' });
  console.log('\nConnected to MongoDB');

  const galleries = await Gallery.find();
  console.log(`Updating ${galleries.length} galleries in DB...`);

  for (const gallery of galleries) {
    const galleryPath = `/galleries/${gallery.galleryId}`;
    let modified = false;

    for (const img of gallery.images) {
      const webpFilename = img.filename.replace(/\.[^.]+$/, '.webp');
      const expectedThumbUrl = `${galleryPath}/thumbnails/${webpFilename}`;
      if (img.thumbnailUrl !== expectedThumbUrl) {
        img.thumbnailUrl = expectedThumbUrl;
        modified = true;
      }
    }

    if (gallery.coverImage) {
      const webpFilename = gallery.coverImage.filename.replace(/\.[^.]+$/, '.webp');
      const expectedThumbUrl = `${galleryPath}/thumbnails/${webpFilename}`;
      if (gallery.coverImage.thumbnailUrl !== expectedThumbUrl) {
        gallery.coverImage.thumbnailUrl = expectedThumbUrl;
        modified = true;
      }
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
