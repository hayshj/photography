import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroFallback from '../assets/hero.jpg';
import hero768 from '../assets/hero-768.webp';
import hero1280 from '../assets/hero-1280.webp';
import hero1920 from '../assets/hero-1920.webp';
import HomeNavbar from '../components/HomeNavbar';
import Gallery from '../components/Gallery';

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
            srcSet={`${hero768} 768w, ${hero1280} 1280w, ${hero1920} 1920w`}
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
      <section className="bg-white text-black">
        <div className="text-center py-8">
        {error ? (
          <p className="text-red-600 text-lg">{error}</p>
        ) : !gallery ? (
          <p className="text-gray-500 text-lg">Loading gallery...</p>
        ) : null}
        </div>
        {gallery && <Gallery id="portfolio" images={gallery.images} downloadable={false}/>}
      </section>
    </>
  );
}

export default Home;
