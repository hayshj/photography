import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Gallery from '../components/Gallery';
import { ArrowLeft } from 'lucide-react';

function GalleryPage() {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(`/api/gallery/${id}`);
        setGallery(res.data);
      } catch (err) {
        console.error(err);
        setError('Gallery not found.');
      }
    };

    fetchGallery();
  }, [id]);

  return (
    <>
      <Navbar />
      <section className="pt-[60px] bg-white text-black min-h-screen">
      <div className="relative w-full py-6 px-6 mx-auto flex items-center justify-center">
        {/* Back Arrow pinned left, no overlap */}
        <button
          onClick={() => navigate('/gallery')}
          className="absolute left-6 text-black p-2"
          title="Back to Galleries"
        >
          <ArrowLeft size={32} />
        </button>

        {error ? (
          <p className="text-red-600 text-lg text-center w-full">{error}</p>
        ) : (
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center px-10 w-full">
            {gallery?.title}
          </h1>
        )}
      </div>


        {gallery && <Gallery id="gallery" images={gallery.images.slice(0, -1)} />}
      </section>
    </>
  );
}

export default GalleryPage;
