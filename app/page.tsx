// app/page.tsx

'use client';  // Mark this as a Client Component

import React from 'react';

// Define a mock list of image objects
const images = [
  { id: '1', url: '/images/photo1.jpg', title: 'Sunset at the Beach' },
  { id: '2', url: '/images/photo2.jpg', title: 'Mountain View' },
  { id: '3', url: '/images/photo3.jpg', title: 'City Skyline' },
  { id: '4', url: '/images/photo4.jpg', title: 'Forest Walk' },
];

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-neutral-800">Photo Gallery</h1>
        <p className="text-lg text-neutral-500">
          Welcome to the gallery. Enjoy the collection of beautiful photos!
        </p>
      </header>

      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image.id} className="rounded-lg shadow-lg overflow-hidden">
              <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-black">{image.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;