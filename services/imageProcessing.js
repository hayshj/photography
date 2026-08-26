const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGE_WIDTHS = [320, 640, 900, 1400];
const PREGENERATED_WIDTHS = [320, 640];

function qualityForWidth(width) {
  if (width >= 1400) return 72;
  if (width >= 900) return 76;
  return 72;
}

function getVariantPath(galleryDir, filename, width) {
  return path.join(galleryDir, '.optimized', String(width), `${filename}.webp`);
}

async function generateVariantBuffer(sourcePath, width) {
  return sharp(sourcePath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: qualityForWidth(width), effort: 4 })
    .toBuffer();
}

async function writeVariant(sourcePath, galleryDir, filename, width) {
  const outputPath = getVariantPath(galleryDir, filename, width);
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  const buffer = await generateVariantBuffer(sourcePath, width);
  await fs.promises.writeFile(outputPath, buffer);
}

async function generateResponsiveVariants(sourcePath, galleryDir, filename, options = {}) {
  const { skipExisting = false, widths = PREGENERATED_WIDTHS } = options;
  // Process widths sequentially for each photo to keep memory predictable.
  for (const width of widths) {
    if (skipExisting && fs.existsSync(getVariantPath(galleryDir, filename, width))) continue;
    await writeVariant(sourcePath, galleryDir, filename, width);
  }
}

async function readImageDimensions(filePath) {
  const metadata = await sharp(filePath).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const width = rotated ? metadata.height : metadata.width;
  const height = rotated ? metadata.width : metadata.height;

  return {
    width,
    height,
    aspectRatio: width && height ? width / height : undefined
  };
}

module.exports = {
  IMAGE_WIDTHS,
  PREGENERATED_WIDTHS,
  generateResponsiveVariants,
  generateVariantBuffer,
  getVariantPath,
  readImageDimensions
};
