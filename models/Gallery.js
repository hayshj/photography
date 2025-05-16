const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  galleryId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String, // e.g. "2025-05-06"
    required: true
  },
  images: [
    {
      filename: String,   // e.g. "sunset1.jpg"
      url: String         // e.g. "/images/gallery-id/sunset1.jpg"
    }
  ],
  coverImage: {
    filename: String,      // e.g. "cover.jpg"
    url: String            // e.g. "/images/gallery-id/cover.jpg"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', GallerySchema);
