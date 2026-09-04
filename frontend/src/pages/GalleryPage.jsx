import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Gallery from '../components/Gallery';
import { ArrowLeft } from 'lucide-react';
import { GalleryGridSkeleton } from '../components/LoadingStates';

function GalleryPage() {
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchGallery = async () => {
      try {
        const response = await fetch(`/api/gallery/${encodeURIComponent(id)}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Gallery not found');
        setGallery(await response.json());
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError('Gallery not found.');
      }
    };

    fetchGallery();
    return () => controller.abort();
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
            {gallery?.title || <span className="loading-shimmer block h-10 w-64 max-w-full mx-auto bg-gray-100 rounded" />}
          </h1>
        )}
      </div>


        {!gallery && !error && <GalleryGridSkeleton />}
        {gallery && <Gallery id="gallery" images={gallery.images || []} />}
      </section>
    </>
  );
}

export default GalleryPage;
