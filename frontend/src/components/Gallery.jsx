import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import FadeInImage from './FadeInImage';
import { optimizedImageSrcSet, optimizedImageUrl } from '../imageUrls';

const PRIORITY_IMAGE_COUNT = 3;
const DEFERRED_BATCH_SIZE = 9;

function Gallery({ id, images, className = "", downloadable = true }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRIORITY_IMAGE_COUNT);
  const [settledImages, setSettledImages] = useState(() => new Set());
  const loadMoreRef = useRef(null);
  const previousImagesRef = useRef(images);

  const visibleImages = useMemo(
    () => images.slice(0, visibleCount),
    [images, visibleCount]
  );
  const visibleBatchSettled = visibleImages.length > 0 &&
    visibleImages.every((_, index) => settledImages.has(index));

  const markImageSettled = useCallback((index) => {
    setSettledImages(previous => {
      if (previous.has(index)) return previous;
      const next = new Set(previous);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    if (previousImagesRef.current === images) return;
    previousImagesRef.current = images;
    setVisibleCount(PRIORITY_IMAGE_COUNT);
    setSettledImages(new Set());
  }, [images]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !visibleBatchSettled || visibleCount >= images.length) return undefined;

    if (!('IntersectionObserver' in window)) {
      setVisibleCount(current => Math.min(current + DEFERRED_BATCH_SIZE, images.length));
      return undefined;
    }

    let requestedNextBatch = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || requestedNextBatch) return;
      requestedNextBatch = true;
      setVisibleCount(current => Math.min(current + DEFERRED_BATCH_SIZE, images.length));
    }, { rootMargin: '800px 0px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [images.length, visibleBatchSettled, visibleCount]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 850);
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  // Keyboard navigation for lightbox
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

  // Keep forward lightbox navigation instant without downloading every original.
  useEffect(() => {
    if (!lightboxOpen || images.length < 2 || navigator.connection?.saveData) return;
    const nextIndex = (currentIndex + 1) % images.length;
    const preload = new Image();
    preload.src = optimizedImageUrl(images[nextIndex], 1400);
  }, [currentIndex, images, lightboxOpen]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % images.length),
    onSwipedRight: () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    trackTouch: true,
    trackMouse: false
  });

  return (
    <section id={id} className={`pb-20 px-6 text-black min-h-screen ${className}`}>
      <div className="mx-auto">
        {images.length === 0 ? (
          <div className="text-center pt-20">
            <p className="text-gray-500">No images found in this gallery.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 min-[701px]:grid-cols-2 min-[1101px]:grid-cols-3 gap-4 items-start">
              {visibleImages.map((img, index) => (
                <div key={img.filename || img.url || index} className="relative overflow-hidden bg-gray-100 self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="block w-full"
                    aria-label={`Open image ${index + 1} of ${images.length}`}
                  >
                    <FadeInImage
                      src={optimizedImageUrl(img, 640)}
                      srcSet={optimizedImageSrcSet(img, [320, 640])}
                      sizes="(max-width: 700px) calc(100vw - 3rem), (max-width: 1100px) calc(50vw - 2.5rem), calc(33vw - 2rem)"
                      fallbackSrc={img.url}
                      width={img.width}
                      height={img.height}
                      alt={img.filename || `Gallery image ${index + 1}`}
                      eager={index < PRIORITY_IMAGE_COUNT}
                      onSettled={() => markImageSettled(index)}
                      className="w-full h-auto shadow-lg cursor-pointer"
                    />
                  </button>
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
            </div>
            {visibleCount < images.length && (
              <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
            )}
          </>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-white flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${currentIndex + 1} of ${images.length}`}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-black"
            aria-label="Close"
            autoFocus
          >
            <X size={36} />
          </button>

          <div
            {...swipeHandlers}
            className="relative max-w-full max-h-[90vh] flex items-center justify-center"
          >
            <FadeInImage
              src={optimizedImageUrl(images[currentIndex], 900)}
              srcSet={optimizedImageSrcSet(images[currentIndex], [640, 900, 1400])}
              sizes="(max-width: 700px) 300px, 90vw"
              fallbackSrc={images[currentIndex].url}
              width={images[currentIndex].width}
              height={images[currentIndex].height}
              alt={`Image ${currentIndex + 1}`}
              eager
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
