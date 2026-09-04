import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroFallback from '../assets/hero.jpg';
import hero768 from '../assets/hero-768.webp';
import hero1280 from '../assets/hero-1280.webp';
import hero1920 from '../assets/hero-1920.webp';
import hero2560 from '../assets/hero-2560.webp';
import hero3599 from '../assets/hero-3599.webp';
import HomeNavbar from '../components/HomeNavbar';
import Gallery from '../components/Gallery';
import { GalleryGridSkeleton } from '../components/LoadingStates';

function Home() {
  const [gallery, setGallery] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery/portfolio', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to load portfolio');
        const data = await response.json();
        const shuffledImages = [...data.images].sort(() => Math.random() - 0.5);
        setGallery({ ...data, images: shuffledImages });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
        setError('Gallery not found.');
      }
    };

    fetchGallery();
    return () => controller.abort();
  }, []);

  return (
    <>
      <HomeNavbar />

      {/* Hero Section */}
      <div className="relative h-[100svh] overflow-hidden pt-[60px] flex flex-col justify-center items-center text-white text-center">
        <picture className="absolute inset-0" aria-hidden="true">
          <source
            type="image/webp"
            srcSet={`${hero768} 768w, ${hero1280} 1280w, ${hero1920} 1920w, ${hero2560} 2560w, ${hero3599} 3599w`}
            sizes="100vw"
          />
          <img
            src={heroFallback}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
        <div className="relative z-10 flex flex-col items-center px-6">
          <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">
            Hayden Hays Photography
          </h1>
          <p className="text-xl mb-6 drop-shadow-md">
            Capturing life, one frame at a time
          </p>
          <div className="flex gap-4">
            <Link to="/gallery" className="bg-white text-black px-6 py-3 text-base hover:bg-gray-200 transition">
              View Galleries
            </Link>
            <Link to="/contact" className="border border-white text-white px-6 py-3 text-base hover:bg-white hover:text-black transition">
              Contact Me
            </Link>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="bg-white text-black pt-16" aria-busy={!gallery && !error}>
        {error && (
          <div className="text-center pb-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}
        {!gallery && !error && <GalleryGridSkeleton />}
        {gallery && <Gallery id="portfolio" images={gallery.images} downloadable={false} />}
      </section>
    </>
  );
}

export default Home;
