import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="w-full h-64 bg-gray-300 animate-pulse">
    <div className="w-full h-48 bg-gray-400"></div>
    <div className="p-4">
      <div className="w-3/4 h-6 bg-gray-400 mb-2"></div>
      <div className="w-1/2 h-4 bg-gray-400"></div>
    </div>
  </div>
);

function Galleries() {
  const [galleries, setGalleries] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const res = await axios.get('/api/gallery/exclude/portfolio'); // 👈 updated route
        setGalleries(res.data);
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        console.error('Failed to fetch galleries:', err);
        setError('Unable to load galleries. Please try again later.');
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchGalleries();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Show Skeleton loaders while galleries are loading */}
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 mb-6">{error}</p> // Show error if there's an issue fetching data
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {galleries.map((gallery) => (
              <Link to={`/gallery/${gallery.galleryId}`} key={gallery.galleryId} onClick={scrollToTop}>
                <div className="border border-gray-300 overflow-hidden shadow-md hover:shadow-lg transition">
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
                    <h2 className="text-xl font-semibold">{gallery.title}</h2>
                    <p className="text-gray-600 text-sm">{gallery.date}</p>
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
