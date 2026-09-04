import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FadeInImage from '../components/FadeInImage';
import { optimizedImageSrcSet, optimizedImageUrl, originalImageUrl } from '../imageUrls';
import { GalleryCardsSkeleton } from '../components/LoadingStates';
function formatGalleryDate(date) {
  const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[2]}-${match[3]}-${match[1]}` : date;
}


function Galleries() {
  const [galleries, setGalleries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const controller = new AbortController();
    const fetchGalleries = async () => {
      try {
        const response = await fetch('/api/gallery/exclude/portfolio', {
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Failed to load galleries');
        setGalleries(await response.json());
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch galleries:', err);
        setError('Unable to load galleries. Please try again later.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchGalleries();
    return () => controller.abort();
  }, []);

  // Scroll to the top when navigating to the gallery page
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <>
      <Navbar />
      <section className="py-12 pt-[80px] px-6 bg-white text-black min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">Galleries</h1>

        {loading ? (
          <GalleryCardsSkeleton />
        ) : error ? (
          <p className="text-center text-red-600 mb-6">{error}</p> // Show error if there's an issue fetching data
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {galleries.map((gallery) => (
              <Link to={`/gallery/${gallery.galleryId}`} key={gallery.galleryId} onClick={scrollToTop}>
                <div className="border border-gray-300 overflow-hidden shadow-md hover:shadow-lg transition">
                  {gallery.coverImage ? (
                    <FadeInImage
                      src={optimizedImageUrl(gallery.coverImage, 900)}
                      srcSet={optimizedImageSrcSet(gallery.coverImage, [640, 900])}
                      sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 768px) calc(50vw - 2.5rem), 352px"
                      fallbackSrc={originalImageUrl(gallery.coverImage)}
                      alt={gallery.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                      No cover image
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{gallery.title}</h2>
                    <p className="text-gray-600 text-sm">{formatGalleryDate(gallery.date)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Galleries;
