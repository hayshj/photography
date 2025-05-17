import React, { useEffect, useState } from 'react';
import axios from 'axios';
import backgroundImage from '../assets/hero.jpg';
import HomeNavbar from '../components/HomeNavbar';
import Gallery from '../components/Gallery';

function Home() {
  const [gallery, setGallery] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get('/api/gallery/portfolio');
        setGallery(res.data);
      } catch (err) {
        console.error(err);
        setError('Gallery not found.');
      }
    };

    fetchGallery();
  }, []);

  return (
    <>
      <HomeNavbar />

      {/* Hero Section */}
      <div
        className="pt-[60px] flex flex-col justify-center items-center text-white text-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100svh',
        }}
      >
        <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">
          Hayden Hays Photography
        </h1>
        <p className="text-xl mb-6 drop-shadow-md">
          Capturing life, one frame at a time
        </p>
        <div className="flex gap-4">
          <a href="/gallery">
            <button className="bg-white text-black px-6 py-3 text-base hover:bg-gray-200 transition">
              View Galleries
            </button>
          </a>
          <a href="/contact">
            <button className="border border-white text-white px-6 py-3 text-base hover:bg-white hover:text-black transition">
              Contact Me
            </button>
          </a>
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
