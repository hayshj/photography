import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Navbar from '../components/Navbar';

function EditGallery() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [galleryId, setGalleryId] = useState(id);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`/api/gallery/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const gallery = res.data;
        setTitle(gallery.title);
        setDate(gallery.date);
        setGalleryId(gallery.galleryId);
        setCoverImage(gallery.coverImage?.filename || '');
        setExistingImages(gallery.images || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load gallery.');
        setLoading(false);
      }
    };

    fetchGallery();
  }, [id]);

  const onDrop = useCallback((acceptedFiles) => {
    setNewImages((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { 'image/*': [] }
  });

  const handleCoverSelect = (name) => {
    setCoverImage((prev) => (prev === name ? '' : name));
  };

  const removeNewImage = (index) => {
    const removed = newImages[index];
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    if (removed.name === coverImage) setCoverImage('');
  };

  const removeExistingImage = (img) => {
    setDeletedImages((prev) => [...prev, img]);
    setExistingImages((prev) => prev.filter((i) => i.filename !== img.filename));
    if (img.filename === coverImage) setCoverImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      const deletedFilenames = deletedImages.map(img => img.filename || img.name);

      await axios.put(
        `/api/gallery/${id}`,
        { title, date, galleryId, coverImage, deletedImages: deletedFilenames },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append('images', img));

        const coverFile = newImages.find((img) => img.name === coverImage);
        if (coverFile) formData.append('coverImage', coverFile);

        await axios.post(`/api/gallery/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Scroll to the top before redirect
      window.scrollTo(0, 0);

      // Redirect to the admin page
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Failed to update gallery.');
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

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen p-8">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 pt-20">
        <h1 className="text-3xl font-bold mb-6">Edit Gallery</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">Gallery Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border p-2 rounded"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border p-2 rounded"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Upload Additional Images</label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-6 rounded cursor-pointer transition ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} disabled={submitting} />
              <p className="text-center text-gray-600">
                Drag & drop images here, or click to select files
              </p>
            </div>
          </div>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="mt-4 h-72 overflow-y-auto border rounded p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div
                    key={img.filename}
                    className={`relative border rounded overflow-hidden group ${
                      img.filename === coverImage ? 'ring-4 ring-blue-500' : ''
                    }`}
                    onClick={() => !submitting && handleCoverSelect(img.filename)}
                  >
                    <img
                      src={`${img.url}`}
                      alt={img.filename}
                      className="object-cover w-full h-32"
                    />
                    <p className="text-xs text-center p-1 truncate">{img.filename}</p>

                    {img.filename === coverImage && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeExistingImage(img);
                      }}
                      disabled={submitting}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {newImages.map((file, index) => {
                  const preview = URL.createObjectURL(file);
                  return (
                    <div
                      key={index}
                      className={`relative border rounded overflow-hidden group ${
                        file.name === coverImage ? 'ring-4 ring-blue-500' : ''
                      }`}
                      onClick={() => !submitting && handleCoverSelect(file.name)}
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
                          removeNewImage(index);
                        }}
                        disabled={submitting}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGallery;
