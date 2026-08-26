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
      thumbnailUrl: String,
      width: Number,
      height: Number,
      aspectRatio: Number
    }
  ],
  coverImage: {
    filename: String,
    url: String,
    thumbnailUrl: String,
    width: Number,
    height: Number,
    aspectRatio: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', GallerySchema);
