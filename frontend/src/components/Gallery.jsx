import React, { useEffect, useState } from 'react';
import { Download, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import Masonry from 'react-masonry-css';

function Gallery({ id, images, className = "", downloadable = true }) {
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (images && images.length >= 0) setLoading(false);
  
    const checkMobile = () => setIsMobile(window.innerWidth <= 850);
    checkMobile();
  
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [images]);
  

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
      else if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      else if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % images.length),
    onSwipedRight: () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    trackTouch: true,
    trackMouse: false
  });

  return (
    <section id={id} className={`pb-20 px-6 text-black min-h-screen ${className}`}>
      <div className="mx-auto">
        {loading ? (
          <div className="text-center pt-20">
            <div className="w-12 h-12 mx-auto border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-gray-500">No images found in this gallery.</p>
          </div>
        ) : (
          <Masonry
            breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
            className="flex w-auto -ml-4"
            columnClassName="pl-4"
          >
            {images.map((img, index) => (
              <div key={index} className="mb-4 relative overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.filename || `Gallery image ${index + 1}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setLightboxOpen(true);
                  }}
                  className="w-full h-auto shadow-lg cursor-pointer"
                />
                {downloadable && (
                  <>
                    <div className="absolute bottom-0 left-0 w-full h-18 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <a
                      href={img.url}
                      download={img.filename || `image-${index + 1}`}
                      className="absolute bottom-2 right-2 text-white text-xl rounded-full p-2 opacity-90 hover:opacity-100 transition"
                      title="Download Image"
                    >
                      <Download size={28} className="stroke-white stroke-2" />
                    </a>
                  </>
                )}
              </div>
            ))}
          </Masonry>
        )}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-black"
            aria-label="Close"
          >
            <X size={36} />
          </button>

          {/* Image with swipe handlers */}
          <div
            {...swipeHandlers}
            className="relative max-w-full max-h-[90vh] flex items-center justify-center"
          >
            <img
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain shadow-lg"
            />
            {downloadable && (
              <>
                <div className="absolute bottom-0 left-0 w-full h-18 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <a
                  href={images[currentIndex].url}
                  download={images[currentIndex].filename || `image-${currentIndex + 1}`}
                  className="absolute bottom-2 right-2 text-white text-xl rounded-full p-2 opacity-90 hover:opacity-100 transition"
                  title="Download Image"
                >
                  <Download size={28} className="stroke-white stroke-2" />
                </a>
              </>
            )}
          </div>

          {/* Arrows only on desktop */}
          {!isMobile && (
            <>
              <button
                onClick={() =>
                  setCurrentIndex((currentIndex - 1 + images.length) % images.length)
                }
                className="absolute left-4 text-black px-3 py-2 rounded hover:bg-black/10"
                aria-label="Previous"
              >
                <ArrowLeft size={36} />
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((currentIndex + 1) % images.length)
                }
                className="absolute right-4 text-black px-3 py-2 rounded hover:bg-black/10"
                aria-label="Next"
              >
                <ArrowRight size={36} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default Gallery;
