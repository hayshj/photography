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
      filename: String,
      url: String,
      thumbnailUrl: String
    }
  ],
  coverImage: {
    filename: String,
    url: String,
    thumbnailUrl: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', GallerySchema);
