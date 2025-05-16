import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState(null);

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/gallery', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGalleries(response.data);
      } catch (err) {
        console.error('Failed to load galleries:', err);
      }
    };
    fetchGalleries();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleEditGallery = (id) => {
    navigate(`/admin/edit/${id}`);
  };

  const openDeleteModal = (id) => {
    setGalleryToDelete(id);
    setModalOpen(true);
  };

  const confirmDeleteGallery = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/gallery/${galleryToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGalleries((prev) => prev.filter((g) => g.galleryId !== galleryToDelete));
      setModalOpen(false);
      setGalleryToDelete(null);
    } catch (err) {
      console.error('Failed to delete gallery:', err);
      alert('Failed to delete gallery. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 pt-[80px]">
      <Navbar />
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-black text-white px-4 py-2 rounded">
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Create Gallery Button */}
        <div
          onClick={() => navigate('/admin/create')}
          className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 transition rounded overflow-hidden p-4 text-center text-gray-600 hover:text-blue-600 shadow-md hover:shadow-lg"
        >
          <div className="text-6xl">+</div>
          <p className="text-lg font-semibold mt-4">Create Gallery</p>
        </div>

        {/* Existing Galleries */}
        {galleries.map((gallery) => (
          <div
            key={gallery.galleryId}
            className="relative border border-gray-300 overflow-hidden shadow-md hover:shadow-lg transition rounded"
          >
            <img
              src={
                gallery.coverImage?.url
                  ? `${gallery.coverImage.url}`
                  : '/default-cover.jpg'
              }
              alt={gallery.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{gallery.title}</h2>
                  <p className="text-gray-600 text-sm">{gallery.date}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditGallery(gallery.galleryId)}
                    className="text-yellow-600 hover:text-yellow-800"
                    aria-label="Edit gallery"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(gallery.galleryId)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete gallery"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete this gallery? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGallery}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
