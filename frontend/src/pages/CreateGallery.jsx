import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Navbar from '../components/Navbar';

function CreateGallery() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [galleryId, setGalleryId] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: false,
    webkitdirectory: 'true',
    multiple: true,
    accept: { 'image/*': [] }
  });

  const handleCoverSelect = (file) => {
    setCoverImage((prev) => (prev === file.name ? null : file.name));
  };

  const removeImage = (indexToRemove) => {
    const removed = images[indexToRemove];
    const updated = images.filter((_, i) => i !== indexToRemove);
    setImages(updated);
    if (removed.name === coverImage) {
      setCoverImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !galleryId || !date || images.length === 0) {
      setError('Please fill out all fields and select at least one image.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');

      await axios.post(
        '/api/gallery',
        { title, date, galleryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formData = new FormData();
      images.forEach((img) => formData.append('images', img));
      if (coverImage) {
        const file = images.find((img) => img.name === coverImage);
        if (file) formData.append('coverImage', file);
      }

      await axios.post(`/api/gallery/${galleryId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Scroll to the top before redirect
      window.scrollTo(0, 0);

      // Redirect to the admin page
      navigate('/admin');
    } catch (err) {
      console.error('Error creating gallery:', err);
      if (err.response?.status === 409) {
        setError('A gallery with this ID already exists.');
      } else {
        setError('There was a problem creating the gallery. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Button handler
  const handleCancel = () => {
    // Scroll to the top before navigating
    window.scrollTo(0, 0);
    // Navigate back to the admin page
    navigate('/admin');
  };

  return (
    <div className="min-h-screen p-8">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pt-10">
        <h1 className="text-3xl font-bold mb-6">Create New Gallery</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Gallery Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Gallery ID (e.g. spring-2025)</label>
            <input
              type="text"
              value={galleryId}
              onChange={(e) => setGalleryId(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={submitting}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Drag and Drop Images or Folders</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-6 rounded cursor-pointer transition ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} disabled={submitting} />
              <p className="text-center text-gray-600">
                {isDragActive
                  ? 'Drop the files here ...'
                  : 'Drag & drop images here, or click to select files'}
              </p>
            </div>

            {images.length > 0 && (
              <div className="mt-4 h-72 overflow-y-auto border rounded p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((file, index) => {
                    const preview = URL.createObjectURL(file);
                    return (
                      <div
                        key={index}
                        className={`relative border rounded overflow-hidden group ${
                          file.name === coverImage ? 'ring-4 ring-blue-500' : ''
                        }`}
                        onClick={() => !submitting && handleCoverSelect(file)}
                      >
                        <img
                          src={preview}
                          alt={file.name}
                          className="object-cover w-full h-32"
                        />
                        <p className="text-xs text-center p-1 truncate">{file.name}</p>

                        {file.name === coverImage && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Cover
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          disabled={submitting}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="w-1/2 bg-gray-300 hover:bg-gray-400 text-black px-6 py-3 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`w-1/2 text-white px-6 py-3 rounded ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Creating...' : 'Create Gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateGallery;
